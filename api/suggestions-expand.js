// api/suggestions-expand.js
// Flat file — avoids Vercel nested-folder import path issues.
// Route: POST /api/suggestions-expand
// INLINED groqService to eliminate Vercel import dependencies.

export const config = { api: { bodyParser: true } };

// ── Inlined Groq Service Functions ──────────────────────────────
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

async function callAI({ messages, model = "llama3-70b-8192", apiKey, maxTokens = 1024, temperature = 0.7 }) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is missing.");

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq chat error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function expandSuggestion(transcript, suggestion, apiKey, settings = {}) {
  const contextWindow  = settings?.detailedAnswersContextWindow || 6000;
  const model          = settings?.model || "llama3-70b-8192";
  const suggestionText = typeof suggestion === "string"
    ? suggestion
    : suggestion?.text || String(suggestion);

  const userPrompt = settings?.detailedAnswersPrompt
    || `You are an AI meeting assistant. Based on this transcript and suggestion, give a structured, helpful response.

FORMAT:
- TL;DR: one sentence summary
- 3–5 bullet points of actionable insight
- Next Step: one concrete recommendation

Keep it under 200 words.

Transcript:
${transcript.slice(-contextWindow)}

Suggestion: "${suggestionText}"`;

  return callAI({
    messages: [
      { role: "system", content: "You are a helpful AI assistant for meeting analysis." },
      { role: "user",   content: userPrompt },
    ],
    model,
    apiKey,
    maxTokens: 1000,
    temperature: 0.4,
  });
}

function setCors(req, res) {
  const allowed = [
    "http://localhost:5173",
    "https://twinmind-app-one.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
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
    console.error("[/api/suggestions-expand ERROR]", error.message);
    return res.status(500).json({ error: error.message || "Failed to expand suggestion" });
  }
}
