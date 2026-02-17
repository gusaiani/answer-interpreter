"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(data || []);
    setLoading(false);
  }

  async function toggleAdmin(userId: string, currentValue: boolean) {
    await supabase
      .from("profiles")
      .update({ is_admin: !currentValue })
      .eq("id", userId);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_admin: !currentValue } : u
      )
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="heading-lg mb-8">Usuarios</h1>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Nome</th>
              <th className="th">Email</th>
              <th className="th">Cadastro</th>
              <th className="th">Admin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="tr-hover">
                <td className="td">{user.full_name || "-"}</td>
                <td className="td-muted">{user.email}</td>
                <td className="td-muted">
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="td">
                  <button
                    onClick={() => toggleAdmin(user.id, user.is_admin)}
                    className={
                      user.is_admin
                        ? "toggle-btn-active"
                        : "toggle-btn-inactive"
                    }
                  >
                    {user.is_admin ? "Admin" : "Membro"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
