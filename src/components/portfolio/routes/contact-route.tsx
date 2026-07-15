import { ArrowUpRight } from "lucide-react";

import type { SiteShellSelection } from "@/content/queries";

import { PortfolioShell } from "../shell/portfolio-shell";

export function ContactRoute({
  basePath = "",
  shell,
}: {
  basePath?: string;
  shell: SiteShellSelection;
}) {
  const { profile } = shell;

  return (
    <PortfolioShell basePath={basePath} currentPath="/contact" mainId="contact-main" {...shell}>
      <main className="v4-contact portfolio-container" id="contact-main" tabIndex={-1}>
        <p className="v4-route-hero__index"><span aria-hidden="true" className="v4-origin-mark" />Contact / Open channel</p>
        <div className="v4-contact__hero">
          <h1>Bring me the part of the system that still feels uncertain.</h1>
          <div>
            <p>If you are building an intelligent product that has to act across real software, payments, or on-chain infrastructure, I want to hear the difficult question—not only the polished pitch.</p>
            <p>{profile.availability}</p>
          </div>
        </div>
        <div className="v4-contact__signal" aria-hidden="true"><span /><i /></div>
        <a className="v4-contact__email" href={`mailto:${profile.email}`}>
          <span>Start with an email</span>
          <strong>{profile.email}</strong>
          <ArrowUpRight aria-hidden="true" size={32} />
        </a>
        <div className="v4-contact__details">
          <dl>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Working across</dt><dd>AI agents / software engineering / Web3</dd></div>
            <div><dt>Response</dt><dd>Context-rich messages are always welcome.</dd></div>
          </dl>
          {profile.github.status === "public" ? (
            <a href={profile.github.url} rel="noreferrer" target="_blank">Explore GitHub <ArrowUpRight aria-hidden="true" size={17} /></a>
          ) : null}
        </div>
      </main>
    </PortfolioShell>
  );
}
