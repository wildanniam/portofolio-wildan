import { AboutRoute } from "@/components/portfolio/routes/about-route";
import { getSiteShell } from "@/content/queries.server";
import { createPublicPageMetadata } from "@/lib/site-config";

export const metadata = createPublicPageMetadata({
  title: "About",
  description: "Wildan Syukri Niam's research and building practice across AI agents, software engineering, and Web3.",
  pathname: "/about",
});

export default function AboutPage() {
  return <AboutRoute basePath="" shell={getSiteShell()} />;
}
