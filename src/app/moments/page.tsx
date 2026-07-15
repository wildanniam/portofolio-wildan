import { PersonalFieldNotesMoments } from "@/components/pfn/pfn-moments-route";
import { getPublishedMoments, getSiteShell } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Moments",
  description: "Documentary field notes from Wildan's builder journey.",
  pathname: "/moments",
});

export default function MomentsPage() {
  return <PersonalFieldNotesMoments basePath="" moments={getPublishedMoments()} shell={getSiteShell()} />;
}
