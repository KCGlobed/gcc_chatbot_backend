import { WebCrawlerService } from "../services/WebCrawlerService";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { VectorStoreService } from "../services/VectorStoreService";
import * as dotenv from "dotenv";

dotenv.config();

const urls = [
    "https://www.kcglobed.com/",
    "https://www.kcglobed.com/course/ea",
    "https://www.kcglobed.com/course/cma",
    "https://www.kcglobed.com/course/cpa",
    "https://www.kcglobed.com/about-us",
    "https://www.kcglobed.com/contactus"
];

async function ingestWeb() {
    console.log("Starting web ingestion...");
    const crawler = new WebCrawlerService();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const vectorStoreService = new VectorStoreService("kcg-web-content");

    for (const url of urls) {
        console.log(`Processing ${url}...`);
        const text = await crawler.crawl(url);

        if (!text) {
            console.log(`Skipping empty/failed url: ${url}`);
            continue;
        }

        const docs = await splitter.createDocuments([text], [{ source: url }]);
        console.log(`  Split into ${docs.length} chunks.`);

        await vectorStoreService.addDocuments(docs);
    }

    console.log("Web ingestion complete!");
}

ingestWeb();
