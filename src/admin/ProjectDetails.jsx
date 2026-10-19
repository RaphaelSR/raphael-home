import React, { useEffect, useState } from "react";
import { getAnalytics, rows } from "./analytics";

const number = (n) => new Intl.NumberFormat("pt-BR").format(n);
function ReportTable({ title, report, columns }) {
  const data = rows(report);
  return (
    <section className="panel">
      <h2>{title}</h2>
      {data.length ? (
        <div className="table-wrap">
          <table>
            <caption>
              {title} · até {data.length} resultados, ordenados pela primeira
              métrica
            </caption>
            <thead>
              <tr>
                {columns.map((label) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.labels[0]}>
                  <th scope="row">{row.labels[0] || "Não informado"}</th>
                  {row.values.map((value, i) => (
                    <td key={i}>{number(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">Sem dados neste período.</p>
      )}
      {report?.metadata?.subjectToThresholding && (
        <p className="muted small">
          O Google pode ocultar pequenos grupos neste relatório.
        </p>
      )}
    </section>
  );
}
export default function ProjectDetails({
  token,
  days,
  host,
  refresh,
  overview,
}) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    getAnalytics(token, days, host, controller.signal, true)
      .then((reports) => {
        if (!controller.signal.aborted) setResult({ reports });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ error: error.message });
      });
    return () => controller.abort();
  }, [token, days, host, refresh]);
  return (
    <div className="project-details" aria-label="Detalhes do projeto">
      {!result ? (
        <p role="status">Consultando os detalhes…</p>
      ) : result.error ? (
        <p role="alert" className="error">
          Detalhes indisponíveis: {result.error}
        </p>
      ) : (
        <div className="columns">
          <ReportTable
            title="Páginas mais vistas"
            report={result.reports[0]}
            columns={[
              "Página (sem parâmetros)",
              "Visualizações",
              "Usuários ativos",
            ]}
          />
          <ReportTable
            title="Eventos registrados"
            report={result.reports[1]}
            columns={["Evento", "Ocorrências"]}
          />
          <ReportTable
            title="Dispositivos"
            report={result.reports[2]}
            columns={["Categoria", "Usuários ativos"]}
          />
          <ReportTable
            title="Domínios que enviaram dados"
            report={overview}
            columns={["Domínio", "Visualizações", "Usuários ativos", "Sessões"]}
          />
        </div>
      )}
      <p className="muted small">
        Eventos são ocorrências, não pessoas ou conclusões únicas. Usuários de
        linhas, dias ou propriedades diferentes não devem ser somados. Os dados
        refletem apenas o que foi coletado com consentimento e processado pelo
        Google.
      </p>
    </div>
  );
}
