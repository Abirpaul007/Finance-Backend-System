export default function Home() {
  const features = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: "Expense tracking",
      desc: "Monitor every transaction in real time.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: "Live analytics",
      desc: "Visualize trends and spot opportunities.",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: "Role-based access",
      desc: "Viewer, Analyst, and Admin controls.",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#f9f9f8",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", flexDirection: "column",
    }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2rem", background: "#fff",
        borderBottom: "0.5px solid rgba(0,0,0,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>Finance</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/login" style={ghostBtnStyle}>Sign in</a>
          <a href="/register" style={solidBtnStyle}>Get started</a>
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "5rem 2rem 3rem",
      }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 500,
          color: "#555", background: "#fff", border: "0.5px solid rgba(0,0,0,0.15)",
          borderRadius: 20, padding: "4px 14px", marginBottom: "1.5rem",
          letterSpacing: "0.04em",
        }}>
          Personal finance, simplified
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 500,
          color: "#111", margin: "0 0 1.25rem", lineHeight: 1.2,
          maxWidth: 600,
        }}>
          Take control of your financial dashboard
        </h1>

        <p style={{
          fontSize: 16, color: "#888", maxWidth: 440,
          lineHeight: 1.7, margin: "0 0 2.5rem",
        }}>
          Track spending, analyse trends, and manage your money — all in one clean dashboard built for clarity.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: "4rem" }}>
          <a href="/register" style={{ ...solidBtnStyle, padding: "10px 24px", fontSize: 14 }}>
            Create free account
          </a>
          <a href="/dashboard" style={{ ...ghostBtnStyle, padding: "10px 24px", fontSize: 14 }}>
            View dashboard →
          </a>
        </div>

        {/* Feature cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12, width: "100%", maxWidth: 620,
        }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 12, padding: "1.25rem", textAlign: "left",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: "#f3f3f1",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#555", marginBottom: "0.75rem",
              }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#111", margin: "0 0 4px" }}>
                {f.title}
              </p>
              <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "1.5rem",
        fontSize: 12, color: "#bbb",
        borderTop: "0.5px solid rgba(0,0,0,0.08)",
      }}>
        © {new Date().getFullYear()} Finflow. All rights reserved.
      </footer>

    </div>
  );
}

const solidBtnStyle: React.CSSProperties = {
  display: "inline-block", padding: "8px 18px", fontSize: 13, fontWeight: 500,
  background: "#111", color: "#fff", borderRadius: 8,
  textDecoration: "none", border: "0.5px solid #111",
  transition: "opacity 0.15s", cursor: "pointer",
};

const ghostBtnStyle: React.CSSProperties = {
  display: "inline-block", padding: "8px 18px", fontSize: 13, fontWeight: 500,
  background: "#fff", color: "#111", borderRadius: 8,
  textDecoration: "none", border: "0.5px solid rgba(0,0,0,0.18)",
  transition: "opacity 0.15s", cursor: "pointer",
};