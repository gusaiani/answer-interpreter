import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResultsTable } from "@/components/processor/ResultsTable";

export default async function BatchJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (!job) redirect("/processor");

  const { data: items } = await supabase
    .from("batch_items")
    .select("*")
    .eq("batch_job_id", id)
    .order("row_index", { ascending: true });

  const results = (items || []).map((item) => ({
    question: item.question,
    answer: item.answer,
    processed: item.processed_answer || "",
  }));

  const statusLabel: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando",
    completed: "Concluido",
    failed: "Falhou",
  };

  return (
    <div className="page-container">
      <h1 className="heading-lg mb-2">{job.title}</h1>
      <div className="flex gap-4 text-muted mb-8">
        <span>Status: {statusLabel[job.status]}</span>
        <span>Criado: {new Date(job.created_at).toLocaleDateString("pt-BR")}</span>
      </div>

      <div className="mb-6">
        <label className="label">Prompt utilizado</label>
        <div className="pre-block">{job.prompt}</div>
      </div>

      <ResultsTable results={results} />
    </div>
  );
}
