import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Public R2 bucket (MinIO locally) where opportunity photos are served from.
const publicStorage = new URL(process.env.NEXT_PUBLIC_R2_CLOUDFLARE_URL ?? "http://localhost:9010");
const isLocalStorage = ["localhost", "127.0.0.1"].includes(publicStorage.hostname);

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    remotePatterns: [
      {
        protocol: publicStorage.protocol.replace(":", "") as "http" | "https",
        hostname: publicStorage.hostname,
        port: publicStorage.port,
        pathname: `${publicStorage.pathname.replace(/\/$/, "")}/**`,
      },
    ],
    // Only for the local MinIO bucket (localhost). Never true in production.
    dangerouslyAllowLocalIP: isLocalStorage,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
