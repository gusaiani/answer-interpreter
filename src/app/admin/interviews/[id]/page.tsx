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
    <div className="max-w-[860px] mx-auto px-6 py-12 w-full">
      <Link
        href="/admin"
        className="text-text-dim hover:text-accent text-sm transition-colors mb-6 inline-block"
      >
        ← Voltar
      </Link>

      <h1 className="font-serif text-3xl mb-2">
        {interview.identifier_value || interview.title || "Sem titulo"}
      </h1>

      {/* CONTROLE data */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <h2 className="font-serif text-xl mb-4">Controle</h2>
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
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="font-serif text-xl mb-4">Sintese</h2>
          <pre className="text-sm whitespace-pre-wrap text-text-dim overflow-x-auto">
            {JSON.stringify(interview.synthesis, null, 2)}
          </pre>
        </div>
      )}

      {/* Chat transcript */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">
            Transcricao ({messages?.length || 0} mensagens)
          </h2>
          <Link
            href={`/api/export/${id}`}
            className="bg-surface2 text-text border border-border font-mono text-xs font-medium py-2 px-4 rounded-lg transition-all hover:border-text-dim"
          >
            Exportar XLSX
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {messages
            ?.filter(
              (m) =>
                !(m.role === "user" && m.content === "Iniciar entrevista")
            )
            .map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "self-end bg-accent text-bg rounded-br-sm"
                    : "self-start bg-surface2 border border-border rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
