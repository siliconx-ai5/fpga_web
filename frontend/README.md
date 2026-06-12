# FPGA Web Frontend (prototype)

Quickstart (frontend only):

1. Install dependencies and run dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Open the dev server URL shown by Vite (usually http://localhost:5173)

Notes:
- This prototype uses an in-browser SQLite (`sql.js`) and a WASM-based simulator for v1.
- Store your OpenAI API key in the application settings UI (in development it's persisted to `localStorage`).
