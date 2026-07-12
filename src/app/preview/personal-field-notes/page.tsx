import type { Metadata } from "next";

import { PersonalFieldNotesHome } from "@/components/pfn/pfn-home";
import { getHomepage } from "@/content/queries.server";

export const metadata: Metadata = {
  title: "Personal Field Notes — Preview",
  description: "Private implementation preview for Wildan Syukri Niam's portfolio.",
  robots: { index: false, follow: false },
};

export default function PersonalFieldNotesPreviewPage() {
  return (
    <PersonalFieldNotesHome
      basePath="/preview/personal-field-notes"
      selection={getHomepage()}
    />
  );
}
