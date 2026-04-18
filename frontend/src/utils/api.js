/**
 * api.js — centralized fetch helpers for all backend endpoints
 *
 * All functions throw an Error with a human-readable message on failure.
 */

const BASE = ""; // Vite proxy handles routing to :5000

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  return data;
}

/** Fetch 3 context-aware suggestions for a given transcript */
export async function fetchSuggestions(transcript, apiKey) {
  const { suggestions } = await post("/suggestions", { transcript, apiKey });
  return suggestions;
}

/** Expand a clicked suggestion into a full detailed answer */
export async function expandSuggestion(transcript, suggestion, apiKey) {
  const { answer } = await post("/suggestions/expand", { transcript, suggestion, apiKey });
  return answer;
}

/** Send a chat question grounded in the meeting transcript */
export async function sendChatMessage(transcript, history, question, apiKey) {
  const { answer } = await post("/chat", { transcript, history, question, apiKey });
  return answer;
}

/** Check if backend is reachable */
export async function checkHealth() {
  const res = await fetch("/health");
  return res.ok;
}

/** Export session data to a downloadable JSON file */
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
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `twinmind-session-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}