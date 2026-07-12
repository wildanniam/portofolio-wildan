import { PersonalFieldNotesHome } from "@/components/pfn/pfn-home";
import { getHomepage } from "@/content/queries.server";

export default function HomePage() {
  return <PersonalFieldNotesHome selection={getHomepage()} />;
}
