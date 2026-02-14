interface Result {
  question: string;
  answer: string;
  processed: string;
}

interface ResultsTableProps {
  results: Result[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (!results.length) return null;

  return (
    <div className="mt-8">
      <h3 className="font-serif text-xl mb-4">Resultados</h3>
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Pergunta
              </th>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Resposta Original
              </th>
              <th className="text-left px-4 py-3 bg-surface2 text-[11px] uppercase tracking-wider text-text-dim border-b border-border">
                Processado
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 border-b border-border max-w-[280px] overflow-hidden text-ellipsis">
                  {r.question}
                </td>
                <td className="px-4 py-3 border-b border-border max-w-[280px] overflow-hidden text-ellipsis">
                  {r.answer}
                </td>
                <td className="px-4 py-3 border-b border-border max-w-[280px]">
                  {r.processed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
