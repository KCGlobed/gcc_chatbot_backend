import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { VectorStoreService } from "./VectorStoreService";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";

dotenv.config();

export class LangChainService {
    private chatModel: ChatOpenAI;
    private embeddingModel: OpenAIEmbeddings;

    constructor() {
        this.chatModel = new ChatOpenAI({
            modelName: "gpt-5.2",
            temperature: 0.7,
        });

        this.embeddingModel = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
        });
    }

    async generateResponse(history: any[], userMessage: string): Promise<{ content: string, confidence: number }> {
        const vectorStore = new VectorStoreService("gcc-knowledge-base");
        // const webVectorStore = new VectorStoreService("gcc-web-content");

        let context = "";
        let avgScore = 0;

        try {
            const [pdfResults] = await Promise.all([
                vectorStore.similaritySearchWithScore(userMessage, 3),
                // webVectorStore.similaritySearchWithScore(userMessage, 3)
            ]);

            const allResults = [...pdfResults];

            allResults.sort((a, b) => a[1] - b[1]);

            // Take top 5
            const topResults = allResults.slice(0, 5);

            context = topResults.map(res => res[0].pageContent).join("\n\n");

            if (topResults.length > 0) {
                const totalDistance = topResults.reduce((sum, res) => sum + res[1], 0);
                const avgDistance = totalDistance / topResults.length;
                avgScore = 1 / (1 + avgDistance);
            }

            console.log("Context found:", topResults.length);
        } catch (e) {
            console.log("Vector store not ready or connection failed, proceeding without context.");
        }

        const messages = [
            new SystemMessage(`You are GCC School Bot, a helpful assistant for GCC School. You help with courses, admissions.

            Use the following context to answer the user's question.
            
            Important Instructions:
            - **Multilingual Support**: Detect the language of the user's message and reply in the SAME language.
            - **Moderation**: If the user uses abusive, offensive, or inappropriate language, strictly warn them to be respectful and DO NOT answer their query.
            - Answer directly and professionally.
            - Do NOT use phrases like "mentioned in the text", "according to the documents", or "as shared". 
            - Speak as if you possess this knowledge naturally.
            - If the answer is not in the context, just say you don't know based on the provided information, or provide general helpful info if appropriate.
            
            Context:
            ${context}
            `),
            ...history.map((msg: any) => msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)),
            new HumanMessage(userMessage)
        ];

        try {
            const response = await this.chatModel.invoke(messages as any);
            let content = "";

            if (typeof response.content === "string") {
                content = response.content;
            } else if (Array.isArray(response.content)) {
                content = response.content
                    .map(part => {
                        if (typeof part === "string") return part;
                        if (part && typeof part === "object" && "text" in part) {
                            return (part as any).text;
                        }
                        return "";
                    })
                    .join(" ");
            }

            return { content, confidence: avgScore };

        } catch (error) {
            console.error("LLM Error:", error);
            return { content: "I'm sorry, I encountered an error processing your request.", confidence: 0 };
        }
    }

    async getEmbedding(text: string): Promise<number[]> {
        return await this.embeddingModel.embedQuery(text);
    }

    async extractUserData(message: string): Promise<{ name?: string, phoneNumber?: string, intent?: 'provide_data' | 'refuse' | 'other' }> {
        const extractionPrompt = `
        Analyze the following user message effectively to extract Name and Phone Number.
        
        User Message: "${message}"

        Rules:
        1. Extract the **Name** if provided. It should be a proper name (e.g., "John Doe", "Rahul"). Ignore common words or refusal phrases.
        2. Extract the **Phone Number** if provided. It must be at least 10 digits.
        3. Determine the **Intent**:
           - 'provide_data': if the user is providing name or phone number.
           - 'refuse': if the user explicitly refuses to provide information (e.g., "I will not give my number").
           - 'other': if the user says something else unrelated.

        Respond ONLY in JSON format:
        {
            "name": "extracted name or null",
            "phoneNumber": "extracted phone or null",
            "intent": "provide_data | refuse | other"
        }
        `;

        try {
            const response = await this.chatModel.invoke([new SystemMessage(extractionPrompt)] as any);
            let content = typeof response.content === 'string' ? response.content : "";

            // Clean up code blocks if present
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();

            const data = JSON.parse(content);
            return {
                name: data.name || undefined,
                phoneNumber: data.phoneNumber || undefined,
                intent: data.intent
            };
        } catch (error) {
            console.error("Error extracting user data:", error);
            return { intent: 'other' };
        }
    }
}
