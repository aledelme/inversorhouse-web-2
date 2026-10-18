/**
 * Builds optimised brand assets in public/brand and src/app (icons) from the
 * original raster logos (navy on white). Re-run when the source logos change:
 *
 *   pnpm tsx scripts/brand/build-assets.ts <dir-with-isotipo.webp-logo-title.webp-hero-inmobiliario.webp>
 */
import { join } from "node:path";

import sharp from "sharp";

const OUT = join(process.cwd(), "public/brand");
const APP = join(process.cwd(), "src/app");

/**
 * Recolours a logo to a flat `rgb`, keeping its shape. Works for both transparent sources and
 * "dark ink on white": alpha = source alpha × ink darkness (drops white halos/backgrounds).
 */
async function inkToAlpha(input: string, rgb: [number, number, number], width: number) {
  const { data, info } = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!;
    const ink = Math.max(0, Math.min(1, (245 - lum) / (245 - 90)));
    out[i] = rgb[0];
    out[i + 1] = rgb[1];
    out[i + 2] = rgb[2];
    out[i + 3] = Math.round((data[i + 3]! / 255) * ink * 255);
  }
  const png = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
  return sharp(png).trim();
}

async function main(src: string) {
  const NAVY: [number, number, number] = [15, 52, 96]; // --brand-navy #0f3460
  const WHITE: [number, number, number] = [255, 255, 255];
  const iso = join(src, "isotipo.webp");
  const word = join(src, "logo-title.webp");

  await (
    await inkToAlpha(iso, NAVY, 512)
  )
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, "isotipo.png"));
  await (
    await inkToAlpha(iso, WHITE, 512)
  )
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, "isotipo-white.png"));
  await (
    await inkToAlpha(word, NAVY, 1200)
  )
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, "wordmark.png"));
  await (
    await inkToAlpha(word, WHITE, 1200)
  )
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, "wordmark-white.png"));

  // App icons (Next file conventions): transparent icon + padded white apple icon.
  const mark = await (await inkToAlpha(iso, NAVY, 512)).png().toBuffer();
  await sharp(mark)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(APP, "icon.png"));
  const inner = await sharp(mark)
    .resize(140, 140, { fit: "contain", background: "#ffffff" })
    .png()
    .toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: "#ffffff" } })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toFile(join(APP, "apple-icon.png"));

  await sharp(join(src, "hero-inmobiliario.webp"))
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(join(OUT, "hero.webp"));
  console.log("✔ brand assets written to public/brand and src/app");
}

main(process.argv[2] ?? "../inversorhouse-web/public").catch((error) => {
  console.error(error);
  process.exit(1);
});
