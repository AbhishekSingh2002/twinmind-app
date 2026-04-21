// services/groqService.js
// Requires Node 18+ (native fetch, FormData, Blob).
// No node-fetch — it conflicts with native globals and breaks multipart uploads.

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// ── Core chat helper ──────────────────────────────────────────
async function callAI({
  messages,
  model = "llama3-70b-8192",
  apiKey,
  maxTokens = 1024,
  temperature = 0.7,
}) {
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

// ── Transcribe audio via Whisper Large V3 ────────────────────
export async function transcribeAudio(audioBuffer, mimeType = "audio/webm", apiKey) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is missing.");

  // Convert Node Buffer → Uint8Array so native Blob accepts it correctly
  const uint8 = audioBuffer instanceof Uint8Array
    ? audioBuffer
    : new Uint8Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.byteLength);

  const form = new FormData();
  // ⚠️ Do NOT manually set Content-Type on the fetch call below.
  //    The browser/Node native fetch sets it automatically WITH the boundary.
  //    Setting it manually omits the boundary → Groq returns 400.
  form.append("file", new Blob([uint8], { type: mimeType }), "audio.webm");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "json");

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` }, // NO Content-Type here
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err?.error?.message || `Whisper error ${response.status}: ${JSON.stringify(err)}`
    );
  }

  const data = await response.json();
  return data.text || "";
}

// ── Generate 3 suggestions ────────────────────────────────────
export async function getSuggestions(transcript, apiKey, settings = {}) {
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
      { id: "1", type: "question",      icon: "🙋", label: "Ask",    text: "What are the key action items from this discussion?" },
      { id: "2", type: "insight",       icon: "💡", label: "Insight", text: "The team seems aligned on the main objectives." },
      { id: "3", type: "clarification", icon: "🔍", label: "Clarify", text: "Could you elaborate on the timeline mentioned?" },
    ];
  }
}

// ── Expand a suggestion into a full answer ────────────────────
export async function expandSuggestion(transcript, suggestion, apiKey, settings = {}) {
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

// ── Answer a free-form chat question ─────────────────────────
export async function chatWithAI(transcript, history = [], question, apiKey, settings = {}) {
  const contextWindow = 8000;
  const model         = settings?.model || "llama3-70b-8192";

  const historyText = history
    .slice(-10)
    .map((h) => `${h.role}: ${h.content}`)
    .join("\n");

  const userPrompt = settings?.chatPrompt
    || `You are an AI assistant helping with meeting analysis.

Transcript:
${transcript.slice(-contextWindow)}

Previous conversation:
${historyText || "(none)"}

Question: ${question}

Provide a helpful, concise response based on the transcript.`;

  return callAI({
    messages: [
      { role: "system", content: "You are a helpful AI assistant for meeting analysis." },
      { role: "user",   content: userPrompt },
    ],
    model,
    apiKey,
    maxTokens: 800,
    temperature: 0.5,
  });
}