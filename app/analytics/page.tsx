"use client";

import { useEffect, useState } from "react";

export default function Analytics() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const [categoryData, setCategoryData] = useState<
    { category: string; total: number }[]
  >([]);

  useEffect(() => {
    const init = async () => {
      try {
        // 🔐 Get user
        const resUser = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const userData = await resUser.json();

        if (
          !resUser.ok ||
          (userData.role !== "ADMIN" && userData.role !== "ANALYST")
        ) {
          alert("Access denied");
          window.location.href = "/dashboard";
          return;
        }

        setUser(userData);

        // 📊 Get records
        const resRecords = await fetch("/api/records", {
          credentials: "include",
        });

        if (resRecords.ok) {
          const data = await resRecords.json();
          setRecords(data);

          // 🔢 Calculate stats
          const totalIncome = data
            .filter((r: any) => r.type === "INCOME")
            .reduce((sum: number, r: any) => sum + r.amount, 0);

          const totalExpense = data
            .filter((r: any) => r.type === "EXPENSE")
            .reduce((sum: number, r: any) => sum + r.amount, 0);

          setIncome(totalIncome);
          setExpense(totalExpense);
          setBalance(totalIncome - totalExpense);

          // 📊 Category breakdown
          const map: any = {};

          data.forEach((r: any) => {
            if (!map[r.category]) {
              map[r.category] = 0;
            }
            map[r.category] += r.amount;
          });

          const categoryArray = Object.keys(map).map((key) => ({
            category: key,
            total: map[key],
          }));

          setCategoryData(categoryArray);
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
  if (!user) return null;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Analytics Dashboard</h1>

      {/* 🔹 Stats */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div style={{ border: "1px solid green", padding: 10 }}>
          <h3>Income</h3>
          <p>₹ {income}</p>
        </div>

        <div style={{ border: "1px solid red", padding: 10 }}>
          <h3>Expense</h3>
          <p>₹ {expense}</p>
        </div>

        <div style={{ border: "1px solid blue", padding: 10 }}>
          <h3>Balance</h3>
          <p>₹ {balance}</p>
        </div>
      </div>

      <hr />

      {/* 🔹 Category Breakdown */}
      <h3>Category Breakdown</h3>

      {categoryData.length === 0 && <p>No data</p>}

      {categoryData.map((c, index) => (
        <div
          key={index}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>Category: {c.category}</p>
          <p>Total: ₹ {c.total}</p>
        </div>
      ))}
    </div>
  );
}