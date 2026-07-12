import type { Metadata } from "next";

import { PersonalFieldNotesWork } from "@/components/pfn/pfn-routes";
import { getWorkProjectSummaries } from "@/content/queries.server";

export const metadata: Metadata = {
  title: "Work index — Personal Field Notes",
  robots: { index: false, follow: false },
};

export default function PersonalFieldNotesWorkPreviewPage() {
  return (
    <PersonalFieldNotesWork
      basePath="/preview/personal-field-notes"
      projects={getWorkProjectSummaries()}
    />
  );
}
