"use client";

import { useRef, useState } from "react";

interface Row {
  question: string;
  answer: string;
}

interface FileUploadProps {
  onDataLoaded: (rows: Row[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteData, setPasteData] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length) onDataLoaded(rows);
    };
    reader.readAsText(file);
  }

  function handlePaste() {
    const text = pasteData.trim();
    if (!text) return;
    const rows = parseCSV(text);
    if (rows.length) onDataLoaded(rows);
  }

  function parseCSV(text: string): Row[] {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return [];

    // Skip header row
    return lines.slice(1).map((line) => {
      // Handle both tab and comma delimiters
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      return {
        question: (parts[0] || "").trim().replace(/^"|"$/g, ""),
        answer: (parts[1] || "").trim().replace(/^"|"$/g, ""),
      };
    }).filter((r) => r.question || r.answer);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-text-dim mb-2">
          Upload CSV
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-surface2 text-text border border-border font-mono text-sm font-medium py-3 px-6 rounded-lg transition-all hover:border-text-dim"
        >
          Selecionar arquivo
        </button>
        <p className="text-[11px] text-text-dim mt-2">
          CSV com 2 colunas: Pergunta, Resposta (primeira linha = cabecalho)
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg px-4 text-text-dim">ou cole os dados</span>
        </div>
      </div>

      <div>
        <textarea
          value={pasteData}
          onChange={(e) => setPasteData(e.target.value)}
          placeholder={"Pergunta\tResposta\nQual seu nome?\tJoao"}
          rows={6}
          className="w-full bg-surface border border-border text-text font-mono text-sm px-4 py-3 rounded-lg outline-none resize-y min-h-[120px] transition-colors focus:border-accent-dim"
        />
        <button
          onClick={handlePaste}
          disabled={!pasteData.trim()}
          className="mt-2 bg-surface2 text-text border border-border font-mono text-sm font-medium py-2 px-4 rounded-lg transition-all hover:border-text-dim disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Carregar dados
        </button>
      </div>
    </div>
  );
}
