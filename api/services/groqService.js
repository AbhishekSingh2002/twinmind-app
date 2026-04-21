// services/groqService.js
// Node 18+ — uses native fetch, FormData, Blob (no node-fetch needed)

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Core function to call AI chat completions (Groq only)
 */
async function callAI({ messages, model = "llama3-70b-8192", apiKey, maxTokens = 1024, temperature = 0.7 }) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is missing.");

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Transcribe audio using Groq's Whisper model
 * audioBuffer: Buffer | ArrayBuffer
 * mimeType: e.g. "audio/webm"
 */
export async function transcribeAudio(audioBuffer, mimeType = "audio/webm", apiKey) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is missing.");

  // Native FormData + Blob — available in Node 18+
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: mimeType }), "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "json");

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      // ⚠️ Do NOT set Content-Type manually here — fetch sets it with boundary automatically
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Transcription error: ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}

/**
 * Generate 3 context-aware suggestions for a meeting transcript
 */
export async function getSuggestions(transcript, apiKey, settings = {}) {
  const contextWindow = settings?.suggestionsContextWindow || 4000;
  const model = settings?.model || "llama3-70b-8192";

  const systemPrompt = settings?.suggestionsPrompt || `You are an AI meeting copilot. Based on the transcript, generate exactly 3 smart suggestions.

Each must be a DIFFERENT type:
1. A question to clarify important points
2. An insight about key patterns or themes
3. A clarification on ambiguous topics

Return ONLY valid JSON — no markdown, no explanation:
{
  "suggestions": [
    { "id": "1", "type": "question",       "icon": "🙋", "label": "Ask",     "text": "..." },
    { "id": "2", "type": "insight",        "icon": "💡", "label": "Insight",  "text": "..." },
    { "id": "3", "type": "clarification",  "icon": "🔍", "label": "Clarify",  "text": "..." }
  ]
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: transcript.slice(-contextWindow) },
  ];

  const raw = await callAI({ messages, model, apiKey, maxTokens: 800, temperature: 0.3 });

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed.suggestions || [];
  } catch {
    // Fallback: try extracting JSON object from response
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return parsed.suggestions || [];
      } catch {}
    }
    // Safe fallback suggestions
    return [
      { id: "1", type: "question",      icon: "🙋", label: "Ask",    text: "What are the key action items from this discussion?" },
      { id: "2", type: "insight",       icon: "💡", label: "Insight", text: "The team seems aligned on the main objectives." },
      { id: "3", type: "clarification", icon: "🔍", label: "Clarify", text: "Could you elaborate on the timeline mentioned?" },
    ];
  }
}

/**
 * Expand a suggestion with a detailed answer
 */
export async function expandSuggestion(transcript, suggestion, apiKey, settings = {}) {
  const contextWindow = settings?.detailedAnswersContextWindow || 6000;
  const model = settings?.model || "llama3-70b-8192";

  const suggestionText = typeof suggestion === "string" ? suggestion : suggestion?.text || String(suggestion);

  const prompt = settings?.detailedAnswersPrompt
    || `You are an AI meeting assistant. Based on this transcript and suggestion, give a structured, helpful response.

FORMAT:
- TL;DR: one sentence summary
- 3–5 bullet points of actionable insight
- Next Step: one concrete recommendation

Keep it under 200 words.

Transcript:
${transcript.slice(-contextWindow)}

Suggestion: "${suggestionText}"`;

  const messages = [
    { role: "system", content: "You are a helpful AI assistant for meeting analysis." },
    { role: "user", content: prompt },
  ];

  return callAI({ messages, model, apiKey, maxTokens: 1000, temperature: 0.4 });
}

/**
 * Chat with AI about the meeting transcript
 */
export async function chatWithAI(transcript, history = [], question, apiKey, settings = {}) {
  const contextWindow = 8000;
  const model = settings?.model || "llama3-70b-8192";

  const historyText = history
    .slice(-10)
    .map((h) => `${h.role}: ${h.content}`)
    .join("\n");

  const prompt = settings?.chatPrompt
    || `You are an AI assistant helping with meeting analysis.

Transcript:
${transcript.slice(-contextWindow)}

Previous conversation:
${historyText || "(none)"}

Question: ${question}

Provide a helpful, concise response based on the transcript.`;

  const messages = [
    { role: "system", content: "You are a helpful AI assistant for meeting analysis." },
    { role: "user", content: prompt },
  ];

  return callAI({ messages, model, apiKey, maxTokens: 800, temperature: 0.5 });
}