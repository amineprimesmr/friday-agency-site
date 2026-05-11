import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Hôtes iTunes/App Store artwork (sans ceci, Next peut refuser `<Image>` distants en dev). */
const APPLE_MZSTATIC_PATTERNS = Array.from({ length: 18 }, (_, i) => ({
  protocol: "https" as const,
  hostname: `is${i + 1}-ssl.mzstatic.com`,
  pathname: "/**" as const,
}));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: APPLE_MZSTATIC_PATTERNS,
  },
  /** Autoriser l’embedding cross-origin des snippets /embed/* dans des iframes (CSP niveau cadre uniquement). */
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/", destination: "/tracker", permanent: true },
    ];
  },
};

export default nextConfig;
