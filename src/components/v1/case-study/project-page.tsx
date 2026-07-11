import type { ReactNode } from "react";

import { ActionLink } from "@/components/v1/foundations/action-link";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import type { FullProjectRecord } from "@/content/types";

import { ProjectOpening } from "./project-opening";

type ProjectPageProps = {
  backHref?: string;
  narrative: ReactNode;
  preview?: boolean;
  project: FullProjectRecord;
};

export function ProjectPage({
  backHref = "/work",
  narrative,
  preview = false,
  project,
}: ProjectPageProps) {
  return (
    <article className="opg-project-page" data-project-page data-project-state="full">
      <SiteContainer>
        <ProjectOpening backHref={backHref} preview={preview} project={project} />

        <section aria-label="Case-study narrative" className="opg-project-narrative">
          <div className="opg-project-prose">{narrative}</div>
        </section>

        <footer className="opg-project-page__footer">
          <ActionLink direction="back" href={backHref}>
            Back to work
          </ActionLink>
        </footer>
      </SiteContainer>
    </article>
  );
}
