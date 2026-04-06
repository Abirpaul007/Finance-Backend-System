"use client";

import { useEffect, useRef, useState } from "react";

export default function Analytics() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [categoryData, setCategoryData] = useState<{ category: string; total: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; income: number; expense: number }[]>([]);

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const resUser = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await resUser.json();
        if (!resUser.ok || (userData.role !== "ADMIN" && userData.role !== "ANALYST")) {
          alert("Access denied");
          window.location.href = "/dashboard";
          return;
        }
        setUser(userData);

        const resRecords = await fetch("/api/records", { credentials: "include" });
        if (resRecords.ok) {
          const data = await resRecords.json();
          setRecords(data);

          const totalIncome = data.filter((r: any) => r.type === "INCOME").reduce((s: number, r: any) => s + r.amount, 0);
          const totalExpense = data.filter((r: any) => r.type === "EXPENSE").reduce((s: number, r: any) => s + r.amount, 0);
          setIncome(totalIncome);
          setExpense(totalExpense);
          setBalance(totalIncome - totalExpense);

          const catMap: any = {};
          data.forEach((r: any) => { catMap[r.category] = (catMap[r.category] || 0) + r.amount; });
          setCategoryData(Object.keys(catMap).map(k => ({ category: k, total: catMap[k] })));

          const monthMap: any = {};
          data.forEach((r: any) => {
            const month = r.date ? new Date(r.date).toLocaleString("default", { month: "short", year: "2-digit" }) : "Unknown";
            if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
            if (r.type === "INCOME") monthMap[month].income += r.amount;
            else monthMap[month].expense += r.amount;
          });
          setMonthlyData(Object.keys(monthMap).map(k => ({ month: k, ...monthMap[k] })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Draw charts after data loads
  useEffect(() => {
    if (!categoryData.length && !monthlyData.length) return;

    // destroy old instances
    chartInstances.current.forEach(c => c?.destroy());
    chartInstances.current = [];

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    script.onload = () => {
      const Chart = (window as any).Chart;
      const textColor = "#555";
      const gridColor = "rgba(0,0,0,0.06)";

      // --- Bar: Income vs Expense ---
      if (barChartRef.current && monthlyData.length) {
        const c = new Chart(barChartRef.current, {
          type: "bar",
          data: {
            labels: monthlyData.map(m => m.month),
            datasets: [
              { label: "Income", data: monthlyData.map(m => m.income), backgroundColor: "#1D9E75", borderRadius: 5, barPercentage: 0.6 },
              { label: "Expense", data: monthlyData.map(m => m.expense), backgroundColor: "#e24b4a", borderRadius: 5, barPercentage: 0.6 },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor, font: { size: 12 }, boxWidth: 12 } } },
            scales: {
              x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
              y: { ticks: { color: textColor, font: { size: 11 }, callback: (v: number) => `₹${v.toLocaleString("en-IN")}` }, grid: { color: gridColor } },
            },
          },
        });
        chartInstances.current.push(c);
      }

      // --- Line: Monthly trend ---
      if (lineChartRef.current && monthlyData.length) {
        const c = new Chart(lineChartRef.current, {
          type: "line",
          data: {
            labels: monthlyData.map(m => m.month),
            datasets: [
              { label: "Income", data: monthlyData.map(m => m.income), borderColor: "#1D9E75", backgroundColor: "rgba(29,158,117,0.08)", pointBackgroundColor: "#1D9E75", tension: 0.4, fill: true, pointRadius: 4 },
              { label: "Expense", data: monthlyData.map(m => m.expense), borderColor: "#e24b4a", backgroundColor: "rgba(226,75,74,0.07)", pointBackgroundColor: "#e24b4a", tension: 0.4, fill: true, pointRadius: 4 },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor, font: { size: 12 }, boxWidth: 12 } } },
            scales: {
              x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
              y: { ticks: { color: textColor, font: { size: 11 }, callback: (v: number) => `₹${v.toLocaleString("en-IN")}` }, grid: { color: gridColor } },
            },
          },
        });
        chartInstances.current.push(c);
      }

      // --- Donut: Category breakdown ---
      if (donutRef.current && categoryData.length) {
        const palette = ["#1D9E75", "#e24b4a", "#ef9f27", "#378ADD", "#D4537E", "#7F77DD", "#888780", "#639922"];
        const c = new Chart(donutRef.current, {
          type: "doughnut",
          data: {
            labels: categoryData.map(c => c.category),
            datasets: [{
              data: categoryData.map(c => c.total),
              backgroundColor: palette.slice(0, categoryData.length),
              borderWidth: 2,
              borderColor: "#fff",
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            cutout: "68%",
            plugins: {
              legend: { position: "right", labels: { color: textColor, font: { size: 12 }, boxWidth: 12, padding: 14 } },
            },
          },
        });
        chartInstances.current.push(c);
      }
    };
    document.body.appendChild(script);
    return () => { chartInstances.current.forEach(c => c?.destroy()); };
  }, [categoryData, monthlyData]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(0,0,0,0.08)", borderTop: "2px solid #111", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Loading analytics…</p>
      </div>
    </div>
  );

  if (!user) return null;

  const summaryCards = [
    { label: "Total income",  value: income,  color: "#1D9E75", bg: "#eaf3de" },
    { label: "Total expense", value: expense, color: "#c0392b", bg: "#fff0f0" },
    { label: "Net balance",   value: balance, color: "#111",    bg: "#f3f3f1" },
  ];

  const palette = ["#1D9E75", "#e24b4a", "#ef9f27", "#378ADD", "#D4537E", "#7F77DD", "#888780", "#639922"];
  const maxCat = Math.max(...categoryData.map(c => c.total), 1);

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>Finflow</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.location.href = "/dashboard"} style={navBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </button>
          {user.role === "ADMIN" && (
            <button onClick={() => window.location.href = "/admin/users"} style={navBtnStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Manage users
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#111", margin: "0 0 2px" }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>A full breakdown of your financial activity.</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
          {summaryCards.map(c => (
            <div key={c.label} style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "1.25rem" }}>
              <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", letterSpacing: "0.02em" }}>{c.label}</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: c.color, margin: 0 }}>
                ₹ {Number(c.value).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        {/* Income vs Expense bar */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <p style={cardTitleStyle}>Income vs expense — monthly</p>
          <div style={{ height: 240 }}>
            <canvas ref={barChartRef} />
          </div>
        </div>

        {/* Line chart */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <p style={cardTitleStyle}>Trend over time</p>
          <div style={{ height: 220 }}>
            <canvas ref={lineChartRef} />
          </div>
        </div>

        {/* Donut + Category bars side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

          <div style={cardStyle}>
            <p style={cardTitleStyle}>Spend by category</p>
            <div style={{ height: 220 }}>
              <canvas ref={donutRef} />
            </div>
          </div>

          <div style={cardStyle}>
            <p style={cardTitleStyle}>Category breakdown</p>
            {categoryData.length === 0 && <p style={{ fontSize: 13, color: "#aaa" }}>No data available.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categoryData.map((c, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: palette[i % palette.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#555" }}>{c.category}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>
                      ₹ {Number(c.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ height: 4, background: "rgba(0,0,0,0.07)", borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${Math.round((c.total / maxCat) * 100)}%`, background: palette[i % palette.length], borderRadius: 2, transition: "width 0.4s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Records table */}
        {records.length > 0 && (
          <div style={cardStyle}>
            <p style={cardTitleStyle}>All records</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Date", "Category", "Type", "Amount"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: "#888", fontWeight: 500, borderBottom: "0.5px solid rgba(0,0,0,0.08)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                      <td style={{ padding: "9px 8px", color: "#888" }}>{r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}</td>
                      <td style={{ padding: "9px 8px", color: "#111" }}>{r.category}</td>
                      <td style={{ padding: "9px 8px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20,
                          background: r.type === "INCOME" ? "#eaf3de" : "#fff0f0",
                          color: r.type === "INCOME" ? "#3B6D11" : "#c0392b",
                        }}>{r.type}</span>
                      </td>
                      <td style={{ padding: "9px 8px", fontWeight: 500, color: r.type === "INCOME" ? "#1D9E75" : "#e24b4a" }}>
                        {r.type === "INCOME" ? "+" : "−"}₹ {Number(r.amount).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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