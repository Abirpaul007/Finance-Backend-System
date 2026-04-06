// "use client";
// import { useState } from "react";

// export default function Register() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("VIEWER");
//   const [message, setMessage] = useState("");

//   const handleRegister = async () => {
//     const res = await fetch("/api/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, email, password, role }),
//     });

//     const data = await res.json();
//     if (!res.ok) setMessage(data.error || "Registration failed");
//     else {
//       setMessage("Registered successfully!");
//        window.location.href = "/login";
//     }
//   };

//   return (
//     <div style={{ maxWidth: 400, margin: "50px auto" }}>
//       <h1>Register</h1>
//       <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
//       <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
//       <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
//       <select value={role} onChange={e => setRole(e.target.value)}>
//         <option value="VIEWER">Viewer</option>
//         <option value="ANALYST">Analyst</option>
//         <option value="ADMIN">Admin</option>
//       </select>
//       <button onClick={handleRegister}>Register</button>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }
"use client";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return "Please enter your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleRegister = async () => {
    setMessage("");
    const err = validate();
    if (err) { setIsError(true); setMessage(err); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Registration failed. Please try again.");
      } else {
        setIsError(false);
        setMessage("Account created! Redirecting…");
        setTimeout(() => (window.location.href = "/login"), 1200);
      }
    } catch {
      setIsError(true);
      setMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "VIEWER", label: "Viewer", desc: "Read-only access" },
    { value: "ANALYST", label: "Analyst", desc: "View & analyze data" },
    { value: "ADMIN", label: "Admin", desc: "Full access" },
  ];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", backgroundColor: "#f9f9f8", padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 400, background: "#ffffff",
        border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 12,
        padding: "2.5rem 2rem", boxSizing: "border-box",
      }}>

        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "#f3f3f1",
          border: "0.5px solid rgba(0,0,0,0.1)", display: "flex",
          alignItems: "center", justifyContent: "center", marginBottom: "1.25rem",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px", color: "#111" }}>
          Create an account
        </p>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 2rem" }}>
          Fill in the details below to get started
        </p>

        {/* Name */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Full name</label>
          <input
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && document.getElementById("email-input")?.focus()}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Email</label>
          <input
            id="email-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && document.getElementById("password-input")?.focus()}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
              style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button
              onClick={() => setShowPassword(p => !p)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", padding: 4, cursor: "pointer",
                color: "#aaa", lineHeight: 0,
              }}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {/* Password strength bar */}
          {password.length > 0 && (
            <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
              {[1, 2, 3].map(i => {
                const strength = password.length >= 10 ? 3 : password.length >= 6 ? 2 : 1;
                const colors = ["#e24b4a", "#ef9f27", "#1D9E75"];
                return (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= strength ? colors[strength - 1] : "rgba(0,0,0,0.08)",
                    transition: "background 0.2s",
                  }} />
                );
              })}
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: 4, lineHeight: "12px" }}>
                {password.length >= 10 ? "Strong" : password.length >= 6 ? "Fair" : "Weak"}
              </span>
            </div>
          )}
        </div>

        {/* Role */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Role</label>
          <div style={{ display: "flex", gap: 8 }}>
            {roles.map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, cursor: "pointer",
                  border: role === r.value ? "1.5px solid #111" : "0.5px solid rgba(0,0,0,0.15)",
                  background: role === r.value ? "#111" : "#fff",
                  color: role === r.value ? "#fff" : "#555",
                  transition: "all 0.15s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: isError ? "#fff0f0" : "#eaf3de",
            border: `0.5px solid ${isError ? "#f5c1c1" : "#c0dd97"}`,
            borderRadius: 8, padding: "10px 12px", marginBottom: 12,
            fontSize: 13, color: isError ? "#c0392b" : "#3B6D11",
          }}>
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%", padding: "10px", fontSize: 14, fontWeight: 500,
            background: "#111", color: "#fff", border: "none", borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
          }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#888", margin: "1.25rem 0 0" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#111", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </a>
        </p>

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
  fontSize: 14, color: "#111", background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.18)", borderRadius: 8, outline: "none",
};