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
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-lg">Historico</h1>
        <Link href="/interview" className="btn-primary-sm">
          Nova entrevista
        </Link>
      </div>

      {!interviews?.length ? (
        <p className="text-muted">
          Nenhuma entrevista encontrada. Comece uma nova!
        </p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Titulo</th>
                <th className="th">Status</th>
                <th className="th">Data</th>
                <th className="th">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {(interviews as Interview[]).map((interview) => (
                <tr key={interview.id} className="tr-hover">
                  <td className="td">
                    {interview.identifier_value || interview.title || "Sem titulo"}
                  </td>
                  <td className="td">
                    <span
                      className={
                        interview.status === "concluido"
                          ? "badge-success"
                          : "badge-muted"
                      }
                    >
                      {statusLabel[interview.status]}
                    </span>
                  </td>
                  <td className="td-muted">
                    {new Date(interview.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="td">
                    <Link
                      href={`/interview/${interview.id}`}
                      className="link-sm"
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
