import { ContactRoute } from "@/components/portfolio/routes/contact-route";
import { getSiteShell } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "Contact",
  description: "Collaborate with Wildan Syukri Niam on AI agents, software engineering, and Web3 products.",
  pathname: "/contact",
});

export default function ContactPage() {
  return <ContactRoute basePath="" shell={getSiteShell()} />;
}
