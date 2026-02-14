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
      <div className="max-w-[860px] mx-auto px-6 py-12">
        <p className="text-text-dim">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto px-6 py-12 w-full">
      <h1 className="font-serif text-3xl mb-8">Usuarios</h1>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Nome
              </th>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Email
              </th>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Cadastro
              </th>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Admin
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-surface transition-colors"
              >
                <td className="px-4 py-3 border-b border-border">
                  {user.full_name || "-"}
                </td>
                <td className="px-4 py-3 border-b border-border text-text-dim">
                  {user.email}
                </td>
                <td className="px-4 py-3 border-b border-border text-text-dim">
                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 border-b border-border">
                  <button
                    onClick={() => toggleAdmin(user.id, user.is_admin)}
                    className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
                      user.is_admin
                        ? "bg-accent/15 text-accent hover:bg-accent/25"
                        : "bg-surface2 text-text-dim border border-border hover:border-text-dim"
                    }`}
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
