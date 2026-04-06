"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "/login";
    } else {
      alert("Logout failed");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // 🔐 user
        const resUser = await fetch("/api/auth/me", {
          credentials: "include",
        });

        const userData = await resUser.json();
        if (!resUser.ok) {
          window.location.href = "/login";
          return;
        }

        setUser(userData);

        // 📊 analytics
        const resAnalytics = await fetch("/api/analytics", {
          credentials: "include",
        });

        if (resAnalytics.ok) {
          const analyticsData = await resAnalytics.json();
          setData(analyticsData);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (!user || !data) return null;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <button onClick={logout} style={{ marginBottom: 20 }}>
        Logout
      </button>

      <p><b>User:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>

      <hr />

      {/* 🔹 SUMMARY */}
      <h3>Summary</h3>
      <p>Income: ₹ {data.income}</p>
      <p>Expense: ₹ {data.expense}</p>
      <p>Balance: ₹ {data.balance}</p>

      <hr />

      {/* 🔹 CATEGORY */}
      <h3>Category Totals</h3>
      {data.categoryTotals.map((c: any, i: number) => (
        <p key={i}>
          {c.category}: ₹ {c.total}
        </p>
      ))}

      <hr />

      {/* 🔹 RECENT */}
      <h3>Recent Activity</h3>
      {data.recent.map((r: any) => (
        <div key={r.id}>
          ₹ {r.amount} - {r.category} ({r.type})
        </div>
      ))}

      <hr />

      {/* 🔹 MONTHLY */}
      <h3>Monthly Trends</h3>
      {data.monthly.map((m: any, i: number) => (
        <p key={i}>
          {m.month}: ₹ {m.total}
        </p>
      ))}

      <hr />

      {/* NAVIGATION */}
      {user.role !== "VIEWER" && (
        <button onClick={() => (window.location.href = "/analytics")}>
          Go to Analytics
        </button>
      )}

      {user.role === "ADMIN" && (
        <button onClick={() => (window.location.href = "/admin")}>
          Admin Panel
        </button>
      )}
      {user.role === "ADMIN" && (
        <button onClick={() => (window.location.href = "/admin/users")}>
  Manage Users
</button>
      )}
    </div>
  );
}