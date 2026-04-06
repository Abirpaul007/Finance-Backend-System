"use client";

import { useEffect, useState } from "react";

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users", {
        credentials: "include",
      });

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
    const confirmDelete = confirm("Are you sure?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setUsers(users.filter((u) => u.id !== id));
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Manage Users</h1>

      {users.map((u) => (
        <div
          key={u.id}
          style={{
            border: "1px solid gray",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <p>Name: {u.name}</p>
          <p>Email: {u.email}</p>
          <p>Role: {u.role}</p>

          <button onClick={() => deleteUser(u.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}