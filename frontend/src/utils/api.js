/**
 * api.js — all backend calls
 * Local dev:  Vite proxy → /api/* → Express local-server :5001
 * Vercel:     /api/* → serverless functions auto-routed by Vercel
 */

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  // Handle HTML error pages from Vercel gracefully
  const text = await res.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch {
    // If response is not JSON, it's likely an HTML error page
    throw new Error(`Server error (${res.status}): ${text.slice(0, 100)}...`);
  }
  
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/** Send audio blob → Whisper → transcript text */
export async function transcribeBlob(blob, apiKey) {
  const form = new FormData();
  form.append("audio", blob, "chunk.webm");
  if (apiKey) form.append("apiKey", apiKey);

  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  
  // Handle HTML error pages from Vercel gracefully
  const text = await res.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch {
    // If response is not JSON, it's likely an HTML error page
    throw new Error(`Transcription error (${res.status}): ${text.slice(0, 100)}...`);
  }
  
  if (!res.ok) throw new Error(data.error || `Transcription failed (${res.status})`);
  return data;
}

/** Fetch 3 context-aware suggestions */
export async function fetchSuggestions(transcript, apiKey, settings) {
  const { suggestions } = await post("/api/suggestions", { transcript, apiKey, settings });
  return suggestions;
}

/** Expand a clicked suggestion into a full answer */
export async function expandSuggestion(transcript, suggestion, apiKey, settings) {
  // Flat route — avoids Vercel nested-folder path issues
  const { answer } = await post("/api/suggestions-expand", {
    transcript,
    suggestion,
    apiKey,
    settings,
  });
  return answer;
}

/** Free-form chat grounded in transcript */
export async function sendChatMessage(transcript, history, question, apiKey, settings) {
  const { answer } = await post("/api/chat", { transcript, history, question, apiKey, settings });
  return answer;
}

/** Export session data as downloadable JSON */
export function exportSession(transcript, suggestions, chatHistory) {
  const data = {
    exportedAt: new Date().toISOString(),
    stats: {
      transcriptWords: transcript.split(/\s+/).filter(Boolean).length,
      suggestionsGenerated: suggestions.length,
      chatMessages: chatHistory.length,
    },
    transcript,
    suggestions,
    chatHistory,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `twinmind-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}