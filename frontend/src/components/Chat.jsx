import { useState, useEffect, useRef } from "react";

export default function Chat({ history, onSend }) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || isSending) return;
    setInput("");
    setIsSending(true);
    await onSend(q);
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>
          <span style={{ color: "var(--accent2)" }}>◇</span> Chat
        </div>
        <span style={styles.msgCount}>{history.length} messages</span>
      </div>

      <div style={styles.messages}>
        {history.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>💬</div>
            <p style={styles.emptyText}>Ask anything about your meeting</p>
            <p style={styles.emptyHint}>Or click a suggestion to expand it here</p>
          </div>
        ) : (
          history.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant),
                animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
              }}
            >
              {msg.type === "suggestion" && (
                <span style={styles.suggestionTag}>from suggestion</span>
              )}
              <p style={styles.bubbleText}>{msg.content}</p>
            </div>
          ))
        )}

        {isSending && (
          <div style={{ ...styles.bubble, ...styles.bubbleAssistant }}>
            <div style={styles.typing}>
              <span style={styles.typingDot} />
              <span style={{ ...styles.typingDot, animationDelay: "0.15s" }} />
              <span style={{ ...styles.typingDot, animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the meeting… (Enter to send)"
          rows={2}
          disabled={isSending}
        />
        <button
          style={{
            ...styles.sendBtn,
            ...(isSending || !input.trim() ? styles.sendBtnDisabled : {}),
          }}
          onClick={handleSend}
          disabled={isSending || !input.trim()}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  msgCount: {
    fontFamily: "var(--mono)",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "10px",
    opacity: 0.5,
  },
  emptyIcon: { fontSize: "36px" },
  emptyText: { fontSize: "13px", color: "var(--text-muted)", textAlign: "center" },
  emptyHint: { fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--mono)", textAlign: "center" },
  bubble: {
    maxWidth: "88%",
    borderRadius: "var(--radius)",
    padding: "10px 14px",
    animation: "fadeSlideIn 0.25s ease both",
    position: "relative",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    background: "var(--accent)",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderBottomLeftRadius: "4px",
  },
  suggestionTag: {
    display: "inline-block",
    fontSize: "9px",
    fontFamily: "var(--mono)",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "4px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  bubbleText: {
    fontSize: "13px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  typing: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "2px 0",
  },
  typingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--text-muted)",
    display: "inline-block",
    animation: "pulse-ring 0.9s ease-in-out infinite",
  },
  inputArea: {
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
    background: "var(--surface)",
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text)",
    fontSize: "13px",
    padding: "10px 14px",
    resize: "none",
    lineHeight: 1.5,
    transition: "border-color 0.2s",
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "var(--accent)",
    color: "#fff",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
    cursor: "pointer",
  },
  sendBtnDisabled: {
    background: "var(--surface2)",
    color: "var(--text-muted)",
    cursor: "not-allowed",
  },
};