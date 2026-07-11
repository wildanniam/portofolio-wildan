import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/contact": ["./content/**/*"],
    "/moments": ["./content/**/*"],
    "/preview/open-proving-ground/content/*": ["./content/**/*"],
    "/preview/open-proving-ground/site": ["./content/**/*"],
    "/sitemap.xml": ["./content/**/*"],
    "/work": ["./content/**/*"],
    "/work/*": ["./content/**/*"],
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
