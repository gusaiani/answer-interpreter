import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    em_andamento: "Em andamento",
    concluido: "Concluido",
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12 w-full">
      <h1 className="font-serif text-3xl mb-8">Todas as entrevistas</h1>

      {!interviews?.length ? (
        <p className="text-text-dim text-sm">Nenhuma entrevista encontrada.</p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Setor
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Status
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Usuario
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => {
                const profile = interview.profiles as unknown as {
                  email: string;
                  full_name: string | null;
                } | null;
                return (
                  <tr
                    key={interview.id}
                    className="hover:bg-surface transition-colors"
                  >
                    <td className="px-4 py-3 border-b border-border">
                      <Link
                        href={`/admin/interviews/${interview.id}`}
                        className="text-accent hover:underline"
                      >
                        {interview.identifier_value ||
                          interview.title ||
                          "Sem titulo"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 border-b border-border text-text-dim">
                      {interview.sector || "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-border">
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ${
                          interview.status === "concluido"
                            ? "bg-accent/15 text-accent"
                            : "bg-text-dim/15 text-text-dim"
                        }`}
                      >
                        {statusLabel[interview.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-border text-text-dim">
                      {profile?.email || "-"}
                    </td>
                    <td className="px-4 py-3 border-b border-border text-text-dim">
                      {new Date(interview.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
