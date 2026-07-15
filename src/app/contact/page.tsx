import { PersonalFieldNotesContact } from "@/components/pfn/pfn-routes";
import { getSiteShell } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Contact",
  description: "Contact Wildan Syukri Niam for software engineering and product collaboration.",
  pathname: "/contact",
});

export default function ContactPage() {
  return <PersonalFieldNotesContact basePath="" shell={getSiteShell()} />;
}
