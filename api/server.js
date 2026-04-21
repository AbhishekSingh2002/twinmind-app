// api/local-server.js
// Local Express dev server — mirrors all Vercel serverless routes exactly.
// Run: node api/local-server.js
//
// ⚠️  CRITICAL: express.json() must NOT be used globally.
//     /api/transcribe is multipart — busboy pipes req directly.
//     A global body-parser consumes the stream before busboy can read it → 500.
//     Fix: apply express.json() as per-route middleware only.

import express from "express";
import cors from "cors";
import transcribeHandler      from "./transcribe.js";
import suggestionsHandler     from "./suggestions.js";
import expandHandler          from "./suggestions-expand.js";
import chatHandler            from "./chat.js";

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ["http://localhost:5173", "https://twinmind-app-one.vercel.app"],
  credentials: true,
}));

// ── Multipart route — NO body parser, raw stream → busboy ─────
app.post("/api/transcribe", (req, res) => transcribeHandler(req, res));

// ── JSON routes — express.json() per-route only ───────────────
app.post("/api/suggestions",
  express.json({ limit: "10mb" }),
  (req, res) => suggestionsHandler(req, res)
);
app.post("/api/suggestions-expand",
  express.json({ limit: "10mb" }),
  (req, res) => expandHandler(req, res)
);
app.post("/api/chat",
  express.json({ limit: "10mb" }),
  (req, res) => chatHandler(req, res)
);

app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.listen(PORT, () => {
  console.log(`\n✅ TwinMind API → http://localhost:${PORT}`);
  console.log("  POST /api/transcribe");
  console.log("  POST /api/suggestions");
  console.log("  POST /api/suggestions-expand");
  console.log("  POST /api/chat");
  console.log("  GET  /api/health\n");
});