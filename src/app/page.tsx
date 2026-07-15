import { ResearchBuildHome } from "@/components/portfolio/home/research-build-home";
import { getHomepage } from "@/content/queries.server";

export default function HomePage() {
  return <ResearchBuildHome selection={getHomepage()} />;
}
