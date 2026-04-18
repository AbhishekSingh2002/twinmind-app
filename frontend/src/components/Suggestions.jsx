const TYPE_COLORS = {
  question: { bg: "rgba(124,109,250,0.08)", border: "rgba(124,109,250,0.25)", accent: "#7c6dfa", label: "bg" },
  insight:  { bg: "rgba(109,250,188,0.08)", border: "rgba(109,250,188,0.25)", accent: "#6dfabc", label: "bg" },
  clarify:  { bg: "rgba(250,200,109,0.08)", border: "rgba(250,200,109,0.25)", accent: "#fac86d", label: "bg" },
};

export default function Suggestions({ suggestions, isLoading, onSuggestionClick }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>
          <span style={{ color: "var(--accent)" }}>◈</span> AI Suggestions
        </div>
        {isLoading && <LoadingDots />}
      </div>

      <div style={styles.body}>
        {/* Loading skeleton */}
        {isLoading && suggestions.length === 0 && (
          <div style={styles.skeletonWrap}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...styles.skeleton, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && suggestions.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✦</div>
            <p style={styles.emptyText}>Suggestions appear here as you speak</p>
            <p style={styles.emptyHint}>Updated every 30 seconds of conversation</p>
          </div>
        )}

        {/* Suggestion cards */}
        {suggestions.map((s, i) => {
          const theme = TYPE_COLORS[s.type] || TYPE_COLORS.question;
          return (
            <button
              key={s.id || i}
              style={{
                ...styles.card,
                background: theme.bg,
                borderColor: theme.border,
                animationDelay: `${i * 0.1}s`,
              }}
              onClick={() => onSuggestionClick(s)}
            >
              <div style={styles.cardTop}>
                <span style={{ ...styles.badge, color: theme.accent, borderColor: theme.border }}>
                  {s.icon} {s.label}
                </span>
                <span style={styles.arrowHint}>→</span>
              </div>
              <p style={styles.cardText}>{s.text}</p>
              <p style={styles.cardAction}>Click to get detailed answer</p>
            </button>
          );
        })}

        {/* Tips */}
        {!isLoading && suggestions.length > 0 && (
          <div style={styles.tip}>
            <span style={styles.tipIcon}>💬</span>
            Click any suggestion to open it in chat
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div style={dotsStyle.wrap}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ ...dotsStyle.dot, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

const dotsStyle = {
  wrap: { display: "flex", gap: "4px", alignItems: "center" },
  dot: {
    width: "5px", height: "5px",
    borderRadius: "50%",
    background: "var(--accent)",
    animation: "pulse-ring 0.8s ease-in-out infinite",
    display: "inline-block",
  },
};

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--border)",
    background: "var(--surface)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
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
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  skeletonWrap: { display: "flex", flexDirection: "column", gap: "12px" },
  skeleton: {
    height: "90px",
    borderRadius: "var(--radius)",
    background: "linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s ease-in-out infinite",
    border: "1px solid var(--border)",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "10px",
    opacity: 0.5,
    padding: "20px",
  },
  emptyIcon: { fontSize: "32px" },
  emptyText: { fontSize: "13px", color: "var(--text-muted)", textAlign: "center" },
  emptyHint: { fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--mono)", textAlign: "center" },
  card: {
    width: "100%",
    textAlign: "left",
    border: "1px solid",
    borderRadius: "var(--radius)",
    padding: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    animation: "fadeSlideIn 0.35s ease both",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    fontSize: "10px",
    fontFamily: "var(--mono)",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    border: "1px solid",
    borderRadius: "5px",
    padding: "2px 7px",
  },
  arrowHint: {
    fontSize: "14px",
    color: "var(--text-muted)",
    transition: "transform 0.2s",
  },
  cardText: {
    fontSize: "13px",
    lineHeight: 1.55,
    color: "var(--text)",
    fontWeight: 500,
  },
  cardAction: {
    fontSize: "10px",
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
  },
  tip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
    padding: "8px 4px",
    justifyContent: "center",
  },
  tipIcon: { fontSize: "14px" },
};