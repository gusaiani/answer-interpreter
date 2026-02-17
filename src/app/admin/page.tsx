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
    <div className="page-container-wide">
      <h1 className="heading-lg mb-8">Todas as entrevistas</h1>

      {!interviews?.length ? (
        <p className="text-muted">Nenhuma entrevista encontrada.</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Cliente</th>
                <th className="th">Setor</th>
                <th className="th">Status</th>
                <th className="th">Usuario</th>
                <th className="th">Data</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((interview) => {
                const profile = interview.profiles as unknown as {
                  email: string;
                  full_name: string | null;
                } | null;
                return (
                  <tr key={interview.id} className="tr-hover">
                    <td className="td">
                      <Link
                        href={`/admin/interviews/${interview.id}`}
                        className="link"
                      >
                        {interview.identifier_value ||
                          interview.title ||
                          "Sem titulo"}
                      </Link>
                    </td>
                    <td className="td-muted">
                      {interview.sector || "-"}
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
                      {profile?.email || "-"}
                    </td>
                    <td className="td-muted">
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
