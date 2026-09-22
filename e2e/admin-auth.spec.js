import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function loginFixture(
  page,
  { owner = true, status = 200, expires = 3600 } = {},
) {
  const requests = [];
  await page.route("https://accounts.google.com/gsi/client", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.google={accounts:{oauth2:{initTokenClient:({callback})=>({requestAccessToken:()=>callback({access_token:'test-only-token',expires_in:${expires}})})}}};`,
    }),
  );
  await page.route(
    "https://openidconnect.googleapis.com/v1/userinfo",
    (route) =>
      route.fulfill({
        json: {
          email: owner ? "raphaelrochabcc@gmail.com" : "other@example.com",
          email_verified: true,
        },
      }),
  );
  await page.route("https://analyticsdata.googleapis.com/**", (route) => {
    requests.push(route.request());
    return route.fulfill({
      status,
      json: { reports: Array.from({ length: 5 }, () => ({ rows: [] })) },
    });
  });
  await page.goto("/admin/");
  await page.getByRole("button", { name: "Entrar com Google" }).click();
  return requests;
}

test("admin: owner can read reports without persisting tokens; logout clears data", async ({
  page,
}) => {
  const requests = await loginFixture(page);
  await expect(page.locator(".stats")).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].headers().authorization).toBe("Bearer test-only-token");
  expect(requests[0].postDataJSON().requests).toHaveLength(5);
  await page
    .getByRole("combobox", { name: "Projeto", exact: true })
    .selectOption("portfolio.raphaelrocha.com");
  await expect.poll(() => requests.length).toBe(2);
  expect(
    requests[1].postDataJSON().requests[0].dimensionFilter.filter.inListFilter
      .values,
  ).toEqual(["portfolio.raphaelrocha.com"]);
  expect(
    await page.evaluate(() =>
      JSON.stringify([localStorage, sessionStorage, document.cookie]),
    ),
  ).not.toContain("test-only-token");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.locator(".stats")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Entrar com Google" }),
  ).toBeVisible();
});

test("admin: a different account cannot request reports", async ({ page }) => {
  const requests = await loginFixture(page, { owner: false });
  await expect(page.getByRole("alert")).toHaveText(
    "Acesso reservado à conta proprietária.",
  );
  expect(requests).toHaveLength(0);
  await expect(page.locator(".stats")).toHaveCount(0);
});

for (const status of [401, 403]) {
  test(`admin: API denial ${status} never displays private data`, async ({
    page,
  }) => {
    await loginFixture(page, { status });
    await expect(page.getByRole("alert")).toContainText(
      status === 401 ? "sessão expirou" : "não tem permissão",
    );
    await expect(page.locator(".stats")).toHaveCount(0);
  });
}

test("admin: expiry clears the dashboard", async ({ page }) => {
  await page.clock.install();
  await loginFixture(page, { expires: 60 });
  await expect(page.locator(".stats")).toBeVisible();
  await page.clock.fastForward(61000);
  await expect(page.locator(".stats")).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText("sessão expirou");
});
