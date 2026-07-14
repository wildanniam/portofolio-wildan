import type { Metadata } from "next";
import { Archivo, Bodoni_Moda, Geist_Mono } from "next/font/google";

import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Wildan Syukri Niam | Software Engineer",
    template: "%s | Wildan Syukri Niam",
  },
  description:
    "Personal field notes from Wildan Syukri Niam: AI, Web3, and full-stack systems built to be inspected.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: "Wildan Syukri Niam | Software Engineer",
    description:
      "Personal field notes from a student builder working across AI, Web3, and full-stack systems.",
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
    title: "Wildan Syukri Niam | Software Engineer",
    description:
      "Personal field notes from a student builder working across AI, Web3, and full-stack systems.",
    images: [absoluteSiteUrl(siteConfig.socialImage.pathname)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${archivo.variable} ${bodoniModa.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
