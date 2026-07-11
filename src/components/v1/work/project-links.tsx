import { ActionLink } from "@/components/v1/foundations/action-link";
import type { LinkState, ProjectLinks as ProjectLinkStates } from "@/content/types";

type ProjectLinksProps = {
  links: ProjectLinkStates;
  projectTitle: string;
};

type LinkCandidate = {
  label: string;
  state: LinkState | undefined;
};

const statusLabels: Record<Exclude<LinkState["status"], "public">, string> = {
  offline: "Offline",
  private: "Private",
  unavailable: "Unavailable",
  "not-applicable": "Not applicable",
};

export function ProjectLinks({ links, projectTitle }: ProjectLinksProps) {
  const candidates: LinkCandidate[] = [
    { label: "Live project", state: links.live },
    { label: "Source repository", state: links.source },
    { label: "Documentation", state: links.docs },
    { label: "Demo", state: links.demo },
  ];
  const publicLinks = candidates.filter(
    (candidate): candidate is LinkCandidate & {
      state: Extract<LinkState, { status: "public" }>;
    } => candidate.state?.status === "public",
  );
  const unavailableLinks = candidates.filter(
    (candidate): candidate is LinkCandidate & {
      state: Exclude<LinkState, { status: "public" }>;
    } => Boolean(candidate.state && candidate.state.status !== "public"),
  );

  if (publicLinks.length === 0 && unavailableLinks.length === 0) return null;

  return (
    <div className="opg-project-links">
      {publicLinks.length > 0 ? (
        <nav
          aria-label={`${projectTitle} project links`}
          className="opg-project-links__actions"
        >
          {publicLinks.map(({ label, state }) => (
            <ActionLink
              direction="external"
              href={state.url}
              key={label}
              target="_blank"
            >
              {label}
            </ActionLink>
          ))}
        </nav>
      ) : null}

      {unavailableLinks.length > 0 ? (
        <dl className="opg-project-links__states">
          {unavailableLinks.map(({ label, state }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{statusLabels[state.status]}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
