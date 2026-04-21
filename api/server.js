import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import suggestionsRoute from "./routes/suggestions.js";
import chatRoute from "./routes/chat.js";
import transcribeRoute from "./routes/transcribe.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ 
  origin: ["http://localhost:5173", "https://twinmind-app-one.vercel.app"], 
  credentials: true 
}));
app.use(express.json({ limit: "10mb" }));

// Rate limiting to avoid abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Too many requests, please slow down." },
});
app.use(limiter);

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/transcribe", transcribeRoute);
app.use("/api/suggestions", suggestionsRoute);
app.use("/api/chat", chatRoute);

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`✅ TwinMind server running on http://localhost:${PORT}`));