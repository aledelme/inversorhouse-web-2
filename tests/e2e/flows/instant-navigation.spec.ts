import { createClerkClient } from "@clerk/backend";
import { clerk } from "@clerk/testing/playwright";
import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

import { E2E_USERS } from "../users";

/**
 * Cache Components "instant navigation" (ADR-0007): moving between sibling panel/admin pages
 * must commit immediately with the static shell (layout + page skeleton), while the
 * session-dependent content streams in afterwards. Inside `instant()` all dynamic content is
 * held back, so a page that blocks on the session/DB without its own <Suspense> fails here.
 */
const PANEL_ROUTES = [
  ["Mis intereses", "/panel/intereses"],
  ["Mis oportunidades", "/panel/oportunidades"],
  // /nueva ↔ /panel/oportunidades share the `oportunidades` segment: a loading.tsx in /panel
  // does not cover this navigation, only a page-level <Suspense> does.
  ["Publicar", "/panel/oportunidades/nueva"],
  ["Mis oportunidades", "/panel/oportunidades"],
  ["Datos de contacto", "/panel/perfil"],
] as const;

const ADMIN_ROUTES = [
  ["Oportunidades", "/admin/oportunidades"],
  ["Denuncias", "/admin/denuncias"],
  ["Usuarios", "/admin/usuarios"],
  ["Actividad", "/admin/actividad"],
  ["Resumen", "/admin"],
] as const;

test("panel pages navigate instantly", async ({ page }) => {
  // A phone lets /panel/oportunidades/nueva render instead of redirecting to the profile.
  const clerkApi = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const { data } = await clerkApi.users.getUserList({ emailAddress: [E2E_USERS.investor.email] });
  await clerkApi.users.updateUserMetadata(data[0]!.id, {
    privateMetadata: {
      contact: { phone: "+34611111111", phoneVisibility: "public", bookingUrl: null },
    },
  });

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: E2E_USERS.investor.email });
  await page.goto("/panel/oportunidades");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const nav = page.getByRole("navigation", { name: "Mi panel" });
  for (const [label, path] of PANEL_ROUTES) {
    await instant(page, async () => {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await page.waitForURL((url) => url.pathname === path);
      await expect(nav).toBeVisible();
    });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("admin pages navigate instantly", async ({ page }) => {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: E2E_USERS.admin.email });
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const nav = page.getByRole("navigation", { name: "Administración" });
  for (const [label, path] of ADMIN_ROUTES) {
    await instant(page, async () => {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await page.waitForURL((url) => url.pathname === path);
      await expect(nav).toBeVisible();
    });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
