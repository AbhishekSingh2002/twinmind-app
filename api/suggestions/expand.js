// api/suggestions/expand.js
import { expandSuggestion } from "../../services/groqService.js";

export const config = { api: { bodyParser: true } };

function setCors(req, res) {
  const allowed = [
    "http://localhost:5173",
    "https://twinmind-app-one.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // ← string, NOT array
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    const { transcript, apiKey, settings, suggestion } = req.body || {};
    const effectiveApiKey = apiKey || process.env.GROQ_API_KEY;

    if (!effectiveApiKey) {
      return res.status(400).json({ error: "API key is required" });
    }
    if (!transcript || !suggestion) {
      return res.status(400).json({ error: "Transcript and suggestion are required" });
    }

    const answer = await expandSuggestion(transcript, suggestion, effectiveApiKey, settings);
    return res.status(200).json({ answer });

  } catch (error) {
    console.error("[/api/suggestions/expand ERROR]", error.message);
    return res.status(500).json({ error: error.message || "Failed to expand suggestion" });
  }
}