"use client";

import { useState } from "react";
import { FileUpload } from "@/components/processor/FileUpload";
import { ResultsTable } from "@/components/processor/ResultsTable";

interface Row {
  question: string;
  answer: string;
}

interface Result {
  question: string;
  answer: string;
  processed: string;
}

export default function ProcessorPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleProcess() {
    if (!prompt.trim() || !rows.length) return;

    setProcessing(true);
    setResults([]);
    setStatus(null);

    try {
      const res = await fetch("/api/processor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, rows }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7);
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (eventType === "progress") {
              setProgress({ current: data.current, total: data.total });
            } else if (eventType === "result") {
              setResults((prev) => [
                ...prev,
                {
                  question: data.question,
                  answer: data.answer,
                  processed: data.processed,
                },
              ]);
            } else if (eventType === "done") {
              setStatus({
                type: "success",
                message: `${data.totalProcessed} respostas processadas`,
              });
            } else if (eventType === "error") {
              setStatus({ type: "error", message: data.error });
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({ type: "error", message: error.message });
    } finally {
      setProcessing(false);
    }
  }

  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="max-w-[860px] mx-auto px-6 py-12 w-full">
      <header className="mb-12">
        <h1 className="font-serif text-5xl leading-tight">
          Processador <span className="text-accent">Gemini</span>
        </h1>
        <p className="text-text-dim text-sm mt-3">
          Carregue perguntas e respostas, processe cada uma com Gemini usando seu prompt.
        </p>
      </header>

      <FileUpload onDataLoaded={setRows} />

      {rows.length > 0 && (
        <>
          <div className="mt-8">
            <h3 className="font-serif text-xl mb-4">
              Preview{" "}
              <span className="inline-block bg-accent text-bg text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider ml-2 align-middle">
                {rows.length} linhas
              </span>
            </h3>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                      #
                    </th>
                    <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                      Pergunta
                    </th>
                    <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                      Resposta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className="hover:bg-surface transition-colors"
                    >
                      <td className="px-4 py-3 border-b border-border">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 border-b border-border max-w-[380px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {r.question}
                      </td>
                      <td className="px-4 py-3 border-b border-border max-w-[380px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {r.answer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-border my-10" />

          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-wider text-text-dim mb-2">
              Prompt para Gemini
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Avalie a resposta quanto a clareza e precisao. De uma nota de 1 a 10 e uma explicacao breve."
              rows={4}
              className="w-full bg-surface border border-border text-text font-mono text-sm px-4 py-3 rounded-lg outline-none resize-y min-h-[120px] transition-colors focus:border-accent-dim"
            />
            <p className="text-[11px] text-text-dim mt-2">
              A pergunta e resposta serao adicionadas ao prompt automaticamente.
            </p>
          </div>

          <button
            onClick={handleProcess}
            disabled={processing || !prompt.trim()}
            className="bg-accent text-bg font-mono text-sm font-medium py-3 px-6 rounded-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {processing ? "Processando..." : "Processar tudo"}
          </button>

          {processing && (
            <div className="mt-6">
              <div className="h-1.5 bg-surface2 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-text-dim text-xs">
                Processando {progress.current}/{progress.total}
              </p>
            </div>
          )}

          {status && (
            <div
              className={`mt-6 px-4 py-3 rounded-lg text-sm ${
                status.type === "success"
                  ? "bg-accent/8 border border-accent/25 text-accent"
                  : "bg-error/8 border border-error/25 text-error"
              }`}
            >
              {status.message}
            </div>
          )}

          <ResultsTable results={results} />
        </>
      )}
    </div>
  );
}
