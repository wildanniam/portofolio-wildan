import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";

import "@/styles/v1-foundations.css";
import "@/styles/v1-routes.css";
import "@/styles/v1-explorer.css";
import "@/styles/v1-moments.css";

const title = `${siteConfig.name} - ${siteConfig.role}`;

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: title,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    title,
    description: siteConfig.description,
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary",
    title,
    description: siteConfig.description,
  },
};

export default function PortfolioV1Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-portfolio-v1 data-site-shell="v1">
      {children}
    </div>
  );
}
