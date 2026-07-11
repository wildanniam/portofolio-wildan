import type { ProjectRecord } from "@/content/types";

import {
  humanizeProjectValue,
  projectPeriod,
} from "@/components/v1/work/project-ledger";

type ProjectFactsProps = {
  project: ProjectRecord;
};

export function ProjectFacts({ project }: ProjectFactsProps) {
  return (
    <dl className="opg-project-facts">
      <div>
        <dt>Role</dt>
        <dd>{project.role.label}</dd>
      </div>
      <div>
        <dt>Lifecycle</dt>
        <dd>{humanizeProjectValue(project.lifecycle)}</dd>
      </div>
      <div>
        <dt>Period</dt>
        <dd>{projectPeriod(project)}</dd>
      </div>
      <div>
        <dt>Context</dt>
        <dd>{project.origin.map(humanizeProjectValue).join(", ")}</dd>
      </div>
      <div>
        <dt>Validation</dt>
        <dd>
          {project.validationKinds.length > 0
            ? project.validationKinds.map(humanizeProjectValue).join(", ")
            : "Repository-backed build"}
        </dd>
      </div>
      <div>
        <dt>Last updated</dt>
        <dd>{project.lastUpdatedAt}</dd>
      </div>
      <div className="opg-project-facts__wide">
        <dt>Stack</dt>
        <dd>{project.technologies.join(", ")}</dd>
      </div>
    </dl>
  );
}
