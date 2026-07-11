import { ActionLink } from "@/components/v1/foundations/action-link";
import { SiteContainer } from "@/components/v1/foundations/site-container";
import type { BriefProjectRecord } from "@/content/types";

import { ProjectOpening } from "./project-opening";

type ProjectBriefPageProps = {
  backHref?: string;
  preview?: boolean;
  project: BriefProjectRecord;
};

export function ProjectBriefPage({
  backHref = "/work",
  preview = false,
  project,
}: ProjectBriefPageProps) {
  return (
    <article
      className="opg-project-page opg-project-brief"
      data-project-page
      data-project-state="brief"
    >
      <SiteContainer>
        <ProjectOpening backHref={backHref} preview={preview} project={project} />

        <div className="opg-project-brief__body">
          <section aria-labelledby={`${project.slug}-context`}>
            <h2 id={`${project.slug}-context`}>Why it exists</h2>
            <p>{project.context}</p>
          </section>

          <section aria-labelledby={`${project.slug}-outcome`}>
            <h2 id={`${project.slug}-outcome`}>What the build produced</h2>
            <p>{project.outcome}</p>
          </section>

          <section aria-labelledby={`${project.slug}-role`}>
            <h2 id={`${project.slug}-role`}>My role</h2>
            <p>{project.role.label}</p>
            <ul>
              {project.role.scope.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </section>

          {project.collaborators && project.collaborators.length > 0 ? (
            <section aria-labelledby={`${project.slug}-collaborators`}>
              <h2 id={`${project.slug}-collaborators`}>Built with</h2>
              <ul className="opg-project-brief__collaborators">
                {project.collaborators.map((collaborator) => (
                  <li key={collaborator.id}>
                    {collaborator.url ? (
                      <a href={collaborator.url} rel="noreferrer" target="_blank">
                        {collaborator.name}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span>{collaborator.name}</span>
                    )}
                    {collaborator.role ? <p>{collaborator.role}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <footer className="opg-project-page__footer">
          <ActionLink direction="back" href={backHref}>
            Back to work
          </ActionLink>
        </footer>
      </SiteContainer>
    </article>
  );
}
