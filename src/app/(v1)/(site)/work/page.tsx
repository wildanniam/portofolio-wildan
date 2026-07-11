import { WorkArchive } from "@/components/v1/work/work-archive";
import { getWorkProjectSummaries } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Work",
  description:
    "An evidence-backed archive of AI, Web3, and product work by Wildan Syukri Niam.",
  pathname: "/work",
});

export default function WorkPage() {
  return <WorkArchive projects={getWorkProjectSummaries()} />;
}
