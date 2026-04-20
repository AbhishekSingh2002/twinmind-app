import { useState } from "react";

export default function Settings({ apiKey, setApiKey, onClose, settings, setSettings }) {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings || {
    suggestionsPrompt: '',
    detailedAnswersPrompt: '',
    chatPrompt: '',
    suggestionsContextWindow: 4000,
    detailedAnswersContextWindow: 6000,
    model: 'openai/gpt-oss-120b'
  });

  const handleSave = () => {
    setApiKey(key.trim());
    setSettings(localSettings);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>⚙ Settings</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* API Key */}
          <div style={styles.field}>
            <label style={styles.label}>API Key</label>
            <p style={styles.fieldHint}>
              Get your API key at{" "}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={styles.link}>
                console.groq.com
              </a>
            </p>
            <div style={styles.inputWrap}>
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="gsk_..."
                style={styles.input}
              />
              <button style={styles.eyeBtn} onClick={() => setShowKey((s) => !s)}>
                {showKey ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Model Configuration */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🤖 Model Configuration</h3>
            
            <div style={styles.field}>
              <label style={styles.label}>AI Model</label>
              <p style={styles.fieldHint}>Choose the AI model for suggestions and chat responses</p>
              <select
                value={localSettings.model}
                onChange={(e) => setLocalSettings(prev => ({...prev, model: e.target.value}))}
                style={styles.select}
              >
                <option value="openai/gpt-oss-120b">🔥 GPT-OSS 120B (Required)</option>
                <option value="llama-3.3-70b-versatile">⚡ LLaMA 3.3 70B (Versatile)</option>
                <option value="llama-3.1-8b-instant">🚀 LLaMA 3.1 8B (Instant)</option>
                <option value="mixtral-8x7b-32768">🔀 Mixtral 8x7B (32K)</option>
              </select>
            </div>
          </div>

          {/* Prompts Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Custom Prompts</h3>
            
            <div style={styles.field}>
              <label style={styles.label}>Live Suggestions Prompt</label>
              <p style={styles.fieldHint}>Customize the prompt used for generating live suggestions</p>
              <textarea
                value={localSettings.suggestionsPrompt}
                onChange={(e) => setLocalSettings(prev => ({...prev, suggestionsPrompt: e.target.value}))}
                placeholder="Leave empty to use default suggestions prompt..."
                style={styles.textarea}
                rows={4}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Detailed Answers Prompt</label>
              <p style={styles.fieldHint}>Customize the prompt used for expanded suggestion answers</p>
              <textarea
                value={localSettings.detailedAnswersPrompt}
                onChange={(e) => setLocalSettings(prev => ({...prev, detailedAnswersPrompt: e.target.value}))}
                placeholder="Leave empty to use default detailed answers prompt..."
                style={styles.textarea}
                rows={4}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Chat Prompt</label>
              <p style={styles.fieldHint}>Customize the system prompt for chat interactions</p>
              <textarea
                value={localSettings.chatPrompt}
                onChange={(e) => setLocalSettings(prev => ({...prev, chatPrompt: e.target.value}))}
                placeholder="Leave empty to use default chat prompt..."
                style={styles.textarea}
                rows={4}
              />
            </div>
          </div>

          {/* Context Windows Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🪟 Context Windows</h3>
            
            <div style={styles.field}>
              <label style={styles.label}>Suggestions Context Window</label>
              <p style={styles.fieldHint}>Maximum characters of transcript to consider for suggestions</p>
              <input
                type="number"
                value={localSettings.suggestionsContextWindow}
                onChange={(e) => setLocalSettings(prev => ({...prev, suggestionsContextWindow: parseInt(e.target.value) || 4000}))}
                min="1000"
                max="10000"
                step="500"
                style={styles.numberInput}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Detailed Answers Context Window</label>
              <p style={styles.fieldHint}>Maximum characters of transcript to consider for expanded answers</p>
              <input
                type="number"
                value={localSettings.detailedAnswersContextWindow}
                onChange={(e) => setLocalSettings(prev => ({...prev, detailedAnswersContextWindow: parseInt(e.target.value) || 6000}))}
                min="1000"
                max="15000"
                step="500"
                style={styles.numberInput}
              />
            </div>
          </div>

          {/* Info boxes */}
          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>🎤</div>
              <div>
                <div style={styles.infoTitle}>Whisper Large V3</div>
                <div style={styles.infoText}>Used for speech-to-text transcription</div>
              </div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>🤖</div>
              <div>
                <div style={styles.infoTitle}>LLaMA 3 70B</div>
                <div style={styles.infoText}>Generates suggestions & chat answers</div>
              </div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>⚡</div>
              <div>
                <div style={styles.infoTitle}>Ultra-fast inference</div>
                <div style={styles.infoText}>Groq hardware delivers sub-second latency</div>
              </div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoIcon}>🔒</div>
              <div>
                <div style={styles.infoTitle}>Local storage only</div>
                <div style={styles.infoText}>Your key is stored in memory, not on servers</div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.saveBtn, ...(saved ? styles.savedBtn : {}) }} onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    width: "640px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    overflow: "auto",
    animation: "fadeSlideIn 0.2s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid var(--border)",
  },
  title: {
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--text)",
  },
  closeBtn: {
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: "16px",
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: "6px",
  },
  body: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "var(--text)" },
  fieldHint: { fontSize: "12px", color: "var(--text-muted)" },
  link: { color: "var(--accent)", textDecoration: "none" },
  inputWrap: { display: "flex", gap: "8px" },
  input: {
    flex: 1,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text)",
    fontSize: "13px",
    padding: "10px 14px",
    fontFamily: "var(--mono)",
  },
  eyeBtn: {
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  infoBox: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "12px",
  },
  infoIcon: { fontSize: "18px", flexShrink: 0 },
  infoTitle: { fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" },
  infoText: { fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 },
  footer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    padding: "16px 24px",
    borderTop: "1px solid var(--border)",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text-muted)",
    fontSize: "13px",
    padding: "10px 20px",
    cursor: "pointer",
  },
  saveBtn: {
    background: "var(--accent)",
    color: "#fff",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
    padding: "10px 24px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  savedBtn: {
    background: "var(--accent3)",
    color: "#000",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "16px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  textarea: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text)",
    fontSize: "13px",
    padding: "10px 14px",
    fontFamily: "var(--mono)",
    resize: "vertical",
    minHeight: "80px",
  },
  numberInput: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text)",
    fontSize: "13px",
    padding: "10px 14px",
    fontFamily: "var(--mono)",
    width: "200px",
  },
  select: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text)",
    fontSize: "13px",
    padding: "10px 14px",
    fontFamily: "var(--mono)",
    width: "100%",
    cursor: "pointer",
  },
};