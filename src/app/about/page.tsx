import { PersonalFieldNotesAbout } from "@/components/pfn/pfn-routes";
import { getSiteShell } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "About",
  description: "How Wildan Syukri Niam approaches ambitious, inspectable software systems.",
  pathname: "/about",
});

export default function AboutPage() {
  return <PersonalFieldNotesAbout basePath="" shell={getSiteShell()} />;
}
