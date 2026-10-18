import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

import { brand } from "@/config/brand";

export const alt = brand.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card. Colours mirror src/styles/theme.css (navy + gold). */
export default async function OpengraphImage() {
  const t = await getTranslations("home");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "linear-gradient(135deg, #0a2342 0%, #0f3460 100%)",
        color: "#f4f1ec",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#d4a574" }}>
        {brand.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ width: 80, height: 3, background: "#d4a574" }} />
        <div style={{ fontSize: 64, lineHeight: 1.1, maxWidth: 900 }}>{t("title")}</div>
      </div>
      <div style={{ fontSize: 24, opacity: 0.7 }}>{brand.domain}</div>
    </div>,
    size,
  );
}
