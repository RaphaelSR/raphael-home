import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
const script = await readFile(
  new URL("../public/analytics.js", import.meta.url),
  "utf8",
);
async function fixture(page, path = "/") {
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route("https://raphaelrocha.com/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/analytics.js")
      return route.fulfill({
        contentType: "application/javascript",
        body: script,
      });
    if (url.pathname === "/analytics.css")
      return route.fulfill({ contentType: "text/css", body: "" });
    return route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="pt"><head><title>Private form title</title><script defer src="/analytics.js"></script></head><body><h1>Project</h1></body></html>',
    });
  });
  await page.goto(`https://raphaelrocha.com${path}`);
}
test("analytics: nothing loads before consent and declining persists", async ({
  page,
  context,
}) => {
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("googletagmanager.com")) requests.push(r.url());
  });
  await fixture(page);
  await expect(
    page.getByRole("button", { name: "Recusar", exact: true }),
  ).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "Recusar", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Permitir", exact: true }),
  ).toHaveCount(0);
  expect(requests).toHaveLength(0);
  const cookie = (await context.cookies()).find(
    (c) => c.name === "rr_analytics_consent",
  );
  expect(cookie).toMatchObject({
    value: "no",
    secure: true,
    domain: ".raphaelrocha.com",
  });
});
test("analytics: sanitized page views, deduplication and withdrawal", async ({
  page,
}) => {
  await fixture(page, "/en/?email=private@example.com#token=private");
  await page.getByRole("button", { name: "Permitir", exact: true }).click();
  const events = () =>
    page.evaluate(() => window.dataLayer.filter((e) => e[0] === "event"));
  expect(await events()).toHaveLength(1);
  expect(JSON.stringify(await events())).not.toContain("private");
  expect((await events())[0][2].page_location).toBe(
    "https://raphaelrocha.com/en/",
  );
  await page.evaluate(() => history.replaceState({}, "", "/en/#about"));
  expect(await events()).toHaveLength(1);
  await page.evaluate(() =>
    history.pushState({}, "", "/pt/?secret=never-send"),
  );
  expect(await events()).toHaveLength(2);
  await page
    .getByRole("button", { name: "Privacidade e cookies", exact: true })
    .click();
  await page.getByRole("button", { name: "Recusar", exact: true }).click();
  expect(await page.evaluate(() => window["ga-disable-G-9F41PKY1G5"])).toBe(
    true,
  );
  await page.evaluate(() => history.pushState({}, "", "/es/"));
  expect(await events()).toHaveLength(2);
});
test("analytics: admin and Do Not Track never initialize collection", async ({
  page,
}) => {
  await fixture(page, "/admin/");
  expect(await page.evaluate(() => window.rrAnalytics)).toBeUndefined();
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "doNotTrack", { value: "1" }),
  );
  await fixture(page);
  await expect(
    page.getByRole("button", { name: "Privacidade e cookies", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.dataLayer)).toBeUndefined();
});
