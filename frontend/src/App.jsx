import { useState, useCallback, useRef } from "react";
import Transcript from "./components/Transcript";
import Suggestions from "./components/Suggestions";
import Chat from "./components/Chat";
import Settings from "./components/Settings";
import ErrorBoundary from "./components/ErrorBoundary";
import { fetchSuggestions, expandSuggestion, sendChatMessage, exportSession } from "./utils/api";
import { DEMO_CHUNKS, DEMO_SUGGESTIONS } from "./utils/demo";

/* ─── Global styles ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #12121a; --surface2: #1a1a26;
    --border: #2a2a3d; --accent: #7c6dfa; --accent2: #fa6d8f; --accent3: #6dfabc;
    --text: #e8e8f0; --text-muted: #6b6b8a; --text-dim: #9090b0;
    --radius: 12px; --font: 'Syne', sans-serif; --mono: 'JetBrains Mono', monospace;
  }
  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); overflow: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  button { font-family: var(--font); cursor: pointer; border: none; outline: none; }
  input, textarea { font-family: var(--font); outline: none; border: none; }
  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 0.3; } 100% { transform: scale(1); opacity: 0.8; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;
const styleEl = document.createElement("style");
styleEl.textContent = GLOBAL_CSS;
document.head.appendChild(styleEl);

export default function App() {
  const [chunks, setChunks]                      = useState([]);
  const [suggestions, setSuggestions]            = useState([]);
  const [chatHistory, setChatHistory]            = useState([]);
  const [apiKey, setApiKey]                      = useState("");
  const [settings, setSettings]                  = useState(null);
  const [isLoadingSuggestions, setIsLoadingSugg] = useState(false);
  const [showSettings, setShowSettings]          = useState(false);
  const [error, setError]                        = useState("");
  const [isDemo, setIsDemo]                      = useState(false);
  const suggestTimer = useRef(null);

  const getTranscript = (c = chunks) => c.map((x) => x.text).join(" ");

  const fetchSuggestionsNow = useCallback(async (text) => {
    if (text.trim().length < 30) return;
    setIsLoadingSugg(true);
    try {
      const s = await fetchSuggestions(text, apiKey, settings);
      setSuggestions(s);
    } catch (e) {
      setError("Suggestions: " + e.message);
    } finally {
      setIsLoadingSugg(false);
    }
  }, [apiKey, settings]);

  const scheduleSuggestions = useCallback((text) => {
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => {
      fetchSuggestionsNow(text);
    }, 3000);
  }, [fetchSuggestionsNow]);

  const handleChunk = useCallback((chunk) => {
    setChunks((prev) => {
      const next = [...prev, chunk];
      scheduleSuggestions(next.map((c) => c.text).join(" "));
      return next;
    });
  }, [scheduleSuggestions]);

  const handleSuggestionClick = useCallback(async (suggestion) => {
    const userMsg = { role: "user", content: suggestion.icon + " " + suggestion.text, type: "suggestion" };
    setChatHistory((h) => [...h, userMsg]);
    try {
      const answer = await expandSuggestion(getTranscript(), suggestion, apiKey, settings);
      setChatHistory((h) => [...h, { role: "assistant", content: answer }]);
    } catch (e) {
      setChatHistory((h) => [...h, { role: "assistant", content: "Error: " + e.message }]);
    }
  }, [chunks, apiKey, settings]);

  const handleChatSend = useCallback(async (question) => {
    const userMsg = { role: "user", content: question };
    setChatHistory((prev) => [...prev, userMsg]);
    try {
      const snapshot = chatHistory.slice(-10);
      const answer = await sendChatMessage(getTranscript(), snapshot, question, apiKey, settings);
      setChatHistory((h) => [...h, { role: "assistant", content: answer }]);
    } catch (e) {
      setChatHistory((h) => [...h, { role: "assistant", content: "Error: " + e.message }]);
    }
  }, [chunks, chatHistory, apiKey, settings]);

  const loadDemo = () => {
    setChunks(DEMO_CHUNKS);
    setSuggestions(DEMO_SUGGESTIONS);
    setChatHistory([]);
    setIsDemo(true);
  };

  const clearSession = () => {
    setChunks([]); setSuggestions([]); setChatHistory([]);
    setIsDemo(false); setError("");
  };

  const handleRefreshSuggestions = () => {
    const transcript = getTranscript();
    if (transcript.trim()) {
      fetchSuggestionsNow(transcript);
    }
  };

  const transcript = getTranscript();

  return (
    <ErrorBoundary>
      <div style={s.root}>
        <header style={s.header}>
          <div style={s.logo}>
            <span style={s.logoIcon}>⬡</span>
            <span style={s.logoText}>TwinMind</span>
            <span style={s.logoBadge}>BETA</span>
          </div>
          <div style={s.headerActions}>
            {error && <span style={s.errorBadge} onClick={() => setError("")}>⚠ {error.slice(0, 50)} ✕</span>}
            {!isDemo && <button style={s.ghostBtn} onClick={loadDemo}>▶ Demo</button>}
            <button style={s.ghostBtn} onClick={() => exportSession(transcript, suggestions, chatHistory)}>↓ Export</button>
            <button style={s.ghostBtn} onClick={clearSession}>↺ Clear</button>
            <button style={s.settingsBtn} onClick={() => setShowSettings(true)}>
              ⚙ Settings {!apiKey && <span style={s.keyWarning}>!</span>}
            </button>
          </div>
        </header>

        {!apiKey && (
          <div style={s.banner}>
            <span>🔑 Add your Groq API key in Settings to enable AI features.</span>
            <button style={s.bannerBtn} onClick={() => setShowSettings(true)}>Open Settings →</button>
          </div>
        )}

        <div style={s.columns}>
          <Transcript chunks={chunks} isDemo={isDemo} apiKey={apiKey} onChunk={handleChunk} onError={setError} />
          <Suggestions suggestions={suggestions} isLoading={isLoadingSuggestions} onSuggestionClick={handleSuggestionClick} onRefresh={handleRefreshSuggestions} />
          <Chat history={chatHistory} onSend={handleChatSend} />
        </div>

        {showSettings && <Settings apiKey={apiKey} setApiKey={setApiKey} settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />}
      </div>
    </ErrorBoundary>
  );
}

const s = {
  root: { display: "flex", flexDirection: "column", height: "100vh" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { fontSize: "22px", color: "var(--accent)" },
  logoText: { fontSize: "18px", fontWeight: 700, letterSpacing: "-0.5px" },
  logoBadge: { fontSize: "9px", fontFamily: "var(--mono)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: "4px", padding: "1px 5px", letterSpacing: "1px" },
  headerActions: { display: "flex", alignItems: "center", gap: "8px" },
  ghostBtn: { background: "var(--surface2)", color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 500 },
  settingsBtn: { background: "var(--accent)", color: "#fff", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" },
  keyWarning: { background: "var(--accent2)", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 },
  errorBadge: { background: "rgba(250,109,143,0.12)", color: "var(--accent2)", border: "1px solid rgba(250,109,143,0.3)", borderRadius: "8px", padding: "4px 12px", fontSize: "11px", cursor: "pointer", fontFamily: "var(--mono)" },
  banner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", padding: "8px 24px", background: "rgba(124,109,250,0.08)", borderBottom: "1px solid rgba(124,109,250,0.2)", fontSize: "12px", color: "var(--text-dim)", flexShrink: 0 },
  bannerBtn: { background: "transparent", color: "var(--accent)", fontSize: "12px", fontWeight: 600, cursor: "pointer", textDecoration: "underline" },
  columns: { display: "grid", gridTemplateColumns: "1fr 340px 380px", flex: 1, overflow: "hidden" },
};