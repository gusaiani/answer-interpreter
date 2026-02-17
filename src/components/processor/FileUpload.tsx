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
        <label className="label">Upload CSV</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-secondary"
        >
          Selecionar arquivo
        </button>
        <p className="hint">
          CSV com 2 colunas: Pergunta, Resposta (primeira linha = cabecalho)
        </p>
      </div>

      <div className="divider">
        <div className="divider-line">
          <div className="w-full border-t border-border" />
        </div>
        <div className="divider-text">
          <span className="bg-bg px-4 text-text-dim">ou cole os dados</span>
        </div>
      </div>

      <div>
        <textarea
          value={pasteData}
          onChange={(e) => setPasteData(e.target.value)}
          placeholder={"Pergunta\tResposta\nQual seu nome?\tJoao"}
          rows={6}
          className="textarea"
        />
        <button
          onClick={handlePaste}
          disabled={!pasteData.trim()}
          className="btn-secondary-sm mt-2"
        >
          Carregar dados
        </button>
      </div>
    </div>
  );
}
