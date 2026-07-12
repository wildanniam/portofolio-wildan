import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";

import { absoluteSiteUrl, siteConfig } from "@/lib/site-config";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Wildan Syukri Niam — Software Engineer",
    template: "%s — Wildan Syukri Niam",
  },
  description:
    "Personal field notes from Wildan Syukri Niam: AI, Web3, and full-stack systems built to be inspected.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: "Wildan Syukri Niam — Software Engineer",
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
    title: "Wildan Syukri Niam — Software Engineer",
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
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
