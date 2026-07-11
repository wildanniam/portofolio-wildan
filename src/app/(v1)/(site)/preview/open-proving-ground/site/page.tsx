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

type PortfolioCompositionPreviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortfolioCompositionPreviewPage({
  searchParams,
}: PortfolioCompositionPreviewPageProps) {
  if (process.env.PORTFOLIO_V1_PREVIEW !== "1") {
    notFound();
  }

  const selection = getHomepage({ preview: true });
  const query = await searchParams;
  const selectedProjectSlug =
    typeof query.project === "string" ? query.project : undefined;

  return (
    <PortfolioHomeSkeleton
      explorerFormAction="/preview/open-proving-ground/site#flagship-work-explorer-panel"
      projectHref={(project) =>
        `/preview/open-proving-ground/content/${project.slug}`
      }
      selectedProjectSlug={selectedProjectSlug}
      selection={selection}
    />
  );
}
