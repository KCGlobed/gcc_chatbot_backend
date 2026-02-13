import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { VectorStoreService } from "../services/VectorStoreService";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export async function ingestDocs() {
    console.log("Starting ingestion...");

    const pdfPath = path.join(__dirname, "../../gcc.pdf");
    console.log(`Loading PDF from: ${pdfPath}`);

    try {
        const loader = new PDFLoader(pdfPath);
        const docs = await loader.load();
        console.log(`Loaded ${docs.length} pages.`);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 700,
            chunkOverlap: 150,
        });

        const splitDocs = await splitter.splitDocuments(docs);
        console.log(`Split into ${splitDocs.length} chunks.`);

        const vectorStoreService = new VectorStoreService();
        await vectorStoreService.addDocuments(splitDocs);

        console.log("Ingestion complete!");
    } catch (error) {
        console.error("Ingestion failed:", error);
    }
}
