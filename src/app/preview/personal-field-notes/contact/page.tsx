import type { Metadata } from "next";

import { PersonalFieldNotesContact } from "@/components/pfn/pfn-routes";
import { getSiteShell } from "@/content/queries.server";

export const metadata: Metadata = { title: "Contact — Personal Field Notes", robots: { index: false, follow: false } };

export default function PersonalFieldNotesContactPreviewPage() {
  return <PersonalFieldNotesContact basePath="/preview/personal-field-notes" profile={getSiteShell().profile} />;
}
