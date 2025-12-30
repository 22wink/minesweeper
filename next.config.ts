import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  // Static export mode: generate an exportable static site with `next build`
  // When deploying to GitHub Pages under `https://<user>.github.io/<repo>`, set basePath/assetPrefix.
  // We derive repo name from GITHUB_REPOSITORY in CI; locally fallback to NEXT_PUBLIC_BASEPATH if set.
  output: 'export',
  basePath: process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : process.env.NEXT_PUBLIC_BASEPATH || '',
  assetPrefix: process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : process.env.NEXT_PUBLIC_BASEPATH || '',
};

export default nextConfig;
