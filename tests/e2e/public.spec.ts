import { expect, test } from "@playwright/test";

test.describe("public marketplace", () => {
  test("home shows the hero and the latest opportunities", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /directamente de quien las promueve/i }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Últimas oportunidades" })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("the page never scrolls sideways", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Acceder" })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("search filters by operation type through the URL", async ({ page }) => {
    await page.goto("/oportunidades?tipo=NPL");
    await expect(page.getByRole("status")).toHaveText(/\d+ oportunidad/);
    const badges = page.locator("article").getByText("NPL", { exact: true });
    await expect(badges.first()).toBeVisible();
    const types = await page.locator("article span[title]").allTextContents();
    expect(types.every((t) => t === "NPL")).toBe(true);
  });

  test("an empty search explains what to do", async ({ page }) => {
    await page.goto("/oportunidades?provincia=52");
    await expect(page.getByText("No hay oportunidades con estos filtros")).toBeVisible();
  });

  test("anonymous visitors see the opportunity but not the contact", async ({ page }) => {
    await page.goto("/oportunidades");
    await page.locator("article h3 a").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Rentabilidad anual").first()).toBeVisible();
    await expect(page.getByText("Regístrate para ver el contacto")).toBeVisible();
    await expect(page.getByRole("link", { name: /Llamar/ })).toHaveCount(0);
  });

  test("legal pages are reachable from the footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Privacidad" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Política de privacidad" }),
    ).toBeVisible();
  });

  test("private areas require signing in", async ({ page }) => {
    await page.goto("/panel/oportunidades");
    await expect(page).toHaveURL(/sign-in/);
  });
});
