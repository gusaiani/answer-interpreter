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
    <div className="page-container">
      <header className="mb-12">
        <h1 className="heading-hero">
          Processador Gemini
        </h1>
        <p className="text-muted mt-3">
          Carregue perguntas e respostas, processe cada uma com Gemini usando seu prompt.
        </p>
      </header>

      <FileUpload onDataLoaded={setRows} />

      {rows.length > 0 && (
        <>
          <div className="mt-8">
            <h3 className="heading-md mb-4">
              Preview{" "}
              <span className="badge-accent ml-2 align-middle">
                {rows.length} linhas
              </span>
            </h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">#</th>
                    <th className="th">Pergunta</th>
                    <th className="th">Resposta</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="tr-hover">
                      <td className="td">{i + 1}</td>
                      <td className="td-truncate-wide">{r.question}</td>
                      <td className="td-truncate-wide">{r.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-border my-10" />

          <div className="mb-6">
            <label className="label">Prompt para Gemini</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Avalie a resposta quanto a clareza e precisao. De uma nota de 1 a 10 e uma explicacao breve."
              rows={4}
              className="textarea"
            />
            <p className="hint">
              A pergunta e resposta serao adicionadas ao prompt automaticamente.
            </p>
          </div>

          <button
            onClick={handleProcess}
            disabled={processing || !prompt.trim()}
            className="btn-primary"
          >
            {processing ? "Processando..." : "Processar tudo"}
          </button>

          {processing && (
            <div className="mt-6">
              <div className="progress-track">
                <div
                  className="progress-fill"
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
              className={
                status.type === "success" ? "status-success" : "status-error"
              }
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
