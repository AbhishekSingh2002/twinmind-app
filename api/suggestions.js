// api/suggestions.js
import { getSuggestions } from "../services/groqService.js";

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
    const { transcript, apiKey, settings } = req.body || {};
    const effectiveApiKey = apiKey || process.env.GROQ_API_KEY;

    if (!effectiveApiKey) {
      return res.status(400).json({ error: "API key is required" });
    }
    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }
    if (transcript.length < 30) {
      return res.status(400).json({ error: "Transcript too short to generate suggestions" });
    }

    const suggestions = await getSuggestions(transcript, effectiveApiKey, settings);
    return res.status(200).json({ suggestions });

  } catch (error) {
    console.error("[/api/suggestions ERROR]", error.message);
    return res.status(500).json({ error: error.message || "Failed to generate suggestions" });
  }
}