import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Évite que Next prenne un lockfile parent (`~/package-lock.json`) comme racine du workspace. */
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/legacy-agency/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
