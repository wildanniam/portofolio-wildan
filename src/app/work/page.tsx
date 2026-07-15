import { WorkArchive } from "@/components/portfolio/routes/work-archive";
import { getSiteShell, getWorkProjectSummaries } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Work",
  description: "Case studies across AI agents, Web3 infrastructure, and machine-native payments by Wildan Syukri Niam.",
  pathname: "/work",
});

export default function WorkPage() {
  return <WorkArchive basePath="" projects={getWorkProjectSummaries()} shell={getSiteShell()} />;
}
