"use client";

import { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) {
        alert("Unauthorized");
        window.location.href = "/dashboard";
        return;
      }
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
    setDeletingId(null);
    if (!res.ok) { alert("Delete failed"); return; }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const roles = ["ALL", ...Array.from(new Set(users.map((u) => u.role).filter(Boolean)))];

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  function getInitials(name: string) {
    return (name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f8" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid rgba(0,0,0,0.08)", borderTop: "2px solid #111", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Loading users…</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f8", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: "#111" }}>Finflow</span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>/ Users</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.location.href = "/analytics"} style={navBtnStyle}>Analytics</button>
          <button onClick={() => window.location.href = "/dashboard"} style={navBtnStyle}>Dashboard</button>
          <button onClick={() => window.location.href = "/admin"} style={{ ...navBtnStyle, background: "#111", color: "#fff", border: "0.5px solid #111" }}>
            Admin panel
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: "#111", margin: "0 0 2px" }}>Manage users</h1>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>View and manage all registered accounts.</p>
          </div>
          <div style={{ fontSize: 13, color: "#888", background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "6px 14px" }}>
            <span style={{ color: "#111", fontWeight: 500 }}>{filtered.length}</span> / {users.length} users
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 14 }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by name, email or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 34, width: "100%", boxSizing: "border-box" as const }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", lineHeight: 0, padding: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Role filters */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, alignItems: "center" }}>
            {roles.map(role => (
              <button key={role} onClick={() => setFilterRole(role)} style={{
                padding: "5px 12px", fontSize: 12, fontWeight: 500, borderRadius: 20, cursor: "pointer",
                background: filterRole === role ? "#111" : "#f3f3f1",
                color: filterRole === role ? "#fff" : "#555",
                border: "none",
              }}>
                {role === "ALL" ? "All roles" : role}
              </button>
            ))}
            {(search || filterRole !== "ALL") && (
              <button onClick={() => { setSearch(""); setFilterRole("ALL"); }}
                style={{ padding: "5px 12px", fontSize: 12, color: "#c0392b", background: "#fff0f0", border: "none", borderRadius: 20, cursor: "pointer", marginLeft: 4 }}>
                Clear
              </button>
            )}
            <div style={{ marginLeft: "auto", fontSize: 12, color: "#aaa" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontSize: 14, color: "#bbb", margin: 0 }}>No users match your search.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                  {["User", "Email", "Role", ""].map((col, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "11px 14px", color: "#888", fontWeight: 500, whiteSpace: "nowrap" as const }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: idx < filtered.length - 1 ? "0.5px solid rgba(0,0,0,0.05)" : "none" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: "#f3f3f1", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 600, color: "#555", flexShrink: 0,
                        }}>
                          {getInitials(u.name)}
                        </div>
                        <span style={{ fontWeight: 500, color: "#111" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", color: "#888" }}>{u.email}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20,
                        background: u.role === "ADMIN" ? "#f0f0ff" : u.role === "MODERATOR" ? "#eaf3de" : "#f3f3f1",
                        color: u.role === "ADMIN" ? "#5533cc" : u.role === "MODERATOR" ? "#3B6D11" : "#555",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" as const }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={deletingId === u.id}
                          style={{ padding: "5px 12px", fontSize: 12, fontWeight: 500, background: "#fff0f0", color: "#c0392b", border: "none", borderRadius: 7, cursor: deletingId === u.id ? "not-allowed" : "pointer", opacity: deletingId === u.id ? 0.6 : 1 }}>
                          {deletingId === u.id ? "Deleting…" : "Delete"}
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  fontSize: 13, color: "#111", background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, outline: "none",
};

const navBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", fontSize: 13, fontWeight: 500,
  background: "#fff", color: "#111", borderRadius: 8,
  border: "0.5px solid rgba(0,0,0,0.18)", cursor: "pointer",
};