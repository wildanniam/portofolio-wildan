import type { Metadata } from "next";
import { Archivo, Geist_Mono, Newsreader } from "next/font/google";

import { getSiteShell } from "@/content/queries.server";
import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  axes: ["wdth"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: "variable",
  axes: ["opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  preload: false,
});

const profile = getSiteShell().profile;
const rootTitle = `${profile.name} | ${profile.identity}`;
const rootDescription = profile.headline.supporting;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: rootTitle,
    template: `%s | ${profile.name}`,
  },
  description: rootDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: rootTitle,
    description: rootDescription,
    images: [
      {
        url: absoluteSiteUrl(siteConfig.socialImage.pathname),
        width: siteConfig.socialImage.width,
        height: siteConfig.socialImage.height,
        alt: siteConfig.socialImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: rootTitle,
    description: rootDescription,
    images: [absoluteSiteUrl(siteConfig.socialImage.pathname)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${archivo.variable} ${newsreader.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
