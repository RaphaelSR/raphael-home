import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { config, sites } from "./config";
import { getAnalytics, rows, dailyRows } from "./analytics";
import "./style.css";
const number = (n) => new Intl.NumberFormat("pt-BR").format(n);
function Bars({ title, data, unit }) {
  const max = Math.max(1, ...data.map((r) => r.values[0]));
  return (
    <section className="panel">
      <h2>{title}</h2>
      {data.length ? (
        <ol className="bars">
          {data.map((r) => (
            <li key={r.labels[0]}>
              <div>
                <span>
                  {sites[r.labels[0]] || r.labels[0] || "Não informado"}
                </span>
                <strong>
                  {number(r.values[0])} <small>{unit}</small>
                </strong>
              </div>
              <div className="bar-track" aria-hidden="true">
                <span style={{ width: `${(r.values[0] / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">Sem dados neste período.</p>
      )}
    </section>
  );
}
function Timeline({ data }) {
  const max = Math.max(1, ...data.map((r) => r.values[0]));
  const points = data
    .map(
      (r, i) =>
        `${40 + (i / Math.max(1, data.length - 1)) * 720},${180 - (r.values[0] / max) * 140}`,
    )
    .join(" ");
  const date = (value) => `${value.slice(6, 8)}/${value.slice(4, 6)}`;
  return (
    <section className="panel timeline">
      <div className="panel-heading">
        <h2>Acessos ao longo do tempo</h2>
        <span className="muted">Visualizações por dia</span>
      </div>
      {data.length ? (
        <>
          <svg
            viewBox="0 0 800 220"
            role="img"
            aria-label="Evolução diária das visualizações. Valores disponíveis na tabela abaixo."
          >
            <line x1="40" x2="760" y1="180" y2="180" className="grid-line" />
            <line x1="40" x2="760" y1="40" y2="40" className="grid-line" />
            <text x="0" y="45">
              {number(max)}
            </text>
            <text x="15" y="185">
              0
            </text>
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {data.map((r, i) => (
              <circle
                key={r.labels[0]}
                cx={40 + (i / Math.max(1, data.length - 1)) * 720}
                cy={180 - (r.values[0] / max) * 140}
                r="3"
                fill="currentColor"
              >
                <title>
                  {date(r.labels[0])}: {number(r.values[0])} visualizações
                </title>
              </circle>
            ))}
            <text x="40" y="212">
              {date(data[0].labels[0])}
            </text>
            <text x="760" y="212" textAnchor="end">
              {date(data.at(-1).labels[0])}
            </text>
          </svg>
          <details>
            <summary>Ver valores em tabela</summary>
            <div className="table-wrap">
              <table>
                <caption>Visualizações e usuários ativos por dia</caption>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Visualizações</th>
                    <th>Usuários ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={r.labels[0]}>
                      <th>{date(r.labels[0])}</th>
                      <td>{number(r.values[0])}</td>
                      <td>{number(r.values[1])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <p className="muted empty">
          O histórico aparecerá aqui depois que as primeiras visitas forem
          processadas.
        </p>
      )}
    </section>
  );
}
function Admin() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [reports, setReports] = useState(null);
  const [days, setDays] = useState(28);
  const [host, setHost] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [updated, setUpdated] = useState(null);
  const client = useRef(null);
  const authAttempt = useRef(0);
  useEffect(() => {
    if (!config.clientId) return;
    const attemptRef = authAttempt;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      client.current = window.google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        include_granted_scopes: false,
        scope:
          "openid email https://www.googleapis.com/auth/analytics.readonly",
        hint: config.owner,
        callback: async (result) => {
          const attempt = ++authAttempt.current;
          if (result.error || !result.access_token) {
            setError("A autorização não foi concluída.");
            return;
          }
          setLoading(true);
          try {
            const response = await fetch(
              "https://openidconnect.googleapis.com/v1/userinfo",
              {
                headers: { Authorization: `Bearer ${result.access_token}` },
                cache: "no-store",
                credentials: "omit",
              },
            );
            if (!response.ok)
              throw new Error("Não foi possível verificar sua conta Google.");
            const user = await response.json();
            if (user.email !== config.owner || !user.email_verified)
              throw new Error("Acesso reservado à conta proprietária.");
            if (attempt === authAttempt.current) {
              setError("");
              setSession({
                token: result.access_token,
                expires: Date.now() + Number(result.expires_in || 3600) * 1000,
              });
            }
          } catch (e) {
            if (attempt === authAttempt.current) setError(e.message);
          } finally {
            if (attempt === authAttempt.current) setLoading(false);
          }
        },
        error_callback: () =>
          setError(
            "A janela de autorização foi fechada ou bloqueada. Tente novamente.",
          ),
      });
      setReady(true);
    };
    script.onerror = () =>
      setError(
        "Não foi possível carregar o login do Google. Verifique sua conexão ou bloqueador.",
      );
    document.head.append(script);
    return () => {
      attemptRef.current++;
      script.remove();
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        setSession(null);
        setReports(null);
        setError("Sua sessão expirou. Entre novamente.");
      },
      Math.max(0, session.expires - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session]);
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setReports(null);
    getAnalytics(session.token, days, host, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setReports(data);
          setUpdated(new Date());
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [session, days, host, refresh]);
  const totals = reports ? rows(reports[0])[0]?.values || [0, 0, 0, 0] : null;
  return (
    <div className={`admin-shell${session ? "" : " signed-out"}`}>
      <a className="skip" href="#dashboard">
        Pular para o conteúdo
      </a>
      <header>
        <a className="brand" href="/">
          r.{session && <span>Analytics</span>}
        </a>
        {session && (
          <button
            onClick={() => {
              authAttempt.current++;
              setSession(null);
              setReports(null);
              setError("");
            }}
          >
            Sair
          </button>
        )}
      </header>
      <main id="dashboard" tabIndex={-1}>
        {session && (
          <div className="intro">
            <h1>Visão geral</h1>
          </div>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {!session ? (
          <section className="panel login">
            <h1>Analytics</h1>
            <button
              className="primary"
              disabled={!ready || loading}
              onClick={() => {
                setError("");
                client.current.requestAccessToken({ prompt: "select_account" });
              }}
            >
              {loading ? "Verificando conta…" : "Entrar com Google"}
            </button>
            {!config.clientId && (
              <p className="muted">
                Aguardando a configuração da conta de Analytics.
              </p>
            )}
          </section>
        ) : (
          <>
            <div className="filters">
              <label>
                Período
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                >
                  <option value={7}>Últimos 7 dias</option>
                  <option value={28}>Últimos 28 dias</option>
                  <option value={90}>Últimos 90 dias</option>
                </select>
              </label>
              <label>
                Projeto
                <select value={host} onChange={(e) => setHost(e.target.value)}>
                  <option value="">Todos os projetos</option>
                  {Object.entries(sites).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => setRefresh((v) => v + 1)}
                disabled={loading}
              >
                Atualizar
              </button>
            </div>
            <p role="status" className="muted small">
              {loading
                ? "Consultando dados…"
                : updated && !error
                  ? `Atualizado às ${updated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
            </p>
            {reports && (
              <>
                <div className="stats">
                  {[
                    "Usuários ativos",
                    "Sessões",
                    "Visualizações",
                    "Engajamento",
                  ].map((label, i) => (
                    <section className="panel stat" key={label}>
                      <h2>{label}</h2>
                      <strong>
                        {i === 3
                          ? `${Math.round(totals[i] * 100)}%`
                          : number(totals[i])}
                      </strong>
                    </section>
                  ))}
                </div>
                <Timeline data={dailyRows(reports[1], days)} />
                <div className="columns">
                  <Bars
                    title="Projetos mais visitados"
                    data={rows(reports[2])}
                    unit="visualizações"
                  />
                  <Bars
                    title="De onde chegam"
                    data={rows(reports[3])}
                    unit="usuários"
                  />
                  <Bars
                    title="Como encontram os sites"
                    data={rows(reports[4])}
                    unit="sessões"
                  />
                  <section className="panel note">
                    <h2>Como ler estes dados</h2>
                    <p>
                      Usuários são estimativas por navegador e dispositivo, não
                      pessoas identificadas. A localização é aproximada.
                    </p>
                    <p>
                      Contamos apenas visitas com consentimento. Bloqueadores
                      podem impedir a coleta. Dados recentes podem levar até 48
                      horas para aparecer e pequenos grupos podem ser ocultados
                      pelo Google.
                    </p>
                    <p>
                      Os totais de usuários dos projetos não devem ser somados:
                      uma mesma pessoa pode visitar vários sites.
                    </p>
                  </section>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <footer>
        <a href="/">Voltar ao site</a>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("admin-root")).render(<Admin />);
