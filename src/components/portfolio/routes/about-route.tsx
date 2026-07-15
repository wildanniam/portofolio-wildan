import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { SiteShellSelection } from "@/content/queries";

import { ResponsiveMedia } from "../media/responsive-media";
import { PortfolioShell } from "../shell/portfolio-shell";

export function AboutRoute({
  basePath = "",
  shell,
}: {
  basePath?: string;
  shell: SiteShellSelection;
}) {
  const { profile } = shell;

  return (
    <PortfolioShell basePath={basePath} currentPath="/about" mainId="about-main" {...shell}>
      <main className="v4-route v4-about" id="about-main" tabIndex={-1}>
        <header className="v4-route-hero portfolio-container">
          <p className="v4-route-hero__index"><span aria-hidden="true" className="v4-origin-mark" />About / Working method</p>
          <div className="v4-route-hero__grid">
            <h1>I follow difficult questions until they become working systems.</h1>
            <div>
              <p>{profile.thesis}</p>
              <p className="v4-route-hero__meta">{profile.location} / {profile.education}</p>
            </div>
          </div>
        </header>

        <section aria-labelledby="about-practice-title" className="v4-about__practice portfolio-container">
          {profile.portrait ? (
            <figure>
              <ResponsiveMedia asset={profile.portrait} fit="cover" priority sizes="(max-width: 767px) calc(100vw - 40px), 36vw" />
              <figcaption>{profile.portrait.caption}</figcaption>
            </figure>
          ) : null}
          <div className="v4-about__story">
            <p className="v4-about__kicker">Researching / Building / Shipping</p>
            <h2 id="about-practice-title">Research gives me the question. Building reveals whether the answer survives reality.</h2>
            <p>I am a Software Engineering student at Telkom University working where AI agents, dependable software, and blockchain infrastructure meet. I am interested in systems that can interpret intent and act—without hiding the boundaries people still need to inspect.</p>
            <p>Most of the flagship work here began inside ambitious hackathon constraints. That is not a weakness I want to disguise. It is where I learned to lead a team, reduce a broad idea to one defensible flow, and connect product behavior with the architecture underneath it.</p>
            <p>PayGate is the active shipping thread. Fradium, Nova, and Quorum preserve different experiments in risk, agent-assisted execution, and verifiable coordination. Together they show the research practice more clearly than a list of technologies could.</p>
          </div>
          <dl className="v4-about__facts">
            <div><dt>Identity</dt><dd>{profile.identity}</dd></div>
            <div><dt>Research direction</dt><dd>{profile.researchDirection}</dd></div>
            <div><dt>Discipline</dt><dd>{profile.discipline}</dd></div>
            <div><dt>Available for</dt><dd>{profile.availability}</dd></div>
          </dl>
        </section>

        <section aria-labelledby="about-principles-title" className="v4-about__principles portfolio-container">
          <header><p>Working principles</p><h2 id="about-principles-title">How I decide what is worth building.</h2></header>
          <ol>
            <li><span>01</span><strong>Make the boundary visible.</strong><p>Show what the system did, what remains uncertain, and where a person still decides.</p></li>
            <li><span>02</span><strong>Keep evidence close.</strong><p>Product behavior, architecture, tests, transactions, and outcomes should remain connected to their context.</p></li>
            <li><span>03</span><strong>Build with the team in frame.</strong><p>Leadership means making a shared build coherent while specialist contributions stay legible.</p></li>
          </ol>
        </section>

        <section aria-labelledby="about-map-title" className="v4-about__map portfolio-container">
          <div><p>Current map</p><h2 id="about-map-title">Questions I keep returning to.</h2></div>
          <ul>
            <li><span>AI agents</span><p>How should an agent translate language into bounded, reviewable action?</p><Link href={`${basePath}/work/nova-ai`} prefetch={false}>Nova AI Wallet <ArrowUpRight aria-hidden="true" size={15} /></Link></li>
            <li><span>Trust</span><p>What evidence should appear before autonomous software or a user commits?</p><Link href={`${basePath}/work/fradium`} prefetch={false}>Fradium <ArrowUpRight aria-hidden="true" size={15} /></Link></li>
            <li><span>Payments</span><p>How can machines pay for one useful response without a subscription ritual?</p><Link href={`${basePath}/work/paygate`} prefetch={false}>PayGate <ArrowUpRight aria-hidden="true" size={15} /></Link></li>
            <li><span>Coordination</span><p>How can shared value move through a system while every participant can inspect the record?</p><Link href={`${basePath}/work/quorum`} prefetch={false}>Quorum <ArrowUpRight aria-hidden="true" size={15} /></Link></li>
          </ul>
        </section>
      </main>
    </PortfolioShell>
  );
}
