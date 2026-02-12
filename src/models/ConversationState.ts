export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    options?: string[]; // For buttons
}

export interface UserSession {
    id: string; // socket id, or random string
    stage: 'GREETING' | 'DATA_COLLECTION' | 'WAITING_FOR_DATA' | 'IDENTIFICATION' | 'OPEN_CHAT';
    userData?: {
        name?: string;
        phoneNumber?: string;
        userType?: 'new' | 'existing';
    };
    messages: Message[];
}

export interface ChatRequest {
    sessionId: string;
    message: string;
    userData?: { // Optional, can be sent directly
        name?: string;
        phoneNumber?: string;
    }
}

export interface ChatResponse {
    message: string;
    options?: string[];
    stage?: string;
}
