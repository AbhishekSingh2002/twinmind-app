import { useState } from "react";

export default function Settings({ apiKey, setApiKey, onClose }) {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(key.trim());
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
            <label style={styles.label}>Groq API Key</label>
            <p style={styles.fieldHint}>
              Get your key at{" "}
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
    width: "480px",
    maxWidth: "90vw",
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
};