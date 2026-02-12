import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

export class ChatController {
    private chatService: ChatService;

    constructor() {
        this.chatService = new ChatService();
    }

    public handleChat = async (req: Request, res: Response) => {
        try {
            const { sessionId, message, userData } = req.body;

            if (!sessionId) {
                return res.status(400).json({ error: "Session ID is required" });
            }

            const response = await this.chatService.handleMessage(sessionId, message || "", userData);
            return res.json(response);
        } catch (error: any) {
            console.error("Error in handleChat:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
