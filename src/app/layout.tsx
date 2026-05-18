import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wildanniam.dev"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark" enableSystem attribute="class">
          <Navbar />
          {children}
          <Toaster richColors position="top-right" />
          <Footer />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
