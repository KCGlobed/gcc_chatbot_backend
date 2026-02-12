import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import * as dotenv from "dotenv";

dotenv.config();

export class VectorStoreService {
    private vectorStore: Chroma | null = null;
    private embeddings: OpenAIEmbeddings;
    private collectionName: string;

    constructor(collectionName: string = "gcc-knowledge-base") {
        this.collectionName = collectionName;
        this.embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
        });
    }

    async init() {
        this.vectorStore = new Chroma(this.embeddings, {
            collectionName: this.collectionName,
            url: `http://${process.env.CHROMA_HOST || '127.0.0.1'}:${process.env.CHROMA_PORT || '8000'}`,
        });
    }

    async addDocuments(docs: any[]) {
        if (!this.vectorStore) await this.init();

        // Sanitize metadata to ensure compatibility with ChromaDB
        const sanitizedDocs = docs.map((doc) => {
            const sanitizedMetadata: Record<string, string | number | boolean> = {};
            for (const [key, value] of Object.entries(doc.metadata)) {
                if (value !== null && value !== undefined && typeof value !== 'object') {
                    // @ts-ignore
                    sanitizedMetadata[key] = value;
                }
            }
            return { ...doc, metadata: sanitizedMetadata };
        });

        await this.vectorStore!.addDocuments(sanitizedDocs);
    }

    async similaritySearch(query: string, k: number = 3) {
        if (!this.vectorStore) await this.init();
        return await this.vectorStore!.similaritySearch(query, k);
    }

    async similaritySearchWithScore(query: string, k: number = 3) {
        if (!this.vectorStore) await this.init();
        return await this.vectorStore!.similaritySearchWithScore(query, k);
    }

    async getRetriever() {
        if (!this.vectorStore) await this.init();
        return this.vectorStore!.asRetriever();
    }

    async getDocumentCount(): Promise<number> {
        if (!this.vectorStore) await this.init();
        // @ts-ignore
        const collection = await this.vectorStore!.ensureCollection();
        return await collection.count();
    }
}
