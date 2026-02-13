
import { ChatService } from "./src/services/ChatService";
import * as dotenv from "dotenv";

dotenv.config();

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testChatFlow() {
    const chatService = new ChatService();
    const sessionId = "test-session-" + Date.now();

    console.log("Starting Chat Flow Test for Session:", sessionId);

    // 1. Initial Greeting
    console.log("\n--- Sending 'Hi' ---");
    let response = await chatService.handleMessage(sessionId, "Hi");
    console.log("Bot:", response.message);

    // 2. Bot asks for name/phone. User provides valid Name and Phone
    console.log("\n--- Sending 'My name is Rahul and number is 9876543210' ---");
    response = await chatService.handleMessage(sessionId, "My name is Rahul and number is 9876543210");
    console.log("Bot:", response.message);

    // 3. Reset and test partial data
    const sessionId2 = "test-session-2-" + Date.now();
    console.log("\n\nStarting Chat Flow Test 2 (Partial Data) for Session:", sessionId2);

    console.log("\n--- Sending 'Hi' ---");
    response = await chatService.handleMessage(sessionId2, "Hi");
    console.log("Bot:", response.message);

    console.log("\n--- Sending 'Rahul' (Only Name) ---");
    response = await chatService.handleMessage(sessionId2, "Rahul");
    console.log("Bot:", response.message);

    console.log("\n--- Sending '9876543210' (Phone) ---");
    response = await chatService.handleMessage(sessionId2, "9876543210");
    console.log("Bot:", response.message);

    // 4. Reset and test Refusal
    const sessionId3 = "test-session-3-" + Date.now();
    console.log("\n\nStarting Chat Flow Test 3 (Refusal) for Session:", sessionId3);

    console.log("\n--- Sending 'Hi' ---");
    response = await chatService.handleMessage(sessionId3, "Hi");
    console.log("Bot:", response.message);

    console.log("\n--- Sending 'I will not provide my number' ---");
    response = await chatService.handleMessage(sessionId3, "I will not provide my number");
    console.log("Bot:", response.message);
}

testChatFlow();
