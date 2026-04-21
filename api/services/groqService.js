import fetch from "node-fetch";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Core function to call AI chat completions (Groq only)
 */
async function callAI({ messages, model = "openai/gpt-oss-120b", apiKey, maxTokens = 1024, temperature = 0.7 }) {
  const baseURL = GROQ_BASE_URL;
  const key = apiKey || process.env.GROQ_API_KEY;
  
  if (!key) throw new Error("Groq API key is missing.");

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
    throw new Error(err?.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Transcribe audio using Groq's Whisper model
 */
export async function transcribeAudio(audioBuffer, mimeType, apiKey) {
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: mimeType }), "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "json");

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey || process.env.GROQ_API_KEY}`,
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
  const prompt = settings?.suggestionsPrompt || `You are an AI assistant for a meeting. Based on this transcript, suggest 3 actionable items:

1. A **Question** to clarify important points
2. An **Insight** about key patterns or themes  
3. A **Clarification** on ambiguous topics

Respond in JSON format:
{
  "suggestions": [
    {
      "type": "question",
      "text": "..."
    },
    {
      "type": "insight", 
      "text": "..."
    },
    {
      "type": "clarification",
      "text": "..."
    }
  ]
}`;

  const messages = [
    { role: "system", content: prompt },
    { role: "user", content: transcript.slice(-contextWindow) }
  ];

  const response = await callAI({ 
    messages, 
    model: settings?.model || "openai/gpt-oss-120b", 
    apiKey,
    maxTokens: 800,
    temperature: 0.3
  });

  try {
    const parsed = JSON.parse(response);
    return parsed.suggestions || [];
  } catch {
    // Fallback if JSON parsing fails
    return [
      { type: "question", text: "What are the key action items from this discussion?" },
      { type: "insight", text: "The team seems to be aligned on the main objectives." },
      { type: "clarification", text: "Could you elaborate on the timeline mentioned?" }
    ];
  }
}

/**
 * Expand a suggestion with a detailed answer
 */
export async function expandSuggestion(transcript, suggestion, apiKey, settings = {}) {
  const contextWindow = settings?.detailedAnswersContextWindow || 6000;
  const prompt = settings?.detailedAnswersPrompt || `You are an AI meeting assistant. Based on this meeting transcript and the selected suggestion, provide a detailed, helpful response:

Transcript: ${transcript.slice(-contextWindow)}

Suggestion: ${suggestion}

Provide a comprehensive response that:
1. References specific parts of the transcript
2. Offers actionable advice
3. Suggests next steps
4. Is concise but thorough (2-3 paragraphs)`;

  const messages = [
    { role: "system", content: "You are a helpful AI assistant for meeting analysis." },
    { role: "user", content: prompt }
  ];

  return await callAI({ 
    messages, 
    model: settings?.model || "openai/gpt-oss-120b", 
    apiKey,
    maxTokens: 1000,
    temperature: 0.4
  });
}

/**
 * Chat with AI about the meeting transcript
 */
export async function chatWithAI(transcript, history, question, apiKey, settings = {}) {
  const contextWindow = 8000;
  const prompt = settings?.chatPrompt || `You are an AI assistant helping with meeting analysis. Use this transcript to answer questions:

${transcript.slice(-contextWindow)}

Previous conversation:
${history.slice(-10).map(h => `${h.role}: ${h.content}`).join('\n')}

Current question: ${question}

Provide a helpful, concise response based on the transcript.`;

  const messages = [
    { role: "system", content: "You are a helpful AI assistant for meeting analysis." },
    { role: "user", content: prompt }
  ];

  return await callAI({ 
    messages, 
    model: settings?.model || "openai/gpt-oss-120b", 
    apiKey,
    maxTokens: 800,
    temperature: 0.5
  });
}
