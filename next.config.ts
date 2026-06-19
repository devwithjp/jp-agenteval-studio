import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the Turbopack root to this project so a stray parent lockfile doesn't
  // get picked up as the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
  // Mounted under the unified portfolio domain at this sub-path (multi-zones).
  // Keep in sync with BASE_PATH in src/lib/base.ts.
  basePath: "/live/agenteval",
};

export default nextConfig;
