import { SpeedInsights } from "@vercel/speed-insights/next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function LegacyShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" enableSystem attribute="class">
      <div data-site-shell="legacy">
        <Navbar />
        {children}
        <Toaster richColors position="top-right" />
        <Footer />
        <SpeedInsights />
      </div>
    </ThemeProvider>
  );
}
