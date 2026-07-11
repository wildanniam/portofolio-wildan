import type { ProjectLifecycle, ProjectOrigin } from "@/content/types";
import { cn } from "@/lib/utils";

export type ProjectLedgerItem = {
  endedAt?: string;
  lifecycle: ProjectLifecycle;
  oneLiner: string;
  origin: readonly ProjectOrigin[];
  role: {
    label: string;
  };
  slug: string;
  startedAt: string;
  title: string;
};

export type ProjectHrefResolver = (project: ProjectLedgerItem) => string;

type ProjectLedgerProps = {
  className?: string;
  projectHref?: ProjectHrefResolver;
  projects: readonly ProjectLedgerItem[];
};

export function defaultProjectHref(project: ProjectLedgerItem): string {
  return `/work/${project.slug}`;
}

export function humanizeProjectValue(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function projectPeriod(project: ProjectLedgerItem): string {
  if (project.endedAt) return `${project.startedAt} - ${project.endedAt}`;
  if (project.lifecycle === "active" || project.lifecycle === "beta") {
    return `${project.startedAt} - Present`;
  }
  return project.startedAt;
}

export function ProjectLedger({
  className,
  projectHref = defaultProjectHref,
  projects,
}: ProjectLedgerProps) {
  return (
    <ol className={cn("opg-project-ledger", className)}>
      {projects.map((project, index) => (
        <li className="opg-project-ledger__item" key={project.slug}>
          <span aria-hidden="true" className="opg-project-ledger__index">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="opg-project-ledger__identity">
            <h3 className="opg-project-ledger__title">
              <a href={projectHref(project)}>{project.title}</a>
            </h3>
            <p className="opg-project-ledger__summary">{project.oneLiner}</p>
          </div>

          <dl className="opg-project-ledger__facts">
            <div>
              <dt>Role</dt>
              <dd>{project.role.label}</dd>
            </div>
            <div>
              <dt>Context</dt>
              <dd>{project.origin.map(humanizeProjectValue).join(", ")}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{projectPeriod(project)}</dd>
            </div>
          </dl>

          <span aria-hidden="true" className="opg-project-ledger__mark">
            →
          </span>
        </li>
      ))}
    </ol>
  );
}
