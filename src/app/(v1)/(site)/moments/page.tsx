import { notFound } from "next/navigation";

import { MomentsArchive } from "@/components/v1/moments/moments-archive";
import { getMomentsNarrative } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

const publishedMetadata = createPublicPageMetadata({
  title: "Moments",
  description:
    "Documentary moments from the projects, competitions, and people around Wildan Syukri Niam's work.",
  pathname: "/moments",
});

export function generateMetadata() {
  return getMomentsNarrative()
    ? publishedMetadata
    : {
        title: "Moments unavailable",
      };
}

export default function MomentsPage() {
  const moments = getMomentsNarrative();

  if (!moments) notFound();

  return <MomentsArchive moments={moments} />;
}
