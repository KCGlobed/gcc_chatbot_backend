// import { App } from './app';
// import * as dotenv from 'dotenv';
// import { ingestDocs } from './scripts/ingest';

// dotenv.config();

// const port = Number(process.env.PORT) || 3000;
// const app = new App().app;

// Promise.all([ingestDocs()]).then(() => {
//     app.listen(port, () => {
//         console.log(`Server is running on port ${port}`);
//     });
// });

import { App } from './app';
import * as dotenv from 'dotenv';
import { ingestDocs } from './scripts/ingest';

dotenv.config();

const port = Number(process.env.PORT) || 8080;
const app = new App().app;

// Start server immediately
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});

// Run ingestion in background
(async () => {
    try {
        await ingestDocs();
        console.log("Docs ingested successfully");
    } catch (err) {
        console.error("Ingestion failed:", err);
    }
})();