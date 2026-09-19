import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
for (const locale of ["en", "pt", "es"]) {
  test(`SEO: ${locale} has crawlable content and metadata`, async ({
    browser,
    request,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const base = process.env.SITE_URL || "http://127.0.0.1:3026";
    const response = await page.goto(`${base}/home/${locale}/`);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText("Raphael Rocha.");
    await expect(page.locator(".project")).toHaveCount(5);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://raphaelrocha.com/home/${locale}/`,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://raphaelrocha.com/home/${locale}/`,
    );
    await expect(page.locator("link[hreflang]")).toHaveCount(4);
    for (const other of ["en", "pt", "es"])
      await expect(page.locator(`a[hreflang="${other}"]`)).toBeVisible();
    expect(await page.title()).toContain("Raphael Rocha");
    expect(
      await page.locator('meta[name="description"]').getAttribute("content"),
    ).toContain("ModPro AI");
    const schema = JSON.parse(
      await page.locator("#structured-data").textContent(),
    );
    expect(schema["@graph"][0].name).toBe("Raphael Rocha");
    expect((await request.get("/social-card.png")).status()).toBe(200);
    expect(await (await request.get("/sitemap.xml")).text()).toContain(
      `/home/${locale}/`,
    );
    const legacy = await request.get(`/${locale}/`);
    expect(await legacy.text()).toContain(
      `https://portfolio.raphaelrocha.com/${locale}/`,
    );
    await context.close();
  });
}
test("SEO: explicit language wins over stored preference and history updates metadata", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("home-language", "pt"));
  await page.goto("/home/en/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator("select").first().selectOption("es");
  await expect(page).toHaveURL(/\/home\/es\/$/);
  await expect(page).toHaveTitle(/Ingeniero/);
  await page.goBack();
  await expect(page).toHaveTitle(/Software Engineer/);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "en_US",
  );
});

for (const locale of ["en", "pt", "es"]) {
  test(`visible labels match accessible names in ${locale}`, async ({
    page,
  }) => {
    await page.goto(`/home/${locale}/`);
    const results = await new AxeBuilder({ page })
      .withRules(["label-content-name-mismatch"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
