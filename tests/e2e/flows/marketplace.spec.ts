import path from "node:path";

import { clerk } from "@clerk/testing/playwright";
import { type Browser, expect, test } from "@playwright/test";

import { E2E_USERS, type E2EUser } from "../users";

/**
 * End-to-end story of the marketplace (business rules in docs/domain.md):
 * promoter publishes → investor contacts + "Me interesa" → promoter sees the lead →
 * admin moderates. Steps share state, so the file runs serially.
 */
test.describe.configure({ mode: "serial" });

const fixtures = path.join(__dirname, "..", "fixtures");
const title = `Nave logística para reformar en Marbella ${Date.now().toString(36)}`;
let slug = "";

async function signedIn(browser: Browser, role: E2EUser) {
  const context = await browser.newContext({ locale: "es-ES" });
  const page = await context.newPage();
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: E2E_USERS[role].email });
  return { page, context };
}

test("promoter adds a phone, then publishes an opportunity with photo and document", async ({
  browser,
}) => {
  const { page, context } = await signedIn(browser, "promoter");

  // Business rule #3: no phone → redirected to the contact settings first.
  await page.goto("/panel/oportunidades/nueva");
  await expect(page).toHaveURL(/\/panel\/perfil\?next=nueva/);
  await page.getByRole("textbox", { name: "Teléfono", exact: true }).fill("612 34 56 78");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/panel\/oportunidades\/nueva$/);

  await page.getByText("CRV · Compra, reforma y venta").click();
  await page.getByRole("textbox", { name: "Título", exact: true }).fill(title);

  await page.getByLabel("Comunidad autónoma", { exact: true }).click();
  await page.getByRole("option", { name: "Andalucía" }).click();
  await page.getByLabel("Provincia", { exact: true }).click();
  await page.getByRole("option", { name: "Málaga" }).click();
  await page.getByLabel("Municipio", { exact: true }).click();
  await page.getByPlaceholder("Buscar municipio…").fill("Marbella");
  await page.getByRole("option", { name: "Marbella" }).click();

  await page.getByLabel("Capital buscado (€)", { exact: true }).fill("300000");
  await page.getByLabel("Ticket mínimo (€)", { exact: true }).fill("20000");
  await page.getByLabel("Plazo de la operación (meses)", { exact: true }).fill("12");
  await page.getByLabel("Valor", { exact: true }).first().fill("15");
  // Business rule #5: the annual return follows the nominal one (15 % over 12 months).
  await expect(page.getByLabel("Valor", { exact: true }).nth(1)).toHaveValue("15");

  await page
    .locator("#description")
    .fill(
      "Nave de 1.200 m² en polígono consolidado de Marbella. Reforma de cubierta y fachada, división en tres módulos y venta a operador logístico local.",
    );

  await page
    .getByLabel("Añadir fotos", { exact: true })
    .setInputFiles(path.join(fixtures, "photo.jpg"));
  await expect(page.getByAltText("Foto 1")).toBeVisible({ timeout: 30_000 });
  await page
    .getByLabel("Adjuntar documentos", { exact: true })
    .setInputFiles(path.join(fixtures, "nota-simple.pdf"));
  // Uploaded (not just pending) = the row offers "Quitar".
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "nota-simple.pdf" })
      .getByRole("button", { name: "Quitar" }),
  ).toBeVisible({ timeout: 30_000 });

  await page.getByRole("button", { name: "Publicar oportunidad" }).click();
  await expect(page).toHaveURL(/\/oportunidades\/nave-logistica/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  slug = new URL(page.url()).pathname.split("/").pop()!;
  await context.close();
});

test("investor sees the contact, downloads the document and shows interest", async ({
  browser,
}) => {
  const { page, context } = await signedIn(browser, "investor");
  await page.goto(`/oportunidades/${slug}`);

  // Business rule #4: name + email always, phone because the promoter chose "public".
  await expect(page.getByText("Paula Promotora")).toBeVisible();
  await expect(page.getByRole("link", { name: /Llamar/ })).toBeVisible();

  const download = page.getByRole("link", { name: /nota-simple\.pdf/ });
  const href = await download.getAttribute("href");
  const response = await page.request.get(href!, { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  expect(response.headers().location).toContain("nota-simple.pdf");

  await page.getByRole("button", { name: "Me interesa" }).click();
  await expect(page.getByRole("button", { name: "Te interesa" })).toBeVisible();
  await context.close();
});

test("promoter sees the interested investor in the panel", async ({ browser }) => {
  const { page, context } = await signedIn(browser, "promoter");
  await page.goto("/panel/oportunidades");
  const row = page.getByRole("listitem").filter({ hasText: title });
  await row.getByRole("link", { name: "1 interesado" }).click();
  await expect(page.getByRole("cell", { name: E2E_USERS.investor.email })).toBeVisible();
  await context.close();
});

test("admin removes the opportunity and suspends a promoter", async ({ browser }) => {
  const { page, context } = await signedIn(browser, "admin");

  await page.goto(`/admin/oportunidades?q=${encodeURIComponent(title)}`);
  await page.getByRole("button", { name: "Acciones" }).click();
  await page.getByRole("menuitem", { name: "Retirar anuncio" }).click();
  await page
    .getByLabel("Motivo", { exact: true })
    .fill("Información incompleta sobre la licencia.");
  await page.getByRole("dialog").getByRole("button", { name: "Retirar anuncio" }).click();
  await expect(page.getByText("Anuncio retirado")).toBeVisible();

  await page.goto(`/oportunidades/${slug}`);
  await expect(
    page.getByRole("heading", { name: "Esta oportunidad ya no está disponible" }),
  ).toBeVisible();

  // Business rule #7: suspending a promoter hides all of their listings.
  await page.goto("/oportunidades");
  const before = Number((await page.getByRole("status").textContent())?.match(/\d+/)?.[0]);
  await page.goto("/admin/usuarios");
  await page
    .getByRole("row")
    .filter({ hasText: "Seed promoter" })
    .getByRole("button", { name: "Suspender" })
    .click();
  await page.getByLabel("Motivo", { exact: true }).fill("Anuncios duplicados de forma reiterada.");
  await page.getByRole("dialog").getByRole("button", { name: "Suspender" }).click();
  await expect(page.getByText("Cuenta suspendida")).toBeVisible();

  await page.goto("/oportunidades");
  const after = Number((await page.getByRole("status").textContent())?.match(/\d+/)?.[0]);
  expect(after).toBeLessThan(before);

  await page.goto("/admin/actividad");
  await expect(page.getByText("suspendió una cuenta")).toBeVisible();
  await expect(page.getByText("retiró un anuncio")).toBeVisible();

  // Leave shared seed data as we found it (public specs rely on it).
  await page.goto("/admin/usuarios");
  await page
    .getByRole("row")
    .filter({ hasText: "Seed promoter" })
    .getByRole("button", { name: "Reactivar" })
    .click();
  await expect(page.getByText("Cuenta reactivada")).toBeVisible();
  await context.close();
});
