import { config, sites } from "./config";
export function buildReports(days, host) {
  if (![7, 28, 90].includes(days) || (host && !Object.hasOwn(sites, host)))
    throw new Error("Filtro inválido.");
  const dateRanges = [{ startDate: `${days - 1}daysAgo`, endDate: "today" }];
  const dimensionFilter = {
    filter: {
      fieldName: "hostName",
      inListFilter: { values: host ? [host] : Object.keys(sites) },
    },
  };
  const report = (dimensions, metrics, limit = 100) => ({
    dateRanges,
    dimensionFilter,
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit,
    orderBys:
      dimensions[0] === "date"
        ? [{ dimension: { dimensionName: "date" } }]
        : dimensions.length
          ? [{ metric: { metricName: metrics[0] }, desc: true }]
          : [],
  });
  return [
    report(
      [],
      ["activeUsers", "sessions", "screenPageViews", "engagementRate"],
    ),
    report(["date"], ["screenPageViews", "activeUsers"]),
    report(["hostName"], ["screenPageViews", "activeUsers", "sessions"]),
    report(["country"], ["activeUsers"], 10),
    report(["sessionDefaultChannelGroup"], ["sessions"], 10),
  ];
}
export async function getAnalytics(token, days, host, signal) {
  if (!/^\d+$/.test(config.propertyId))
    throw new Error("A propriedade do Analytics ainda não foi configurada.");
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:batchRunReports`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: buildReports(days, host) }),
      signal,
      cache: "no-store",
      credentials: "omit",
    },
  );
  if (response.status === 401)
    throw new Error("Sua sessão expirou. Entre novamente.");
  if (response.status === 403)
    throw new Error(
      "Esta conta não tem permissão para ler esta propriedade do Analytics.",
    );
  if (response.status === 429)
    throw new Error(
      "Limite temporário de consultas atingido. Aguarde e tente novamente.",
    );
  if (!response.ok)
    throw new Error(
      "Não foi possível consultar o Analytics. Tente novamente em instantes.",
    );
  const result = await response.json();
  if (!Array.isArray(result.reports) || result.reports.length !== 5)
    throw new Error("O Analytics devolveu um relatório incompleto.");
  return result.reports;
}
export const rows = (report) =>
  (report?.rows || []).map((row) => ({
    labels: (row.dimensionValues || []).map((v) => v.value),
    values: (row.metricValues || []).map((v) => Number(v.value) || 0),
  }));

export function dailyRows(report, days, now = new Date()) {
  const data = rows(report);
  if (!data.length) return [];
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: report.metadata?.timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type) => parts.find((value) => value.type === type).value;
  const today = Date.UTC(
    Number(part("year")),
    Number(part("month")) - 1,
    Number(part("day")),
  );
  const byDate = new Map(data.map((row) => [row.labels[0], row]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today - (days - index - 1) * 86400000)
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");
    return byDate.get(date) || { labels: [date], values: [0, 0] };
  });
}
