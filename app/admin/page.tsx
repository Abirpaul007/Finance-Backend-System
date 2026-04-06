"use client";

import { useEffect, useState, useMemo } from "react";

const CATEGORIES = ["General", "Food", "Transport", "Shopping", "Health", "Education", "Entertainment", "Salary", "Other"];

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    const init = async () => {
      try {
        const resUser = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await resUser.json();
        if (!resUser.ok || userData.role !== "ADMIN") {
          alert("Access denied");
          window.location.href = "/dashboard";
          return;
        }
        setUser(userData);
        const resRecords = await fetch("/api/records", { credentials: "include" });
        if (resRecords.ok) setRecords(await resRecords.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredRecords = useMemo(() => {
    let list = [...records];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.category.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.note || "").toLowerCase().includes(q) ||
        String(r.amount).includes(q)
      );
    }
    if (filterType !== "ALL") list = list.filter(r => r.type === filterType);
    if (filterCategory !== "ALL") list = list.filter(r => r.category === filterCategory);
    if (filterFrom) list = list.filter(r => new Date(r.date) >= new Date(filterFrom));
    if (filterTo) list = list.filter(r => new Date(r.date) <= new Date(filterTo));
    list.sort((a, b) => {
      const aVal = sortBy === "date" ? new Date(a.date).getTime() : a.amount;
      const bVal = sortBy === "date" ? new Date(b.date).getTime() : b.amount;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return list;
  }, [records, search, filterType, filterCategory, filterFrom, filterTo, sortBy, sortDir]);

  const totalIncome = filteredRecords.filter(r => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);
  const totalExpense = filteredRecords.filter(r => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);

  const saveRecord = async () => {
    setError("");
    if (!amount) { setError("Amount is required"); return; }
    setAdding(true);
    try {
      const url = editingId ? `/api/records/${editingId}` : "/api/records";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), type, category, date: new Date(date), note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.details?.map((d: any) => d.message).join(", ") || data.error || "Something went wrong");
        return;
      }
      if (editingId) setRecords(prev => prev.map(r => r.id === editingId ? data : r));
      else setRecords(prev => [...prev, data]);
      resetForm();
      setFormOpen(false);
    } catch {
      setError("Server error");
    } finally {
      setAdding(false);
    }
  };

  const resetForm = () => {
    setEditingId(null); setAmount(""); setCategory("General");
    setType("INCOME"); setDate(new Date().toISOString().split("T")[0]);
    setNote(""); setError("");
  };

  const startEdit = (record: any) => {
    setEditingId(record.id); setAmount(record.amount.toString());
    setType(record.type); setCategory(record.category);
    setDate(new Date(record.date).toISOString().split("T")[0]);
    setNote(record.note || ""); setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => { resetForm(); setFormOpen(false); };

  const deleteRecord = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    const res = await fetch(`/api/records/${id}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) { alert("Delete failed"); return; }
    setRecords(records.filter(r => r.id !== id));
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: "date" | "amount" }) => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 4, opacity: sortBy === field ? 1 : 0.3 }}>
      {sortBy === field && sortDir === "asc"
        ? <path d="M5 2L9 8H1L5 2Z" fill="currentColor"/>
        : <path d="M5 8L1 2H9L5 8Z" fill="currentColor"/>
      }
    </svg>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(0,0,0,0.08)", borderTop: "2px solid #111", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Loading admin panel…</p>
      </div>
    </div>
  );
  if (!user) return null;

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
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>/ Admin</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.location.href = "/analytics"} style={navBtnStyle}>Analytics</button>
          <button onClick={() => window.location.href = "/dashboard"} style={navBtnStyle}>Dashboard</button>
          <button onClick={() => window.location.href = "/admin/users"} style={{ ...navBtnStyle, background: "#111", color: "#fff", border: "0.5px solid #111" }}>
            Manage users
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: "#111", margin: "0 0 2px" }}>Admin panel</h1>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Manage all financial records.</p>
          </div>
          <button
            onClick={() => { resetForm(); setFormOpen(o => !o); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, fontWeight: 500, background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {formOpen && !editingId ? "Cancel" : "Add record"}
          </button>
        </div>

        {/* Form */}
        {formOpen && (
          <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#111", margin: "0 0 1.25rem" }}>
              {editingId ? "Edit record" : "New record"}
            </p>

            {error && (
              <div style={{ background: "#fff0f0", border: "0.5px solid #f5c1c1", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#c0392b" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Amount (₹)</label>
                <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["INCOME", "EXPENSE"].map(t => (
                    <button key={t} onClick={() => setType(t)} style={{
                      flex: 1, padding: "9px 6px", fontSize: 12, fontWeight: 500, borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                      border: type === t ? "1.5px solid #111" : "0.5px solid rgba(0,0,0,0.15)",
                      background: type === t ? "#111" : "#fff",
                      color: type === t ? "#fff" : "#555",
                    }}>{t === "INCOME" ? "Income" : "Expense"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, background: "#fff" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Note (optional)</label>
                <input placeholder="Add a note…" value={note} onChange={e => setNote(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveRecord} disabled={adding} style={{
                padding: "9px 20px", fontSize: 13, fontWeight: 500, background: "#111", color: "#fff",
                border: "none", borderRadius: 8, cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.6 : 1,
              }}>
                {adding ? "Saving…" : editingId ? "Update record" : "Add record"}
              </button>
              {editingId && (
                <button onClick={cancelEdit} style={{ padding: "9px 16px", fontSize: 13, fontWeight: 500, background: "#fff", color: "#111", border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, cursor: "pointer" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 14 }}>
          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by category, note, amount…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 34, width: "100%", boxSizing: "border-box" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", lineHeight: 0, padding: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Filter row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {/* Type filter */}
            <div style={{ display: "flex", gap: 4 }}>
              {["ALL", "INCOME", "EXPENSE"].map(t => (
                <button key={t} onClick={() => setFilterType(t)} style={{
                  padding: "5px 12px", fontSize: 12, fontWeight: 500, borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
                  background: filterType === t ? "#111" : "#f3f3f1",
                  color: filterType === t ? "#fff" : "#555",
                  border: "none",
                }}>
                  {t === "ALL" ? "All types" : t === "INCOME" ? "Income" : "Expense"}
                </button>
              ))}
            </div>

            <div style={{ width: "0.5px", height: 20, background: "rgba(0,0,0,0.1)" }} />

            {/* Category filter */}
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              style={{ padding: "5px 10px", fontSize: 12, borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", background: "#fff", color: "#555", cursor: "pointer" }}>
              <option value="ALL">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Date range */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>From</span>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                style={{ padding: "5px 8px", fontSize: 12, borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", color: "#555" }} />
              <span style={{ fontSize: 12, color: "#aaa" }}>To</span>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                style={{ padding: "5px 8px", fontSize: 12, borderRadius: 8, border: "0.5px solid rgba(0,0,0,0.15)", color: "#555" }} />
            </div>

            {/* Clear filters */}
            {(search || filterType !== "ALL" || filterCategory !== "ALL" || filterFrom || filterTo) && (
              <button onClick={() => { setSearch(""); setFilterType("ALL"); setFilterCategory("ALL"); setFilterFrom(""); setFilterTo(""); }}
                style={{ padding: "5px 12px", fontSize: 12, color: "#c0392b", background: "#fff0f0", border: "none", borderRadius: 20, cursor: "pointer" }}>
                Clear all
              </button>
            )}

            <div style={{ marginLeft: "auto", fontSize: 12, color: "#aaa" }}>
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Filtered income", value: totalIncome, color: "#1D9E75" },
            { label: "Filtered expense", value: totalExpense, color: "#c0392b" },
            { label: "Net balance", value: totalIncome - totalExpense, color: "#111" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", letterSpacing: "0.02em" }}>{c.label}</p>
              <p style={{ fontSize: 20, fontWeight: 500, color: c.color, margin: 0 }}>₹ {Number(c.value).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        {/* Records table */}
        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
          {filteredRecords.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontSize: 14, color: "#bbb", margin: 0 }}>No records match your filters.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                  {[
                    { label: "Date", field: "date" as const },
                    { label: "Category", field: null },
                    { label: "Type", field: null },
                    { label: "Amount", field: "amount" as const },
                    { label: "Note", field: null },
                    { label: "", field: null },
                  ].map((col, i) => (
                    <th key={i} onClick={() => col.field && toggleSort(col.field)}
                      style={{ textAlign: "left", padding: "11px 14px", color: "#888", fontWeight: 500, whiteSpace: "nowrap", cursor: col.field ? "pointer" : "default", userSelect: "none" }}>
                      <span style={{ display: "inline-flex", alignItems: "center" }}>
                        {col.label}
                        {col.field && <SortIcon field={col.field} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: idx < filteredRecords.length - 1 ? "0.5px solid rgba(0,0,0,0.05)" : "none", background: editingId === r.id ? "#fafafa" : "transparent" }}>
                    <td style={{ padding: "11px 14px", color: "#888", whiteSpace: "nowrap" }}>
                      {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "11px 14px", color: "#111" }}>{r.category}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20,
                        background: r.type === "INCOME" ? "#eaf3de" : "#fff0f0",
                        color: r.type === "INCOME" ? "#3B6D11" : "#c0392b",
                      }}>{r.type}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontWeight: 500, color: r.type === "INCOME" ? "#1D9E75" : "#e24b4a", whiteSpace: "nowrap" }}>
                      {r.type === "INCOME" ? "+" : "−"}₹ {Number(r.amount).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "11px 14px", color: "#aaa", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.note || "—"}
                    </td>
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => startEdit(r)} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: "#f3f3f1", color: "#111", border: "none", borderRadius: 7, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => deleteRecord(r.id)} style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: 7, cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, color: "#888",
  marginBottom: 6, letterSpacing: "0.02em",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 12px",
  fontSize: 13, color: "#111", background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, outline: "none",
};

const navBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", fontSize: 13, fontWeight: 500,
  background: "#fff", color: "#111", borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.18)", cursor: "pointer",
};