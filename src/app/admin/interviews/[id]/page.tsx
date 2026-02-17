import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminInterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: interview } = await supabase
    .from("interviews")
    .select("*, profiles(email, full_name)")
    .eq("id", id)
    .single();

  if (!interview) redirect("/admin");

  const { data: messages } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: true });

  const profile = interview.profiles as unknown as {
    email: string;
    full_name: string | null;
  } | null;

  const statusLabel: Record<string, string> = {
    em_andamento: "Em andamento",
    concluido: "Concluido",
  };

  return (
    <div className="page-container">
      <Link href="/admin" className="link-back">
        ← Voltar
      </Link>

      <h1 className="heading-lg mb-2">
        {interview.identifier_value || interview.title || "Sem titulo"}
      </h1>

      {/* CONTROLE data */}
      <div className="card mb-8">
        <h2 className="heading-md mb-4">Controle</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-dim">Identificador:</span>{" "}
            {interview.identifier_label}: {interview.identifier_value || "-"}
          </div>
          <div>
            <span className="text-text-dim">Setor:</span>{" "}
            {interview.sector || "-"}
          </div>
          <div>
            <span className="text-text-dim">Tipo de marca:</span>{" "}
            {interview.brand_type || "-"}
          </div>
          <div>
            <span className="text-text-dim">Status:</span>{" "}
            {statusLabel[interview.status]}
          </div>
          <div>
            <span className="text-text-dim">Etapa atual:</span>{" "}
            {interview.current_stage || "-"}
          </div>
          <div>
            <span className="text-text-dim">Usuario:</span>{" "}
            {profile?.full_name || profile?.email || "-"}
          </div>
          <div>
            <span className="text-text-dim">Inicio:</span>{" "}
            {new Date(interview.created_at).toLocaleDateString("pt-BR")}
          </div>
          <div>
            <span className="text-text-dim">Ultima atualizacao:</span>{" "}
            {new Date(interview.updated_at).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </div>

      {/* Synthesis */}
      {interview.synthesis && (
        <div className="card mb-8">
          <h2 className="heading-md mb-4">Sintese</h2>
          <pre className="text-sm whitespace-pre-wrap text-text-dim overflow-x-auto">
            {JSON.stringify(interview.synthesis, null, 2)}
          </pre>
        </div>
      )}

      {/* Chat transcript */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-md">
            Transcricao ({messages?.length || 0} mensagens)
          </h2>
          <Link href={`/api/export/${id}`} className="btn-export">
            Exportar XLSX
          </Link>
        </div>
        <div className="chat-transcript">
          {messages
            ?.filter(
              (m) =>
                !(m.role === "user" && m.content === "Iniciar entrevista")
            )
            .map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-model"
                }
              >
                {m.content}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
