import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  // Static export mode: generate an exportable static site with `next build`
  output: 'export',
};

export default nextConfig;
