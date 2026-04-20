import fetch from "node-fetch";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const OPENAI_BASE_URL = "https://api.openai.com/v1";

/**
 * Core function to call AI chat completions (Groq or OpenAI)
 */
async function callAI({ messages, model = "gpt-4-turbo", apiKey, maxTokens = 1024, temperature = 0.7 }) {
  const isOpenAI = model.startsWith('gpt-');
  const baseURL = isOpenAI ? OPENAI_BASE_URL : GROQ_BASE_URL;
  const key = apiKey || (isOpenAI ? process.env.OPENAI_API_KEY : process.env.GROQ_API_KEY);
  const keyType = isOpenAI ? "OpenAI" : "Groq";
  
  if (!key) throw new Error(`${keyType} API key is missing.`);

  const response = await fetch(`${baseURL}/chat/completions`, {
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
    throw new Error(err?.error?.message || `${keyType} API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Legacy function for backward compatibility
 */
async function callGroq({ messages, model = "llama-3.1-405b-reasoning", apiKey, maxTokens = 1024, temperature = 0.7 }) {
  return callAI({ messages, model, apiKey, maxTokens, temperature });
}

/**
 * Transcribe audio using Groq Whisper
 */
export async function transcribeAudio(audioBuffer, mimeType = "audio/webm", apiKey) {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("Groq API key is missing.");

  const { FormData, Blob } = await import("node-fetch");

  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: mimeType }), "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "json");
  formData.append("language", "en");

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Whisper error: ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}

/**
 * Generate 3 smart suggestions from the latest transcript chunk
 */
export async function getSuggestions(transcript, apiKey, settings = {}) {
  const customPrompt = settings.suggestionsPrompt;
  const model = settings.model || "gpt-4-turbo";
  
  const systemPrompt = customPrompt || `You are an AI meeting copilot that helps users stay sharp during live conversations.

Based on the latest meeting transcript, generate EXACTLY 3 smart, context-aware suggestions.

Each suggestion must be a DIFFERENT type:
1. 🙋 A smart follow-up question to ask the speaker
2. 💡 A key insight, talking point, or action item to note
3. 🔍 A clarification, fact-check, or definition to verify

STRICT RULES:
- Each suggestion must be under 20 words
- Be hyper-specific to the current conversation context
- Avoid vague or generic suggestions
- Return ONLY valid JSON — no markdown, no explanation

OUTPUT FORMAT:
[
  { "id": "1", "type": "question", "icon": "🙋", "label": "Ask", "text": "..." },
  { "id": "2", "type": "insight", "icon": "💡", "label": "Insight", "text": "..." },
  { "id": "3", "type": "clarify", "icon": "🔍", "label": "Clarify", "text": "..." }
]`;

  const userPrompt = `Meeting transcript (latest context):\n\n${transcript}`;

  const raw = await callAI({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    apiKey,
    model,
    maxTokens: 512,
    temperature: 0.6,
  });

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback parse attempt
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse suggestions JSON from AI response.");
  }
}

/**
 * Get a detailed answer when user clicks a suggestion
 */
export async function getDetailedAnswer(transcript, suggestion, apiKey, settings = {}) {
  const customPrompt = settings.detailedAnswersPrompt;
  const model = settings.model || "gpt-4-turbo";
  const contextWindow = settings.detailedAnswersContextWindow || 6000;
  
  const systemPrompt = customPrompt || `You are an expert AI meeting assistant providing detailed, actionable answers.

Given the meeting transcript and the user's selected suggestion, provide a comprehensive response.

FORMAT YOUR RESPONSE AS:
- Start with a one-line TL;DR summary
- Then give 3–5 bullet points of actionable detail
- End with a "Next Step" recommendation

Keep the total response under 200 words. Be clear, structured, and meeting-focused.`;

  // Use custom context window
  const limitedTranscript = transcript.slice(-contextWindow);
  const userPrompt = `Full meeting transcript:\n${limitedTranscript}\n\nUser selected this suggestion:\n"${suggestion.text}"\n\nType: ${suggestion.type}`;

  return callGroq({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    apiKey,
    model,
    maxTokens: 512,
    temperature: 0.5,
  });
}

/**
 * Handle free-form chat questions from user
 */
export async function getChatAnswer(transcript, history, question, apiKey, settings = {}) {
  const customPrompt = settings.chatPrompt;
  const model = settings.model || "gpt-4-turbo";
  
  const systemPrompt = customPrompt || `You are an AI assistant embedded inside a live meeting tool.

You have access to the current meeting transcript. Answer the user's questions clearly and concisely.

GUIDELINES:
- Stay relevant to the meeting context
- Be helpful, not verbose
- Use bullet points if listing multiple things
- If a question is unrelated to the meeting, still answer helpfully

Current meeting transcript:
${transcript || "(No transcript yet — meeting may not have started)"}`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: question },
  ];

  return callAI({ messages, apiKey, model, maxTokens: 768, temperature: 0.65 });
}