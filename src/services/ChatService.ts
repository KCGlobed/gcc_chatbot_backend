import { LangChainService } from "./LangChainService";
import { UserSession, ChatRequest, ChatResponse, Message } from "../models/ConversationState";

import { DatabaseService } from "./DatabaseService";

export class ChatService {
    private langChainService: LangChainService;
    private dbService: DatabaseService;
    private sessions: Map<string, UserSession>;

    constructor() {
        this.langChainService = new LangChainService();
        this.dbService = new DatabaseService();
        this.sessions = new Map();
    }

    private getOrCreateSession(sessionId: string): UserSession {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                id: sessionId,
                stage: 'GREETING',
                messages: [],
                userData: {}
            });
        }
        return this.sessions.get(sessionId)!;
    }

    async handleMessage(sessionId: string, messageText: string, providedUserData?: any): Promise<ChatResponse> {
        const session = this.getOrCreateSession(sessionId);
        if (session.messages.length === 0 && session.stage === 'GREETING') {
            const greeting = "Hey! 👋 Welcome to GCC School!\n\nHow can I help you today?";

            session.messages.push({ role: 'assistant', content: greeting });
            session.stage = 'DATA_COLLECTION';

            return {
                message: greeting,
            };
        }

        if (session.stage === 'DATA_COLLECTION') {
            session.messages.push({ role: 'user', content: messageText })
            const askDataMsg = "Before we proceed, please enter your Name and Phone Number (e.g., John Doe, 9876543210).";
            session.messages.push({ role: 'assistant', content: askDataMsg });
            session.stage = 'WAITING_FOR_DATA';
            return { message: askDataMsg };
        }

        if (session.stage === 'WAITING_FOR_DATA') {
            console.log(`[DEBUG] Processing WAITING_FOR_DATA. Input: "${messageText}"`);
            session.messages.push({ role: 'user', content: messageText });

            if (!session.userData) {
                session.userData = {};
            }

            const phoneMatch = messageText.match(/\b\d{10,}\b/);
            if (phoneMatch) {
                console.log(`[DEBUG] Found phone: ${phoneMatch[0]}`);
                session.userData.phoneNumber = phoneMatch[0];
            } else {
                console.log(`[DEBUG] No phone match found in: "${messageText}"`);
            }

            let textForName = messageText;
            if (phoneMatch) {
                textForName = messageText.replace(phoneMatch[0], '');
            }

            const nameCandidate = textForName.replace(/[^a-zA-Z\s]/g, '').trim();
            console.log(`[DEBUG] Name candidate: "${nameCandidate}"`);

            if (nameCandidate.length > 2) {
                if (!session.userData.name) {
                    console.log(`[DEBUG] Setting name: ${nameCandidate}`);
                    session.userData.name = nameCandidate;
                }
            }

            const hasName = !!(session.userData.name && session.userData.name.length > 2);
            const hasPhone = !!(session.userData.phoneNumber && session.userData.phoneNumber.match(/\d{10,}/));

            console.log(`[DEBUG] State: hasName=${hasName}, hasPhone=${hasPhone}`);
            console.log(`[DEBUG] userData: ${JSON.stringify(session.userData)}`);

            if (hasName && hasPhone) {
                const name = session.userData.name!;
                const phoneNumber = session.userData.phoneNumber!;

                console.log(`[DEBUG] Completing data collection for ${name}, ${phoneNumber}`);

                await this.dbService.saveUser(name, phoneNumber);

                const uniqueOptions = ["Explore Courses", "Apply for Admission", "Access LMS / Student Login", "Talk to a counsellor", "Ask a Question"];
                const msg = `Thanks ${name}! Please select an option below:`;

                session.messages.push({ role: 'assistant', content: msg, options: uniqueOptions });
                session.stage = 'IDENTIFICATION';

                return {
                    message: msg,
                    options: uniqueOptions
                };
            } else {
                let errorMsg = "";
                if (!hasName && !hasPhone) {
                    const digits = messageText.replace(/\D/g, '');
                    if (digits.length > 0 && digits.length < 10) {
                        errorMsg = `I see a number, but it's too short (${digits.length} digits). Please provide your Name and a valid 10-digit Phone Number.`;
                    } else {
                        errorMsg = "Please provide your Name (at least 3 letters) and a Phone Number (at least 10 digits).";
                    }
                } else if (!hasName) {
                    errorMsg = "Thanks for the phone number! Please provide your Name (at least 3 letters).";
                } else {
                    const digits = messageText.replace(/\D/g, '');
                    console.log(`[DEBUG] Missing phone. Digits found: "${digits}" (length: ${digits.length})`);

                    if (digits.length > 0) {
                        if (digits.length < 10) {
                            errorMsg = `Thanks ${session.userData.name}! That number is too short (${digits.length} digits). Please provide a valid 10-digit Phone Number.`;
                        } else {
                            errorMsg = `Thanks ${session.userData.name}! Please provide a valid Phone Number (at least 10 digits).`;
                        }
                    } else {
                        errorMsg = `Thanks ${session.userData.name}! I didn't see a phone number. Please provide your 10-digit Phone Number.`;
                    }
                }

                console.log(`[DEBUG] Returning error: "${errorMsg}"`);
                session.messages.push({ role: 'assistant', content: errorMsg });
                return { message: errorMsg };
            }
        }

        if (session.stage === 'IDENTIFICATION') {
            session.messages.push({ role: 'user', content: messageText });
            if (messageText.includes("LMS") || messageText.includes("Login")) {
                session.userData!.userType = 'existing';
                const response = "As an existing student, do you need help with your login or course materials?";
                session.messages.push({ role: 'assistant', content: response });
                session.stage = 'OPEN_CHAT';
                return { message: response };
            } else if (messageText.includes("Explore") || messageText.includes("Admission") || messageText.includes("counsellor")) {
                session.userData!.userType = 'new';
                const response = "Great! We can help you with admissions and guidance. What course are you interested in?";
                session.messages.push({ role: 'assistant', content: response });
                session.stage = 'OPEN_CHAT';
                return { message: response };
            } else {
                session.userData!.userType = 'new';
            }
            session.stage = 'OPEN_CHAT';
        }

        session.messages.push({ role: 'user', content: messageText });
        const { content: aiResponse, confidence } = await this.langChainService.generateResponse(session.messages, messageText);
        session.messages.push({ role: 'assistant', content: aiResponse });

        await this.dbService.logEvent("CHAT_RESPONSE", {
            sessionId,
            userMessage: messageText,
            botMessage: aiResponse,
            confidence,
            userData: session.userData
        });

        return { message: aiResponse };
    }
}
