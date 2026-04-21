// api/suggestions.js
// INLINED groqService to eliminate Vercel import dependencies.

export const config = { api: { bodyParser: true } };

// ── Inlined Groq Service Functions ──────────────────────────────
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

async function callAI({ messages, model = "llama3-70b-8192", apiKey, maxTokens = 1024, temperature = 0.7 }) {
  console.log("[callAI] Starting AI call");
  const key = apiKey || process.env.GROQ_API_KEY;
  console.log("[callAI] API key present:", !!key);
  if (!key) throw new Error("Groq API key is missing.");

  console.log("[callAI] Making request to Groq API");
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

async function getSuggestions(transcript, apiKey, settings = {}) {
  console.log("[getSuggestions] Starting suggestions generation");
  const contextWindow = settings?.suggestionsContextWindow || 4000;
  const model         = settings?.model || "llama3-70b-8192";

  const systemPrompt = settings?.suggestionsPrompt || `You are an AI meeting copilot. Based on the transcript, generate exactly 3 smart suggestions.

Each must be a DIFFERENT type:
1. A question to clarify important points
2. An insight about key patterns or themes
3. A clarification on ambiguous topics

Return ONLY valid JSON — no markdown fences, no extra text:
{
  "suggestions": [
    { "id": "1", "type": "question",      "icon": "🙋", "label": "Ask",    "text": "..." },
    { "id": "2", "type": "insight",       "icon": "💡", "label": "Insight", "text": "..." },
    { "id": "3", "type": "clarification", "icon": "🔍", "label": "Clarify", "text": "..." }
  ]
}`;

  const raw = await callAI({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: transcript.slice(-contextWindow) },
    ],
    model,
    apiKey,
    maxTokens: 800,
    temperature: 0.3,
  });

  // Robust JSON extraction
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned).suggestions || [];
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]).suggestions || []; } catch {}
    }
    // Safe static fallback — never crash the UI
    return [
      { id: "1", type: "question",      icon: "🙋", "label": "Ask",    text: "What are the key action items from this discussion?" },
      { id: "2", type: "insight",       icon: "💡", "label": "Insight", text: "The team seems aligned on the main objectives." },
      { id: "3", type: "clarification", icon: "🔍", "label": "Clarify", text: "Could you elaborate on the timeline mentioned?" },
    ];
  }
}

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
  console.log("[/api/suggestions] Handler called");
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  try {
    console.log("[/api/suggestions] Parsing request body");
    const { transcript, apiKey, settings } = req.body || {};
    const effectiveApiKey = apiKey || process.env.GROQ_API_KEY;
    
    console.log("[/api/suggestions] API key present:", !!effectiveApiKey);
    console.log("[/api/suggestions] Transcript length:", transcript?.length || 0);

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