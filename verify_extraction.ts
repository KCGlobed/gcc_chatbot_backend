
import { LangChainService } from "./src/services/LangChainService";
import * as dotenv from "dotenv";

dotenv.config();

async function testExtraction() {
    const service = new LangChainService();

    const testCases = [
        "My name is John Doe and my number is 9876543210",
        "9876543210",
        "John Doe",
        "i will not provide the number",
        "Rahul, 9876543210",
        "Hello there",
        "I am not sharing my details"
    ];

    let output = "Starting Extraction Tests...\n\n";

    for (const text of testCases) {
        output += `Input: "${text}"\n`;
        try {
            const result = await service.extractUserData(text);
            output += "Result: " + JSON.stringify(result, null, 2) + "\n";
        } catch (e) {
            output += "Error: " + e + "\n";
        }
        output += "--------------------------------------------------\n";
    }

    require('fs').writeFileSync('extraction_results_utf8.txt', output, 'utf8');
    console.log("Extraction tests completed. Check extraction_results_utf8.txt");
}

testExtraction();
