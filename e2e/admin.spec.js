import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { buildReports } from "../src/admin/analytics.js";

test("admin: date and host filters are bounded", () => {
  for (const days of [7, 28, 90]) {
    const reports = buildReports(days, "portfolio.raphaelrocha.com");
    expect(reports).toHaveLength(5);
    for (const report of reports) {
      expect(report.dateRanges).toEqual([
        { startDate: `${days - 1}daysAgo`, endDate: "today" },
      ]);
      expect(report.dimensionFilter.filter.inListFilter.values).toEqual([
        "portfolio.raphaelrocha.com",
      ]);
    }
  }
  expect(() => buildReports(365, "")).toThrow();
  expect(() => buildReports(28, "attacker.example")).toThrow();
});

test("admin: unauthenticated visitors cannot request reports", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().includes("analyticsdata.googleapis.com"))
      requests.push(request.url());
  });
  await page.goto("/admin/");
  await expect(
    page.getByRole("heading", { name: "Analytics", exact: true }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect(requests).toHaveLength(0);
  await expect(page.locator(".stats")).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toHaveLength(
    0,
  );
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("admin: daily chart includes missing dates in the property timezone", async () => {
  const { dailyRows } = await import("../src/admin/analytics.js");
  const report = {
    metadata: { timeZone: "America/Belem" },
    rows: [
      {
        dimensionValues: [{ value: "20260920" }],
        metricValues: [{ value: "8" }, { value: "3" }],
      },
    ],
  };
  const data = dailyRows(report, 7, new Date("2026-09-23T01:00:00Z"));
  expect(data).toHaveLength(7);
  expect(data[0].labels[0]).toBe("20260916");
  expect(data[6]).toEqual({ labels: ["20260922"], values: [0, 0] });
  expect(data[4].values).toEqual([8, 3]);
  expect(dailyRows({ rows: [] }, 7)).toEqual([]);
});
