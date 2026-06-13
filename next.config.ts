import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the Turbopack root to this project so a stray parent lockfile doesn't
  // get picked up as the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
