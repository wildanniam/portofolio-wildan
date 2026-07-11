import type { Metadata } from "next";

import { LegacyShell } from "@/components/legacy/legacy-shell";

export const metadata: Metadata = {
  title: {
    default: "Wildan Syukri Niam - AI Researcher & Web3 Builder",
    template: "%s - Wildan Syukri Niam",
  },
  description:
    "Portfolio of Wildan Syukri Niam, an AI Researcher and Web3 Builder working on trustworthy agents, on-chain intelligence, and autonomous payment systems.",
  openGraph: {
    title: "Wildan Syukri Niam - AI Researcher & Web3 Builder",
    description:
      "Trustworthy AI agents, Web3 trust layers, on-chain intelligence, and agentic payments.",
    type: "website",
    url: "https://wildanniam.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wildan Syukri Niam - AI Researcher & Web3 Builder",
    description:
      "Building trustworthy AI agents for Web3 systems, payments, and software reliability.",
  },
};

export default function LegacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LegacyShell>{children}</LegacyShell>;
}
