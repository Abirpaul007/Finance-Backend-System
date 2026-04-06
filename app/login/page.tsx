"use client";
import { useState } from "react";
import Link from "next/link";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !password) return "Please fill in all fields.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return "Please enter a valid email address.";
    return null;
  };

  const handleLogin = async () => {
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Login failed. Please try again.");
      else window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9f9f8",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "#ffffff",
        border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: "2.5rem 2rem",
        boxSizing: "border-box",
      }}>

        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "#f3f3f1", border: "0.5px solid rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.25rem",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        {/* Heading */}
        <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px", color: "#111" }}>
          Welcome back
        </p>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 2rem" }}>
          Sign in to continue
        </p>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6, letterSpacing: "0.02em" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && document.getElementById("password-input")?.focus()}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: "#888", letterSpacing: "0.02em" }}>Password</label>
            <a href="#" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>Forgot?</a>
          </div>
          <div style={{ position: "relative" }}>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
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
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff0f0", border: "0.5px solid #f5c1c1",
            borderRadius: 8, padding: "10px 12px", marginBottom: 12,
            fontSize: 13, color: "#c0392b",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "10px", fontSize: 14, fontWeight: 500,
            background: "#111", color: "#fff", border: "none",
            borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 13, color: "#888", margin: "1.25rem 0 0" }}>
          No account?{" "}
          <Link
            href="/register"
            style={{ color: "#111", textDecoration: "none", fontWeight: 500 }}
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 12px",
  fontSize: 14,
  color: "#111",
  background: "#fff",
  border: "0.5px solid rgba(0,0,0,0.18)",
  borderRadius: 8,
  outline: "none",
};