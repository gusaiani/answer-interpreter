import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Interview } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const statusLabel: Record<string, string> = {
    em_andamento: "Em andamento",
    concluido: "Concluido",
  };

  return (
    <div className="max-w-[860px] mx-auto px-6 py-12 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl">Historico</h1>
        <Link
          href="/interview"
          className="bg-accent text-bg font-mono text-sm font-medium py-2 px-4 rounded-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5"
        >
          Nova entrevista
        </Link>
      </div>

      {!interviews?.length ? (
        <p className="text-text-dim text-sm">
          Nenhuma entrevista encontrada. Comece uma nova!
        </p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Titulo
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Status
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Data
                </th>
                <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody>
              {(interviews as Interview[]).map((interview) => (
                <tr
                  key={interview.id}
                  className="hover:bg-surface transition-colors"
                >
                  <td className="px-4 py-3 border-b border-border">
                    {interview.identifier_value || interview.title || "Sem titulo"}
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
                    {new Date(interview.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 border-b border-border">
                    <Link
                      href={`/interview/${interview.id}`}
                      className="text-accent hover:underline text-sm"
                    >
                      {interview.status === "em_andamento"
                        ? "Continuar"
                        : "Ver"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
