import type { ExplorerProjectDto } from "@/content/explorer-dto";
import { cn } from "@/lib/utils";

import { ProjectExplorerIsland } from "./project-explorer-island";

export type ProjectExplorerProps = {
  className?: string;
  defaultSlug?: string;
  formAction: string;
  id?: string;
  projects: readonly ExplorerProjectDto[];
};

export function ProjectExplorer({
  className,
  defaultSlug,
  formAction,
  id = "flagship-work-explorer",
  projects,
}: ProjectExplorerProps) {
  if (projects.length === 0) return null;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className={cn("opg-work-explorer", className)}
      data-project-explorer
      id={id}
    >
      <header className="opg-work-explorer__heading">
        <div>
          <h2 id={`${id}-heading`}>Selected work</h2>
          <p>
            Four build records, read through responsibility, working systems, and
            inspectable evidence.
          </p>
        </div>
      </header>

      <ProjectExplorerIsland
        defaultSlug={defaultSlug}
        explorerId={id}
        formAction={formAction}
        projects={projects}
      />
    </section>
  );
}
