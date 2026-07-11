import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortfolioHomeSkeleton } from "@/components/v1/home/portfolio-home-skeleton";
import { getHomepage } from "@/content/queries.server";

export const metadata: Metadata = {
  title: "Portfolio V1 composition preview",
  description:
    "A private, motion-free composition proof for Wildan Syukri Niam's portfolio V1.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function PortfolioCompositionPreviewPage() {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") {
    notFound();
  }

  const selection = getHomepage({ preview: true });

  return (
    <PortfolioHomeSkeleton
      projectHref={(project) =>
        `/preview/open-proving-ground/content/${project.slug}`
      }
      selection={selection}
    />
  );
}
