"use client";

import { useEffect, useState } from "react";

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("INCOME");
  const [category, setCategory] = useState("General");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🔹 Load user + records
  useEffect(() => {
    const init = async () => {
      try {
        const resUser = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const userData = await resUser.json();

        if (!resUser.ok || userData.role !== "ADMIN") {
          alert("Access denied");
          window.location.href = "/dashboard";
          return;
        }

        setUser(userData);

        const resRecords = await fetch("/api/records", {
          credentials: "include",
        });

        if (resRecords.ok) {
          const data = await resRecords.json();
          setRecords(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 🔹 ADD + UPDATE (combined)
  const saveRecord = async () => {
    setError("");

    if (!amount) {
      setError("Amount is required");
      return;
    }

    setAdding(true);

    try {
      const url = editingId
        ? `/api/records/${editingId}`
        : "/api/records";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: Number(amount),
          type,
          category,
          date: new Date(date),
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          const messages = data.details
            .map((d: any) => d.message)
            .join(", ");
          setError(messages);
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      if (editingId) {
        // 🔄 update UI
        setRecords((prev) =>
          prev.map((r) => (r.id === editingId ? data : r))
        );
      } else {
        // ➕ add new
        setRecords((prev) => [...prev, data]);
      }

      // 🔄 reset form
      setEditingId(null);
      setAmount("");
      setCategory("General");
      setType("INCOME");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setError("");

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setAdding(false);
    }
  };

  // 🔹 Start Edit
  const startEdit = (record: any) => {
    setEditingId(record.id);
    setAmount(record.amount.toString());
    setType(record.type);
    setCategory(record.category);
    setDate(new Date(record.date).toISOString().split("T")[0]);
    setNote(record.note || "");
  };

  // 🔹 Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setCategory("General");
    setType("INCOME");
    setDate(new Date().toISOString().split("T")[0]);
    setError("");
  };

  // 🔹 Delete Record
  const deleteRecord = async (id: number) => {
    const confirmDelete = confirm("Delete this record?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/records/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setRecords(records.filter((r) => r.id !== id));
  };

  if (loading) return <h2>Loading...</h2>;
  if (!user) return null;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <h3>{editingId ? "Edit Record" : "Add Record"}</h3>

      {/* 🔴 Error */}
      {error && (
        <p style={{ color: "red", marginBottom: 10 }}>
          {error}
        </p>
      )}

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br /><br />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <br /><br />

      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <br /><br />

<input
  placeholder="Note (optional)"
  value={note}
  onChange={(e) => setNote(e.target.value)}
/>
      <button onClick={saveRecord} disabled={adding}>
        {adding
          ? "Saving..."
          : editingId
          ? "Update Record"
          : "Add Record"}
      </button>

      {editingId && (
        <button onClick={cancelEdit} style={{ marginLeft: 10 }}>
          Cancel
        </button>
      )}

      <hr />

      <h3>All Records</h3>

      {records.length === 0 && <p>No records</p>}

      {records.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>Amount: {r.amount}</p>
          <p>Type: {r.type}</p>
          <p>Category: {r.category}</p>
          <p>Date: {new Date(r.date).toLocaleDateString()}</p>
          {r.note && <p>Note: {r.note}</p>}
          <button onClick={() => startEdit(r)}>
            Edit
          </button>

          <button
            onClick={() => deleteRecord(r.id)}
            style={{ marginLeft: 10 }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}