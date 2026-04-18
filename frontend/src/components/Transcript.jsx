import { useRecorder } from "../hooks/useRecorder";

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function Transcript({ chunks, isDemo, apiKey, onChunk, onError }) {
  const { isRecording, duration, start, stop } = useRecorder({
    apiKey,
    onChunk,
    onError,
    onStatus: () => {},
  });

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.title}><span style={{ color: "var(--accent3)" }}>◎</span> Transcript</div>
        <div style={s.headerRight}>
          {isDemo && <span style={s.demoBadge}>DEMO</span>}
          {isRecording && <span style={s.duration}>{fmt(duration)}</span>}
          <span style={s.wordCount}>{chunks.reduce((n, c) => n + c.text.split(" ").length, 0)} words</span>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        {chunks.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🎤</div>
            <p style={s.emptyText}>Start recording to see live transcript here</p>
            <p style={s.emptyHint}>Audio sent to Whisper every 30 seconds · Or try Demo</p>
          </div>
        ) : (
          chunks.map((chunk, i) => (
            <div key={i} style={{ ...s.chunk, animationDelay: `${i * 0.04}s` }}>
              <span style={s.chunkTime}>{new Date(chunk.time).toLocaleTimeString()}</span>
              <p style={s.chunkText}>{chunk.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <button
          style={{ ...s.recordBtn, ...(isRecording ? s.recordBtnActive : {}) }}
          onClick={isRecording ? stop : start}
          disabled={isDemo}
        >
          {isRecording
            ? <><span style={s.stopIcon} /> Stop Recording</>
            : <><span style={s.dot} /> Start Recording</>}
        </button>
        <p style={s.hint}>
          {isDemo
            ? "Demo mode active — clear session to use mic"
            : isRecording
              ? "Recording… auto-transcribes every 30s"
              : "Click to capture meeting audio via Whisper"}
        </p>
      </div>

      {isRecording && <div style={s.pulse} />}
    </div>
  );
}

const s = {
  panel: { display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", position: "relative", overflow: "hidden" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 },
  title: { fontSize: "13px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "8px" },
  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  demoBadge: { fontFamily: "var(--mono)", fontSize: "9px", color: "var(--accent3)", border: "1px solid var(--accent3)", borderRadius: "4px", padding: "1px 6px", letterSpacing: "1px" },
  duration: { fontFamily: "var(--mono)", fontSize: "12px", color: "var(--accent2)", background: "rgba(250,109,143,0.1)", border: "1px solid rgba(250,109,143,0.2)", borderRadius: "6px", padding: "2px 8px" },
  wordCount: { fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text-muted)" },
  body: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "10px", opacity: 0.5 },
  emptyIcon: { fontSize: "40px" },
  emptyText: { fontSize: "14px", color: "var(--text-muted)", textAlign: "center" },
  emptyHint: { fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--mono)", textAlign: "center" },
  chunk: { background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "12px 14px", animation: "fadeSlideIn 0.3s ease both" },
  chunkTime: { fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "6px" },
  chunkText: { fontSize: "14px", lineHeight: 1.6, color: "var(--text)" },
  footer: { padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 },
  recordBtn: { width: "100%", padding: "12px", borderRadius: "var(--radius)", background: "var(--accent)", color: "#fff", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" },
  recordBtnActive: { background: "var(--accent2)" },
  dot: { display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#fff", flexShrink: 0 },
  stopIcon: { display: "inline-block", width: "10px", height: "10px", background: "#fff", borderRadius: "2px", flexShrink: 0 },
  hint: { fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "8px", fontFamily: "var(--mono)" },
  pulse: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "300px", height: "300px", borderRadius: "50%", border: "2px solid var(--accent2)", animation: "pulse-ring 2s ease-in-out infinite", pointerEvents: "none", opacity: 0.06 },
};