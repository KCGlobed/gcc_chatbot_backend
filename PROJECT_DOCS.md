# KCG Bot Backend Documentation

## Project Overview
The **KCG Bot Backend** is a sophisticated **RAG (Retrieval-Augmented Generation)** system tailored for KC GlobEd. It automates the extraction of knowledge from web pages and PDF documents, converts this data into vector embeddings, and leverages an LLM to provide intelligent, context-aware responses to user queries.

### Core Architecture
1.  **Ingestion Layer**:
    *   **Web Crawler**: Fetches HTML content from specified URLs.
    *   **PDF Loader**: Extracts text from PDF documents (`kcg.pdf`).
    *   **Text Splitter**: Chunks text into manageable segments (1000 chars, 200 overlap) to optimize retrieval.
2.  **Storage Layer**:
    *   **Embeddings**: Uses `text-embedding-3-small` to convert text chunks into vectors.
    *   **Vector Store**: Stores vectors in **ChromaDB** for efficient similarity search.
    *   **Relational DB**: Uses **SQLite** (`kcg_bot.db`) for structured data if needed.
3.  **Application Layer**:
    *   **API**: Express.js server handles chat requests.
    *   **Chat Service**: Orchestrates the RAG flow (Retrieve relevant chunks -> Construct Prompt -> Query LLM).
4.  **Presentation Layer**:
    *   **Frontend**: React + Vite application provides the chat interface.

---

## A-Z Guide: detailed Workflows

### 1. Project Initialization
*   **Step 1.1**: **Prerequisites Check**. Ensure Node.js (v18+) and npm (v9+) are installed.
*   **Step 1.2**: **Clone Repository**. Get the code to your local machine.
*   **Step 1.3**: **Backend Setup**.
    *   Run `npm install` in the root directory.
    *   *Outcome*: `node_modules` folder is created.
*   **Step 1.4**: **Frontend Setup**.
    *   Navigate to `cd client`.
    *   Run `npm install`.
    *   *Outcome*: `client/node_modules` is created.
*   **Step 1.5**: **Environment Configuration**.
    *   Create a `.env` file in the root.
    *   Add `OPENAI_API_KEY`, `CHROMA_HOST`, and `CHROMA_PORT`.

### 2. Data Ingestion (The "Knowledge Build")
*   **Step 2.1**: **Ensure Database Availability**.
    *   Make sure your ChromaDB instance is running (local Docker container or cloud instance).
    *   *Check*: Verify connection to `http://localhost:8000`.
*   **Step 2.2**: **PDF Ingestion**.
    *   **Command**: `npx ts-node src/scripts/ingest.ts`
    *   **Action**: Loads `kcg.pdf`, splits text, generates embeddings, saves to ChromaDB.
    *   *Time*: ~1-2 mins.
*   **Step 2.3**: **Web Ingestion**.
    *   **Command**: `npm run ingest-web`
    *   **Action**: Crawls defined URLs, scrapes content, splits, embeds, saves.
    *   *Time*: ~3-5 mins (depends on page count).

### 3. Running the Application
*   **Step 3.1**: **Start Backend**.
    *   **Command**: `npm run dev`
    *   **Action**: Starts Express server on port 3000 (default).
*   **Step 3.2**: **Start Frontend**.
    *   **Command**: `cd client && npm run dev`
    *   **Action**: Starts React dev server (usually http://localhost:5173).
*   **Step 3.3**: **Verification**.
    *   Open browser to frontend URL.
    *   Send a test message (e.g., "What courses do you offer?").

---

## Detailed Task Breakdown & Estimates

| Category | Task | Micro-Step | Logic/Dependency |
| :--- | :--- | :--- | :--- |
| **Setup** | **Install Deps** | `npm install` (root) | Network IO (downloads packages) |
| | | `cd client && npm install` | Network IO |
| **Config** | **Env Setup** | Create `.env` file | Manual copy-paste of API keys |
| **Data** | **PDF Ingest** | Load PDF `src/scripts/ingest.ts` | Disk IO |
| | | Split Text | CPU (Regex/String ops) |
| | | Generate Embeddings | API Latency (OpenAI request) |
| | | Upload to Chroma | Network/DB Latency |
| **Data** | **Web Ingest** | Web Crawl `src/scripts/ingest-web.ts` | Network IO (Fetching HTML) |
| | | Embed & Upload | API & DB Latency |
| **Run** | **Start Dev** | `npm run dev` | Server startup |

---

## Required Data Sources
To function correctly, the bot requires access to:
1.  **OpenAI API**: For `text-embedding-3-small` (embeddings) and `gpt-3.5/4` (chat completions).
2.  **ChromaDB**: Vector database to store knowledge.
    *   *Config*: Host/Port defined in `.env`.
3.  **Source Documents**:
    *   **PDF**: `kcg.pdf` in project root.
    *   **Web**: URLs hardcoded in `src/scripts/ingest-web.ts`:
        *   `https://www.kcglobed.com/`
        *   `https://www.kcglobed.com/course/ea`
        *   `https://www.kcglobed.com/course/cma`
        *   `https://www.kcglobed.com/course/cpa`
        *   `https://www.kcglobed.com/about-us`
        *   `https://www.kcglobed.com/contactus`

---

## Troubleshooting

### Common Issues

#### 1. Ingestion Fails with `FetchError` or `Connection Refused`
**Symptoms**: Scripts exit with error connecting to Chroma.
**Cause**: ChromaDB is not running or not accessible at `localhost:8000`.
**Fix**:
*   Ensure Docker container is running: `docker ps`.
*   If using a diverse setup, check `.env` for correct `CHROMA_HOST` and `CHROMA_PORT`.

#### 2. Chat Returns "I don't know"
**Cause**: Vector store is empty or embeddings are mismatched.
**Fix**:
*   Re-run ingestion scripts: `npm run ingest-web` / `npx ts-node src/scripts/ingest.ts`.
*   Check OpenAI API quota.

#### 3. Module Not Found Issues
**Cause**: Missing dependencies.
**Fix**: Run `npm install` again in both root and `client` directories.
