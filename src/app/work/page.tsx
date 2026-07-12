import { PersonalFieldNotesWork } from "@/components/pfn/pfn-routes";
import { getWorkProjectSummaries } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Work",
  description: "Selected AI, Web3, and full-stack systems by Wildan Syukri Niam.",
  pathname: "/work",
});

export default function WorkPage() {
  return <PersonalFieldNotesWork basePath="" projects={getWorkProjectSummaries()} />;
}
