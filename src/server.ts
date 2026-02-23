import { App } from './app';
import * as dotenv from 'dotenv';
import { ingestDocs } from './scripts/ingest';

dotenv.config();

const port = Number(process.env.PORT) || 3000;
const app = new App().app;

Promise.all([ingestDocs()]).then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});