import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/contact": ["./content/**/*", "./public/media/**/*"],
    "/moments": ["./content/**/*", "./public/media/**/*"],
    "/sitemap.xml": ["./content/**/*", "./public/media/**/*"],
    "/work": ["./content/**/*", "./public/media/**/*"],
    "/work/*": ["./content/**/*", "./public/media/**/*"],
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  turbopack: {
    root: process.cwd(),
  },
};

const withMDX = createMDX({
  extension: /\.mdx$/,
});

export default withMDX(nextConfig);
