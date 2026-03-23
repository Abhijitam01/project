import { config as loadEnv } from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import type { NextConfig } from "next"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
loadEnv({ path: path.join(__dirname, "../../.env"), override: false })

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
