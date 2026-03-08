# DLM ADF — GenTech Document Management

A cross-platform desktop application for reading, exploring, and managing Agent Document Format (`.adf`) files. Built by GenTech with Tauri v2.

## Features

- **ADF Reader**: Open `.adf` files and explore their structured content
- **Document Viewer**: Full-featured document viewing with annotations, search, zoom, thumbnails
- **Semantic Viewer**: Browse document structure as a navigable section tree
- **Agent Intelligence Panel**: View document type, summary, entities, keywords, and benchmarks
- **Knowledge Graph Explorer**: Interactive React Flow graph of document entities and relationships
- **Document Tools**: Client-side merge, split, rotate, compress, watermark, and more
- **Convert to ADF**: Upload documents to the ADF backend for conversion (requires backend)
- **ADF Inspector**: Inspect raw ADF layers (semantic, agent, graph, benchmarks)
- **Cross-Platform**: macOS (DMG), Windows (MSI), Linux (DEB/RPM)

## Quick Start

### Development

```bash
cd frontend
npm install
npm run dev          # Web dev server at http://localhost:5173
npm run tauri-dev    # Desktop app with hot reload
```

### Build

```bash
cd frontend
npm run build           # Web build
npm run tauri-build     # Desktop installers (DMG/MSI/DEB/RPM)
```

### Backend (for document-to-ADF conversion)

```bash
cd ../backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...  # optional, for LLM enrichment
uvicorn app.main:app --reload --port 8000
```

## File Associations

The desktop app registers as a handler for:
- `.adf` files (Agent Document Format) — primary
- `.pdf` files (PDF documents) — secondary

## ADF Format

An `.adf` file is a ZIP archive containing:
- `document.pdf` — the original document
- `semantic.json` — structured sections, tables, references
- `agent.json` — document type, summary, entities, keywords
- `graph.json` — knowledge graph (nodes and edges)
- `benchmarks.json` — conversion metrics and accuracy scores
- `embeddings.bin` — vector embeddings for AI retrieval

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Mantine UI, Tailwind CSS
- **Document Rendering**: EmbedPDF, pdf-lib
- **ADF Visualization**: React Flow, Dagre, D3.js
- **Desktop**: Tauri v2 (Rust)
- **Backend**: Python/FastAPI (separate service, not bundled)

## License

MIT
