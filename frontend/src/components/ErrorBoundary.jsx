import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={styles.wrap}>
        <div style={styles.box}>
          <div style={styles.icon}>⚠</div>
          <h2 style={styles.title}>Something went wrong</h2>
          <p style={styles.msg}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button style={styles.btn} onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: "40px",
    background: "var(--bg)",
  },
  box: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    maxWidth: "400px",
  },
  icon: { fontSize: "48px", color: "var(--accent2)" },
  title: { fontSize: "18px", fontWeight: 700, color: "var(--text)" },
  msg: { fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, fontFamily: "var(--mono)" },
  btn: {
    marginTop: "8px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 28px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};