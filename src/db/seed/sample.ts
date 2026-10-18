import path from "node:path";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { sql } from "drizzle-orm";
import sharp from "sharp";

import { createStorageClient } from "../../lib/storage/create-client";
import type { Db } from "../create";
import { opportunities, opportunityImages, users } from "../schema";

/**
 * Fake marketplace data for LOCAL development and e2e tests only (scripts refuse
 * remote databases). Seed users have `clerk_user_id` starting with "seed_": the app
 * shows placeholder contact data for them instead of calling Clerk.
 */

type Sample = {
  type: "CRV" | "CRA" | "OCUPACION" | "NPL" | "COINVERSION";
  title: string;
  municipality: string; // INE code
  amount: number;
  minTicket: number | null;
  term: number;
  nominal: [number, number];
  featured?: boolean;
  closesInDays?: number;
  paragraphs: string[];
};

const SAMPLES: Sample[] = [
  {
    type: "CRV",
    title: "Piso de 3 dormitorios para reformar junto a la Malagueta",
    municipality: "29067",
    amount: 240_000,
    minTicket: 10_000,
    term: 12,
    nominal: [14, 18],
    featured: true,
    paragraphs: [
      "Vivienda de 95 m² en tercera planta con ascensor, a cinco minutos de la playa de la Malagueta.",
      "Estrategia: reforma integral en 10 semanas y venta orientada a comprador nacional y extranjero. Comparables de la zona por encima de 4.800 €/m².",
    ],
  },
  {
    type: "CRA",
    title: "Edificio de 6 apartamentos turísticos en Triana",
    municipality: "41091",
    amount: 1_200_000,
    minTicket: 50_000,
    term: 60,
    nominal: [42, 42],
    featured: true,
    paragraphs: [
      "Edificio completo con licencia en trámite para seis apartamentos de uno y dos dormitorios.",
      "La rentabilidad procede del alquiler de temporada y de la revalorización del activo al final del periodo.",
    ],
  },
  {
    type: "NPL",
    title: "Cartera de 4 créditos hipotecarios con garantía en Madrid",
    municipality: "28079",
    amount: 650_000,
    minTicket: 25_000,
    term: 24,
    nominal: [20, 30],
    paragraphs: [
      "Compra con descuento de cuatro préstamos impagados garantizados por viviendas en Carabanchel y Usera.",
      "Escenarios de salida: acuerdo con el deudor, dación en pago o adjudicación en subasta.",
    ],
  },
  {
    type: "OCUPACION",
    title: "Chalet adosado ocupado con descuento del 45 % en Alicante",
    municipality: "03014",
    amount: 120_000,
    minTicket: null,
    term: 18,
    nominal: [25, 35],
    paragraphs: [
      "Adosado de 140 m² con jardín en zona residencial consolidada. Precio de compra muy por debajo de mercado.",
      "Incluye estimación de costes y plazos del procedimiento de recuperación de la posesión.",
    ],
  },
  {
    type: "COINVERSION",
    title: "Coinversión en promoción de 12 viviendas en Valladolid",
    municipality: "47186",
    amount: 900_000,
    minTicket: 5_000,
    term: 30,
    nominal: [22, 22],
    closesInDays: 45,
    paragraphs: [
      "Promoción de obra nueva con licencia concedida y el 40 % de las viviendas ya reservadas.",
      "El promotor aporta el 30 % del capital propio y coinvierte en las mismas condiciones que los inversores.",
    ],
  },
  {
    type: "CRV",
    title: "Ático con terraza para reformar en el Eixample",
    municipality: "08019",
    amount: 480_000,
    minTicket: 20_000,
    term: 14,
    nominal: [12, 16],
    paragraphs: [
      "Ático de 85 m² con 30 m² de terraza en finca regia. Reforma de alto standing.",
      "Salida prevista a comprador final en el mercado prime de Barcelona.",
    ],
  },
  {
    type: "CRA",
    title: "Local comercial reconvertible en dos viviendas en Valencia",
    municipality: "46250",
    amount: 210_000,
    minTicket: 15_000,
    term: 48,
    nominal: [38, 44],
    paragraphs: [
      "Cambio de uso de local a dos viviendas en Ruzafa, con informe urbanístico favorable.",
      "Alquiler de larga estancia con demanda contrastada en el barrio.",
    ],
  },
  {
    type: "CRV",
    title: "Casa de pueblo para rehabilitar cerca de Pontevedra",
    municipality: "36038",
    amount: 95_000,
    minTicket: 5_000,
    term: 10,
    nominal: [16, 16],
    paragraphs: [
      "Casa de piedra de 160 m² en parcela de 600 m², a 10 minutos del centro de Pontevedra.",
      "Rehabilitación respetando la fachada original y venta como primera vivienda.",
    ],
  },
  {
    type: "NPL",
    title: "Crédito con garantía de solar urbano en Zaragoza",
    municipality: "50297",
    amount: 180_000,
    minTicket: 10_000,
    term: 18,
    nominal: [18, 26],
    paragraphs: [
      "Préstamo impagado garantizado por un solar urbano finalista de 900 m².",
      "Valor de tasación muy superior a la deuda adquirida.",
    ],
  },
  {
    type: "COINVERSION",
    title: "Coinversión en hotel boutique en Palma",
    municipality: "07040",
    amount: 2_500_000,
    minTicket: 50_000,
    term: 72,
    nominal: [55, 70],
    paragraphs: [
      "Rehabilitación de edificio histórico en el casco antiguo de Palma para hotel de 18 habitaciones.",
      "Operador hotelero con experiencia y contrato de gestión firmado.",
    ],
  },
];

function doc(paragraphs: string[]) {
  return {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "La oportunidad" }] },
      ...paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
    ],
  };
}

/** Distinct crops of the brand hero, so cards don't all look the same. */
async function sampleImages(count: number) {
  const hero = path.join(process.cwd(), "public/brand/hero.webp");
  const { width = 2400, height = 1600 } = await sharp(hero).metadata();
  const crops = [];
  for (let i = 0; i < count; i++) {
    const w = Math.round(width * 0.45);
    const h = Math.round(w * 0.75);
    const left = Math.round(((width - w) * ((i * 37) % 100)) / 100);
    const top = Math.round(((height - h) * ((i * 61) % 100)) / 100);
    crops.push(
      await sharp(hero)
        .extract({ left, top, width: w, height: h })
        .resize(1200, 900)
        .modulate({ hue: (i * 23) % 360, saturation: 0.9 })
        .webp({ quality: 70 })
        .toBuffer(),
    );
  }
  return crops;
}

export async function seedSampleData(db: Db) {
  const existing = await db.select({ n: sql<number>`count(*)::int` }).from(opportunities);
  if ((existing[0]?.n ?? 0) > 0) return { opportunities: 0, skipped: true };

  const storage = createStorageClient({
    endpoint: process.env.R2_ENDPOINT,
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  });
  const bucket = process.env.R2_PUBLIC_BUCKET!;

  const [promoter, platform] = await db
    .insert(users)
    .values([{ clerkUserId: "seed_promoter" }, { clerkUserId: "seed_platform" }])
    .onConflictDoUpdate({ target: users.clerkUserId, set: { status: "active" } })
    .returning();

  const images = await sampleImages(SAMPLES.length * 2);
  const now = Date.now();

  for (const [index, sample] of SAMPLES.entries()) {
    const owner = sample.featured ? platform! : promoter!;
    const province = sample.municipality.slice(0, 2);
    const [{ communityCode }] = (
      await db.execute(
        sql`select community_code as "communityCode" from provinces where code = ${province}`,
      )
    ).rows as [{ communityCode: string }];
    const annual = (n: number) => Math.round(((n * 12) / sample.term) * 100) / 100;
    const [created] = await db
      .insert(opportunities)
      .values({
        slug: `${sample.title
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-seed${index}`,
        promoterId: owner.id,
        type: sample.type,
        title: sample.title,
        description: doc(sample.paragraphs),
        descriptionText: sample.paragraphs.join("\n"),
        amountToRaise: sample.amount,
        minTicket: sample.minTicket,
        termMonths: sample.term,
        closesAt: sample.closesInDays ? new Date(now + sample.closesInDays * 86_400_000) : null,
        returnKind: sample.nominal[0] === sample.nominal[1] ? "fixed" : "range",
        returnNominalMin: sample.nominal[0],
        returnNominalMax: sample.nominal[1],
        returnAnnualMin: annual(sample.nominal[0]),
        returnAnnualMax: annual(sample.nominal[1]),
        municipalityCode: sample.municipality,
        provinceCode: province,
        communityCode,
        isFeatured: Boolean(sample.featured),
        publishedAt: new Date(now - index * 3_600_000 * 7),
      })
      .returning({ id: opportunities.id });

    for (let position = 0; position < 2; position++) {
      const key = `seed/${created!.id}/${position}.webp`;
      await storage.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: images[index * 2 + position],
          ContentType: "image/webp",
        }),
      );
      await db.insert(opportunityImages).values({
        opportunityId: created!.id,
        storageKey: key,
        position,
        width: 1200,
        height: 900,
      });
    }
  }
  return { opportunities: SAMPLES.length };
}
