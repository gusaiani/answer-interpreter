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
      <h3 className="heading-md mb-4">Resultados</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Pergunta</th>
              <th className="th">Resposta Original</th>
              <th className="th">Processado</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="tr-hover">
                <td className="td-truncate">{r.question}</td>
                <td className="td-truncate">{r.answer}</td>
                <td className="td max-w-[280px]">{r.processed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
