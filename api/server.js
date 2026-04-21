// api/local-server.js
// Local Express dev server — mirrors all Vercel serverless routes.
// Run: node api/local-server.js
//
// ⚠️  CRITICAL: express.json() must NOT be applied globally.
//     The /api/transcribe route receives multipart/form-data which busboy
//     reads by piping req directly. If express.json() (or any body-parser)
//     consumes the stream first, busboy gets nothing → empty files → 500.
//     Fix: apply express.json() as per-route middleware only.

import express from "express";
import cors from "cors";
import transcribeHandler  from "./transcribe.js";
import suggestionsHandler from "./suggestions.js";
import expandHandler      from "./suggestions/expand.js";
import chatHandler        from "./chat.js";

const app  = express();
const PORT = process.env.PORT || 5001;

// ── CORS (must be first) ──────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "https://twinmind-app-one.vercel.app"],
  credentials: true,
}));

// ── NO global express.json() — see note above ─────────────────

// Multipart: raw stream → busboy parses inside handler
app.post("/api/transcribe", (req, res) => transcribeHandler(req, res));

// JSON routes: express.json() applied per-route
app.post("/api/suggestions",
  express.json({ limit: "10mb" }),
  (req, res) => suggestionsHandler(req, res)
);
app.post("/api/suggestions/expand",
  express.json({ limit: "10mb" }),
  (req, res) => expandHandler(req, res)
);
app.post("/api/chat",
  express.json({ limit: "10mb" }),
  (req, res) => chatHandler(req, res)
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`\n✅ TwinMind API → http://localhost:${PORT}`);
  console.log("  POST /api/transcribe");
  console.log("  POST /api/suggestions");
  console.log("  POST /api/suggestions/expand");
  console.log("  POST /api/chat");
  console.log("  GET  /api/health\n");
});