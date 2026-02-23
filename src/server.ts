import { App } from './app';
import * as dotenv from 'dotenv';
import { ingestDocs } from './scripts/ingest';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const app = new App().app;

// Start server immediately (required for Cloud Run health checks)
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port} and bound to 0.0.0.0`);

    // Run ingestion in the background
    console.log("Starting background ingestion...");
    ingestDocs().then(() => {
        console.log("Background ingestion complete.");
    }).catch(err => {
        console.error("Background ingestion failed:", err);
    });
});
