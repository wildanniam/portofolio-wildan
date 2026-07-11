import { ActionLink } from "@/components/v1/foundations/action-link";
import { EditorialGrid } from "@/components/v1/foundations/editorial-grid";
import type { ProjectRecord } from "@/content/types";

import { ProjectFacts } from "./project-facts";
import { ProjectLinks } from "@/components/v1/work/project-links";

type ProjectOpeningProps = {
  backHref: string;
  preview: boolean;
  project: ProjectRecord;
};

export function ProjectOpening({
  backHref,
  preview,
  project,
}: ProjectOpeningProps) {
  return (
    <header className="opg-project-opening" data-preview={preview || undefined}>
      <ActionLink className="opg-project-opening__back" direction="back" href={backHref}>
        Back to work
      </ActionLink>

      <EditorialGrid className="opg-project-opening__grid">
        <h1 className="opg-project-opening__title">{project.title}</h1>
        <p className="opg-project-opening__summary">{project.oneLiner}</p>
        <div className="opg-project-opening__links">
          <ProjectLinks links={project.links} projectTitle={project.title} />
        </div>
        <ProjectFacts project={project} />
      </EditorialGrid>
    </header>
  );
}
