// api/local-server.js
// Local Express dev server — mirrors all Vercel serverless routes exactly.
// Run with: node api/local-server.js

import express from "express";
import cors from "cors";
import multer from "multer";

// Import route handlers (same files Vercel uses)
import transcribeHandler from "./transcribe.js";
import suggestionsHandler from "./suggestions.js";
import expandHandler from "./suggestions/expand.js";
import chatHandler from "./chat.js";

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "https://twinmind-app-one.vercel.app"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ── Vercel handler adapter ────────────────────────────────────
// Vercel serverless functions use (req, res) same as Express.
// We mount them directly — no wrapper needed.

// Transcribe needs raw multipart — multer disabled, busboy handles it
app.post("/api/transcribe", (req, res) => transcribeHandler(req, res));

// JSON routes
app.post("/api/suggestions",        (req, res) => suggestionsHandler(req, res));
app.post("/api/suggestions/expand", (req, res) => expandHandler(req, res));
app.post("/api/chat",               (req, res) => chatHandler(req, res));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`\n✅ Local API server → http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log("  POST /api/transcribe");
  console.log("  POST /api/suggestions");
  console.log("  POST /api/suggestions/expand");
  console.log("  POST /api/chat");
  console.log("  GET  /api/health\n");
});