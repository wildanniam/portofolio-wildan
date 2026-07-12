import type { Metadata } from "next";

import { PersonalFieldNotesAbout } from "@/components/pfn/pfn-routes";
import { getSiteShell } from "@/content/queries.server";

export const metadata: Metadata = { title: "About — Personal Field Notes", robots: { index: false, follow: false } };

export default function PersonalFieldNotesAboutPreviewPage() {
  return <PersonalFieldNotesAbout basePath="/preview/personal-field-notes" profile={getSiteShell().profile} />;
}
