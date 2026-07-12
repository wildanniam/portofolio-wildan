import "server-only";

import type { ReactNode } from "react";

export async function getProjectNarrative(slug: string): Promise<ReactNode> {
  const { default: Narrative } = await import(`@content/projects/${slug}/case-study.mdx`);
  return <Narrative />;
}
