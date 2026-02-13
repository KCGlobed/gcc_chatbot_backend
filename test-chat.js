
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/chat';
const SESSION_ID = 'test-session-' + Date.now();

async function sendMessage(message, userData = {}) {
    console.log(`\nUser: ${message}`);
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: SESSION_ID,
            message: message,
            userData: userData
        })
    });

    const data = await response.json();
    console.log('Bot:', data.message);
    if (data.options) {
        console.log('Options:', data.options);
    }
    return data;
}

async function runTest() {
    console.log("Starting Chatbot Flow Test...");

    // 1. Initial Greeting (Empty message or just check)
    await sendMessage("");

    // 2. User says Hi
    await sendMessage("Hi");

    // 3. User provides data
    await sendMessage("John Doe 9876543210");

    // 4. User selects "Explore Courses" (New Student behavior)
    await sendMessage("Explore Courses");

    // 5. Ask a question
    await sendMessage("What courses do you offer for science?");
}


if (!globalThis.fetch) {
    console.error("Fetch not available! Please use Node 18+");
    process.exit(1);
}

runTest().catch(console.error);
