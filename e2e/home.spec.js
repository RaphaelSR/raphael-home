import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const language of ["pt", "en", "es"]) {
  for (const theme of ["light", "dark"]) {
    test(`${language}, ${theme}: accessible and responsive`, async ({
      page,
    }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      await page.locator(`input[name="language"][value="${language}"]`).check();
      await page.locator(`input[name="theme"][value="${theme}"]`).check();
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        language === "pt" ? "pt-BR" : language,
      );
      await expect(page.locator(".current-work h2")).toHaveText("ModPro AI ↗");
      await expect(page.locator(".project")).toHaveCount(7);
      await expect(
        page
          .locator(".project")
          .filter({ hasText: "Fly Brain Bench" })
          .locator(".type"),
      ).toHaveText({ pt: "Estudo", en: "Study", es: "Estudio" }[language]);
      await expect(page.locator(".portfolio a")).toHaveAttribute(
        "href",
        `https://portfolio.raphaelrocha.com/${language}/`,
      );
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const report = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(report.violations).toEqual([]);
      }
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        language === "pt" ? "pt-BR" : language,
      );
      expect(errors).toEqual([]);
    });
  }
}

test("system theme, language fallback and unavailable storage", async ({
  browser,
}) => {
  const context = await browser.newContext({
    locale: "fr-FR",
    colorScheme: "dark",
  });
  await context.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw Error("unavailable");
      },
    }),
  );
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator('input[name="language"][value="es"]').check();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await context.close();
});

test("keyboard, scroll navigation, reduced motion and contact actions", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.locator('.header nav a[href="#projects"]').click();
  await expect(page.locator(".header")).toHaveClass(/is-compact/);
  await expect(page.locator('.header a[href="#projects"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  expect(
    await page
      .locator(".header-inner")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.locator(".back-top").click();
  await expect(page.locator(".header")).not.toHaveClass(/is-compact/);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw Error("denied");
        },
      },
      configurable: true,
    }),
  );
  await page.locator(".discord").click();
  await expect(page.getByRole("status")).toContainText("raphaelsr");
  await expect(
    page.locator('a[href="https://wa.me/541127252431"]'),
  ).toHaveCount(1);
});

test("production assets and content policy", async ({ page }) => {
  const violations = [];
  const failures = [];
  await page.addInitScript(() => {
    window.policyViolations = [];
    document.addEventListener("securitypolicyviolation", (e) =>
      window.policyViolations.push(e.violatedDirective),
    );
  });
  page.on("requestfailed", (request) => failures.push(request.url()));
  await page.goto("/");
  await expect(page.locator(".project")).toHaveCount(7);
  const policy = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute("content");
  expect(policy).toContain("script-src 'self'");
  expect(policy).toContain("object-src 'none'");
  violations.push(...(await page.evaluate(() => window.policyViolations)));
  expect(violations).toEqual([]);
  expect(failures).toEqual([]);
  for (const link of await page
    .locator("a[href]")
    .evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
    expect(link).toMatch(/^(https:\/\/|mailto:|#)/);
  }
  await expect(page.locator(".current-work-links a")).toHaveCount(3);
});

test("essential links remain accessible without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Raphael Rocha." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^Portfolio/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Fly Brain Bench/ }),
  ).toBeVisible();
  await context.close();
});

test("preference controls support keyboard selection and system theme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/home/en/");
  const english = page.locator('input[name="language"][value="en"]');
  await english.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.locator('input[name="theme"][value="dark"]').check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator('input[name="theme"][value="dark"]')).toBeChecked();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page
      .locator(".preference-highlight")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});
