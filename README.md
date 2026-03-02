# ADF — Agent Document Format

Transform documents into intelligent objects AI agents instantly understand.

ADF converts PDFs into agent-readable knowledge objects containing structured semantics, entity graphs, summaries, embeddings, and performance benchmarks — all packaged in a single `.adf` file.

## Architecture

```
User uploads PDF → FastAPI backend → Extraction → Structure Detection
→ LLM Semantic Enrichment → Embedding Generation → .adf packaging
→ Next.js frontend (PDF viewer + Intelligence Dashboard)
```

## ADF Container Format

Each `.adf` file is a ZIP archive containing:

| File             | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `document.pdf`   | Original PDF (unchanged)                       |
| `semantic.json`  | Sections, headings, structured content         |
| `agent.json`     | Doc type, reading order, capabilities          |
| `graph.json`     | Entity relationships / knowledge graph         |
| `embeddings.bin` | Pre-computed vector embeddings per chunk        |
| `benchmarks.json`| Conversion time, accuracy scores, token savings|

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Optional: set OpenAI key for LLM enrichment
export OPENAI_API_KEY=sk-...

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload a PDF.

## Tech Stack

**Backend:** Python 3.12, FastAPI, PyMuPDF, OpenAI API

**Frontend:** Next.js 15, React, Tailwind CSS, Framer Motion, PDF.js, React Flow, D3.js, Zustand, TanStack Query
