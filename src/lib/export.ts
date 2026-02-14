import * as XLSX from "xlsx";
import type { Interview, InterviewMessage } from "./types";

export function generateInterviewXLSX(
  interview: Interview,
  messages: InterviewMessage[]
): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Tab 1: CONTROLE
  const controleData = [
    ["Campo", "Valor"],
    ["Identificador", `${interview.identifier_label || ""}: ${interview.identifier_value || ""}`],
    ["Setor", interview.sector || ""],
    ["Tipo de marca", interview.brand_type || ""],
    ["Status", interview.status === "concluido" ? "Concluido" : "Em andamento"],
    ["Etapa atual", interview.current_stage || ""],
    ["Data inicio", new Date(interview.created_at).toLocaleDateString("pt-BR")],
    ["Data ultima atualizacao", new Date(interview.updated_at).toLocaleDateString("pt-BR")],
  ];
  const wsControle = XLSX.utils.aoa_to_sheet(controleData);
  wsControle["!cols"] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsControle, "CONTROLE");

  // Tab 2: RESPOSTAS (RAW)
  const respostasData = [["Papel", "Mensagem"]];
  for (const msg of messages) {
    if (msg.role === "user" && msg.content === "Iniciar entrevista") continue;
    respostasData.push([
      msg.role === "model" ? "Entrevistador" : "Voce",
      msg.content,
    ]);
  }
  const wsRespostas = XLSX.utils.aoa_to_sheet(respostasData);
  wsRespostas["!cols"] = [{ wch: 15 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsRespostas, "RESPOSTAS (RAW)");

  // Tab 3: SINTESE (DECISOES)
  const sinteseData = [["Campo", "Valor"]];
  if (interview.synthesis) {
    const s = interview.synthesis;

    if (s.decisions) {
      for (const [key, value] of Object.entries(s.decisions)) {
        sinteseData.push([key, value]);
      }
    }

    if (s.positioning_statement) {
      sinteseData.push(["Positioning Statement", s.positioning_statement]);
    }

    if (s.variations) {
      if (s.variations.precise) sinteseData.push(["Variacao Precisa", s.variations.precise]);
      if (s.variations.bold) sinteseData.push(["Variacao Ousada", s.variations.bold]);
      if (s.variations.premium) sinteseData.push(["Variacao Premium", s.variations.premium]);
    }

    if (s.uvp) {
      sinteseData.push(["UVP", s.uvp]);
    }

    if (s.brand_key) {
      for (const [key, value] of Object.entries(s.brand_key)) {
        sinteseData.push([`Brand Key - ${key}`, value]);
      }
    }
  }
  const wsSintese = XLSX.utils.aoa_to_sheet(sinteseData);
  wsSintese["!cols"] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsSintese, "SINTESE (DECISOES)");

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Uint8Array(buf);
}
