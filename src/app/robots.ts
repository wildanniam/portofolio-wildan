import type { MetadataRoute } from "next";

import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [],
    },
    host: siteConfig.url,
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
