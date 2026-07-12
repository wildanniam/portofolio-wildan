import type { Metadata } from "next";

import { PersonalFieldNotesMoments } from "@/components/pfn/pfn-routes";
import { getPublishedMoments } from "@/content/queries.server";

export const metadata: Metadata = { title: "Moments — Personal Field Notes", robots: { index: false, follow: false } };

export default function PersonalFieldNotesMomentsPreviewPage() {
  return <PersonalFieldNotesMoments basePath="/preview/personal-field-notes" moments={getPublishedMoments()} />;
}
