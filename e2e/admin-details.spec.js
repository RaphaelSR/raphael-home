import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const row = (labels, values) => ({
  dimensionValues: labels.map((value) => ({ value })),
  metricValues: values.map((value) => ({ value: String(value) })),
});
async function fixture(page, denied = false) {
  const calls = [];
  await page.route("https://accounts.google.com/gsi/client", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.google={accounts:{oauth2:{initTokenClient:({callback})=>({requestAccessToken:()=>callback({access_token:'fixture-only-token',expires_in:3600})})}}};`,
    }),
  );
  await page.route(
    "https://openidconnect.googleapis.com/v1/userinfo",
    (route) =>
      route.fulfill({
        json: { email: "raphaelrochabcc@gmail.com", email_verified: true },
      }),
  );
  await page.route("https://analyticsdata.googleapis.com/**", (route) => {
    const requests = route.request().postDataJSON().requests;
    const lotcraft = route.request().url().includes("557114748");
    calls.push({ lotcraft, requests });
    if (lotcraft && denied) return route.fulfill({ status: 403, json: {} });
    return route.fulfill({
      json: {
        reports: requests.map((request) => {
          const dimension = request.dimensions[0]?.name;
          const rows = !dimension
            ? [row([], lotcraft ? [17, 20, 42, 0.6] : [30, 40, 900, 0.5])]
            : dimension === "hostName"
              ? [
                  row(
                    [lotcraft ? "lotcraft.app" : "cantinho.raphaelrocha.com"],
                    lotcraft ? [42, 17, 20] : [900, 30, 40],
                  ),
                ]
              : dimension === "pagePath"
                ? [row(["/"], [42, 17])]
                : dimension === "eventName"
                  ? [row(["creator_result"], [3])]
                  : dimension === "deviceCategory"
                    ? [row(["mobile"], [10])]
                    : dimension === "country"
                      ? [row(["Brazil"], [17])]
                      : dimension === "sessionDefaultChannelGroup"
                        ? [row(["Direct"], [20])]
                        : [];
          return { rows, metadata: { timeZone: "America/Belem" } };
        }),
      },
    });
  });
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Entrar com Google" }).click();
  await expect(page.locator(".stats")).toBeVisible();
  return calls;
}

test("project rows open isolated details and Lotcraft keeps current and historical sources distinct", async ({
  page,
}, testInfo) => {
  const calls = await fixture(page);
  await page
    .getByRole("button", {
      name: "Ver detalhes de Lotcraft — histórico Cantinho",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Lotcraft — histórico Cantinho",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Páginas mais vistas" }),
  ).toBeVisible();
  await expect(
    page.getByText("Histórico da coleta antiga.", { exact: false }),
  ).toBeVisible();
  expect(calls.at(-1).lotcraft).toBe(false);
  await page
    .getByRole("button", { name: "Abrir Lotcraft · lotcraft.app" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Lotcraft", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Eventos registrados" }),
  ).toBeVisible();
  await expect(
    page.getByRole("rowheader", { name: "creator_result", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Dispositivos", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Domínios que enviaram dados" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Origem dos dados" }),
  ).toContainText("557114748");
  await expect(page.locator(".stats")).toContainText("42");
  await expect(page.locator(".stats")).not.toContainText("900");
  const current = calls.filter((call) => call.lotcraft);
  expect(current).toHaveLength(2);
  expect(current[0].requests).toHaveLength(5);
  expect(current[1].requests).toHaveLength(3);
  expect(
    current.every((call) =>
      call.requests.every((request) =>
        request.dimensionFilter.filter.inListFilter.values.includes(
          "lotcraft.app",
        ),
      ),
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("lotcraft-details-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("lotcraft-details-mobile.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Ver histórico Cantinho" }).click();
  await expect(page.locator(".stats")).toContainText("900");
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Eventos registrados" }),
  ).toHaveCount(0);
  await expect(page.locator(".stats")).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.stringify([localStorage, sessionStorage])),
  ).not.toContain("fixture-only-token");
});

test("Lotcraft access denial does not reuse historical counts or present them as zero", async ({
  page,
}) => {
  await fixture(page, true);
  await page
    .getByRole("button", { name: "Abrir Lotcraft · lotcraft.app" })
    .click();
  await expect(page.getByRole("alert")).toContainText("não tem permissão");
  await expect(page.locator(".stats")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Eventos registrados" }),
  ).toHaveCount(0);
});

test("homepage identifies Lotcraft and opens its current domain", async ({
  page,
}) => {
  await page.goto("/home/pt/");
  const project = page.getByRole("link", { name: /Lotcraft/ });
  await expect(project).toHaveAttribute("href", "https://lotcraft.app/");
});
