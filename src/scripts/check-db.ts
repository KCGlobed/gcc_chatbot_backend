import { VectorStoreService } from "../services/VectorStoreService";
import * as dotenv from "dotenv";

dotenv.config();

async function checkDB() {
    console.log("Checking ChromaDB status...");
    const vectorStoreService = new VectorStoreService();
    try {
        await vectorStoreService.init();
        const count = await vectorStoreService.getDocumentCount();
        console.log(`\nDocument Count in Collection: ${count}`);

        if (count > 0) {
            console.log("✅ Data is ingested in the Dockerized ChromaDB.");

            // Optional: Test a search
            console.log("\nTesting search for 'admission'...");
            const results = await vectorStoreService.similaritySearch("admission");
            console.log(`Found ${results.length} results.`);
            if (results.length > 0) {
                console.log(`Sample: ${results[0].pageContent.substring(0, 100)}...`);
            }
        } else {
            console.log("❌ No documents found. Please run 'npx ts-node src/scripts/ingest.ts'");
        }
    } catch (error) {
        console.error("Error connecting to ChromaDB:", error);
    }
}

checkDB();
