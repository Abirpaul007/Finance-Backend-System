"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    if (res.ok) window.location.href = "/login";
    else alert("Logout failed");
  };

  useEffect(() => {
    const init = async () => {
      try {
        const resUser = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await resUser.json();
        if (!resUser.ok) { window.location.href = "/login"; return; }
        setUser(userData);

        const resAnalytics = await fetch("/api/analytics", { credentials: "include" });
        if (resAnalytics.ok) setData(await resAnalytics.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f9f9f8",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, border: "2px solid rgba(0,0,0,0.08)",
          borderTop: "2px solid #111", borderRadius: "50%",
          animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  if (!user || !data) return null;

  const summaryCards = [
    { label: "Income", value: data.income, color: "#1D9E75", bg: "#eaf3de" },
    { label: "Expense", value: data.expense, color: "#c0392b", bg: "#fff0f0" },
    { label: "Balance", value: data.balance, color: "#111", bg: "#f3f3f1" },
  ];

  const typeColor = (type: string) =>
    type === "INCOME" ? "#1D9E75" : "#c0392b";

  const roleBadgeStyle = (role: string): React.CSSProperties => {
    const map: Record<string, { bg: string; color: string }> = {
      ADMIN:    { bg: "#111",    color: "#fff" },
      ANALYST:  { bg: "#eaf3de", color: "#3B6D11" },
      VIEWER:   { bg: "#f3f3f1", color: "#555" },
    };
    const s = map[role] || map.VIEWER;
    return {
      display: "inline-block", fontSize: 11, fontWeight: 500,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color, letterSpacing: "0.04em",
    };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 2rem", background: "#fff",
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
          <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>Finflow</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#111", margin: 0 }}>{user.email}</p>
            <span style={roleBadgeStyle(user.role)}>{user.role}</span>
          </div>
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", fontSize: 13, fontWeight: 500,
            background: "#fff", color: "#111", borderRadius: 8,
            border: "0.5px solid rgba(0,0,0,0.18)", cursor: "pointer",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Page title + nav buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: "#111", margin: "0 0 2px" }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Here's what's happening with your finances.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {user.role !== "VIEWER" && (
              <button onClick={() => window.location.href = "/analytics"} style={navBtnStyle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Analytics
              </button>
            )}
            {user.role === "ADMIN" && (
              <>
                <button onClick={() => window.location.href = "/admin"} style={navBtnStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Admin
                </button>
                <button onClick={() => window.location.href = "/admin/users"} style={navBtnStyle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Manage users
                </button>
              </>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.75rem" }}>
          {summaryCards.map(c => (
            <div key={c.label} style={{
              background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: 12, padding: "1.25rem",
            }}>
              <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", letterSpacing: "0.02em" }}>{c.label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: c.color, margin: 0 }}>
                ₹ {Number(c.value).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

          {/* Category totals */}
          <div style={cardStyle}>
            <p style={cardTitleStyle}>Category totals</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.categoryTotals.map((c: any, i: number) => {
                const max = Math.max(...data.categoryTotals.map((x: any) => x.total));
                const pct = Math.round((c.total / max) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#555" }}>{c.category}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>
                        ₹ {Number(c.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "rgba(0,0,0,0.07)", borderRadius: 2 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: "#111", borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly trends */}
          <div style={cardStyle}>
            <p style={cardTitleStyle}>Monthly trends</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.monthly.map((m: any, i: number) => {
                const max = Math.max(...data.monthly.map((x: any) => x.total));
                const pct = Math.round((m.total / max) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#555" }}>{m.month}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>
                        ₹ {Number(m.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "rgba(0,0,0,0.07)", borderRadius: 2 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: "#1D9E75", borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div style={cardStyle}>
          <p style={cardTitleStyle}>Recent activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.recent.map((r: any) => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "0.5px solid rgba(0,0,0,0.07)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: r.type === "INCOME" ? "#eaf3de" : "#fff0f0",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={typeColor(r.type)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {r.type === "INCOME"
                        ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                      }
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#111", margin: 0 }}>{r.category}</p>
                    <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{r.type}</p>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: typeColor(r.type) }}>
                  {r.type === "INCOME" ? "+" : "−"}₹ {Number(r.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.1)",
  borderRadius: 12,
  padding: "1.25rem",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500, color: "#111",
  margin: "0 0 1rem", letterSpacing: "0.01em",
};

const navBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", fontSize: 13, fontWeight: 500,
  background: "#fff", color: "#111", borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.18)", cursor: "pointer",
};