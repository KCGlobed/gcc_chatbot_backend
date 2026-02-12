import * as readline from 'readline';
import { ChatService } from '../services/ChatService';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const chatService = new ChatService();
const sessionId = uuidv4();

console.log("Starting CMD Chatbot... (Type 'exit' to quit)");
console.log("-----------------------------------------------");

// Initial greeting
chatService.handleMessage(sessionId, "").then(response => {
    console.log(`Bot: ${response.message}`);
    if (response.options) {
        console.log(`[Options]: ${response.options.join(", ")}`);
    }
    prompt();
});

function prompt() {
    rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        try {
            const response = await chatService.handleMessage(sessionId, input);
            console.log(`Bot: ${response.message}`);
            if (response.options) {
                console.log(`[Options]: ${response.options.join(", ")}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }

        prompt();
    });
}
