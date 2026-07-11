import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FoundationShowcase } from "@/components/v1/preview/foundation-showcase";

export const metadata: Metadata = {
  title: "Open Proving Ground Foundations",
  description:
    "A private visual checkpoint for Wildan Syukri Niam's portfolio foundations.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function FoundationPreviewPage() {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") {
    notFound();
  }

  return <FoundationShowcase />;
}
