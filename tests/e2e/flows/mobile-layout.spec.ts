import { clerk } from "@clerk/testing/playwright";
import { expect, type Page, test } from "@playwright/test";

import { E2E_USERS } from "../users";

/**
 * Small-phone layout (360px, the tightest common width): no page may scroll sideways, and the
 * panel/admin section nav collapses into a side panel. Lives in flows/ because it signs in;
 * the viewport is set here since flows only run in the desktop project.
 */
test.use({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `horizontal overflow on ${page.url()}`).toBeLessThanOrEqual(0);
}

test("public pages fit a small phone", async ({ page }) => {
  await page.goto("/");
  // Signed-out header (logo + "Acceder" + menu) is the widest variant.
  await expect(page.getByRole("link", { name: "Acceder" })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto("/oportunidades");
  await expect(page.getByRole("status")).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.locator("article h3 a").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Rentabilidad anual").first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("admin panel fits a small phone and its nav opens as a side panel", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: E2E_USERS.admin.email });

  for (const path of [
    "/admin",
    "/admin/oportunidades",
    "/admin/denuncias",
    "/admin/usuarios",
    "/admin/actividad",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }

  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Resumen" })).toBeVisible();
  await page.getByRole("button", { name: /Administración/ }).click();
  const sidePanel = page.getByRole("dialog", { name: "Administración" });
  await sidePanel.getByRole("link", { name: "Usuarios", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/admin/usuarios");
  await expect(sidePanel).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Usuarios" })).toBeVisible();
});
