"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Braces,
  CircleDollarSign,
  Cpu,
  ExternalLink,
  FileCheck2,
  Github,
  Mail,
  Network,
  Orbit,
  Radio,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HeroSceneLoader } from "@/components/observatory/hero-scene-loader";
import {
  achievements,
  buildLog,
  capabilities,
  metrics,
  profile,
  projects,
  proofChips,
  researchVectors,
  socials,
  sourceNotes,
  type Project,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

const accentClasses: Record<Project["accent"], string> = {
  cyan: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100 shadow-[0_0_22px_rgba(115,231,255,0.08)]",
  mint: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100 shadow-[0_0_22px_rgba(158,255,201,0.08)]",
  violet: "border-violet-300/40 bg-violet-300/10 text-violet-100 shadow-[0_0_22px_rgba(155,140,255,0.08)]",
  amber: "border-amber-300/40 bg-amber-300/10 text-amber-100 shadow-[0_0_22px_rgba(255,209,102,0.08)]",
  rose: "border-rose-300/40 bg-rose-300/10 text-rose-100 shadow-[0_0_22px_rgba(255,122,89,0.08)]",
  blue: "border-blue-300/40 bg-blue-300/10 text-blue-100 shadow-[0_0_22px_rgba(143,184,255,0.08)]",
};

const accentValues: Record<Project["accent"], string> = {
  cyan: "#73e7ff",
  mint: "#9effc9",
  violet: "#9b8cff",
  amber: "#ffd166",
  rose: "#ff7a59",
  blue: "#8fb8ff",
};

const projectGlyphs: Record<string, LucideIcon> = {
  fradium: ShieldCheck,
  agentpay: CircleDollarSign,
  "nova-ai-wallet": WalletCards,
  specheal: FileCheck2,
  crucible: Network,
  "paygate-stellar": Braces,
};

const projectMotifs: Record<string, string[]> = {
  fradium: ["Address intelligence", "Threat verdict", "Community signal"],
  agentpay: ["402 registry", "Stellar settlement", "Agent-readable APIs"],
  "nova-ai-wallet": ["Intent parser", "Wallet tools", "User-controlled signing"],
  specheal: ["Failure evidence", "AI verdict", "Safe patch loop"],
  crucible: ["Stake", "Verify", "Slash / reward"],
  "paygate-stellar": ["Middleware", "USDC rails", "Builder dashboard"],
};

const proofHighlights = [
  { value: "$5K", label: "SCF Instaward", tone: "amber" },
  { value: "1st", label: "Global AI / Web3 wins", tone: "cyan" },
  { value: "2nd", label: "Refactory Hackathon", tone: "rose" },
  { value: "Lead", label: "Product + architecture owner", tone: "mint" },
] as const;

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 0.78, ease: "easeOut" },
} as const;

function DeckPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("deck-panel scanline overflow-hidden rounded-[8px] p-5 md:p-6", className)}>
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      {...reveal}
      className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}
    >
      <p className="font-mono text-xs uppercase tracking-[0.32em] text-[color:var(--signal-cyan)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-base leading-7 text-[color:var(--muted-ink)] md:text-lg">
        {description}
      </p>
    </motion.div>
  );
}

function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={cn(
        "group inline-flex h-12 items-center gap-2 rounded-[8px] px-4 text-sm font-medium transition duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--signal-cyan)]",
        variant === "primary"
          ? "bg-[color:var(--ink)] text-[#050706] hover:-translate-y-0.5 hover:shadow-[0_18px_70px_rgba(158,255,201,0.26)]"
          : "border border-white/14 bg-white/[0.055] text-[color:var(--ink)] hover:border-white/28 hover:bg-white/[0.09]"
      )}
    >
      {children}
      <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function MetricsRail() {
  return (
    <section className="relative z-10 px-4 pb-16 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-white/10 bg-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.28)] md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="group relative bg-[#060a08]/92 px-5 py-6">
            <span className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-[color:var(--signal-cyan)]/55 transition duration-500 group-hover:scale-x-100" />
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">
              telemetry
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-[color:var(--ink)]">
              {metric.value}
            </p>
            <p className="mt-2 text-sm leading-5 text-[color:var(--muted-ink)]">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResearchDeck() {
  return (
    <section id="research" className="relative px-4 py-20 md:px-8 md:py-28">
      <div className="absolute inset-x-0 top-12 mx-auto h-72 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(115,231,255,0.16),transparent_62%)] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Research vectors"
          title="Four command channels for autonomous systems"
          description="Each research vector is connected to shipped work: agents that use tools, wallets that explain risk, on-chain intelligence, and payment rails for autonomous software."
        />
        <div className="mt-16 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div {...reveal} className="relative min-h-[35rem] overflow-hidden rounded-[8px] border border-white/10 bg-[#06100d]/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_140px_rgba(0,0,0,0.28)]">
            <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_45%,rgba(115,231,255,0.18),transparent_34%),radial-gradient(circle_at_62%_58%,rgba(158,255,201,0.1),transparent_28%)]" />
            <div className="absolute inset-8 rounded-full border border-[color:var(--signal-cyan)]/14" />
            <div className="absolute inset-20 rounded-full border border-[color:var(--signal-mint)]/12" />
            <div className="absolute left-1/2 top-14 h-[78%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--signal-cyan)]/24 to-transparent" />
            <div className="absolute left-14 top-1/2 h-px w-[78%] -translate-y-1/2 bg-gradient-to-r from-transparent via-[color:var(--signal-mint)]/22 to-transparent" />
            <div className="relative flex h-full min-h-[31rem] items-center justify-center">
              <div className="relative grid size-52 place-items-center rounded-full border border-white/12 bg-black/24 shadow-[0_0_120px_rgba(115,231,255,0.16)]">
                <div className="absolute inset-5 rounded-full border border-[color:var(--signal-cyan)]/25" />
                <Cpu className="size-14 text-[color:var(--signal-cyan)]" />
                <span className="absolute -bottom-8 font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
                  research kernel
                </span>
              </div>
              {researchVectors.map((vector, index) => {
                const tone = accentValues[vector.color as Project["accent"]];
                const placements = [
                  "left-[10%] top-[12%]",
                  "right-[8%] top-[22%]",
                  "left-[13%] bottom-[18%]",
                  "right-[10%] bottom-[13%]",
                ];
                return (
                  <div
                    key={vector.title}
                    className={cn("absolute w-36 rounded-[8px] border bg-black/22 p-3 backdrop-blur-sm", placements[index])}
                    style={{ borderColor: `${tone}55`, boxShadow: `0 0 40px ${tone}16` }}
                  >
                    <vector.icon className="size-5" style={{ color: tone }} />
                    <p className="mt-3 text-sm font-medium text-[color:var(--ink)]">{vector.title}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/36">
                      channel 0{index + 1}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {researchVectors.map((vector, index) => {
              const tone = accentValues[vector.color as Project["accent"]];
              return (
                <motion.article
                  key={vector.title}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.05 }}
                  className="group relative min-h-[17rem] overflow-hidden rounded-[8px] border border-white/10 bg-[#07100d]/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-500 hover:-translate-y-1"
                  style={{ "--vector-tone": tone, "--vector-glow": `${tone}33` } as React.CSSProperties}
                >
                  <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 [background:radial-gradient(circle_at_32%_0%,var(--vector-glow),transparent_46%)]" />
                  <div className="absolute -right-10 -top-12 size-36 rounded-full border border-[color:var(--vector-tone)]/20" />
                  <div className="absolute right-4 top-4 font-mono text-[10px] text-white/25">0{index + 1}</div>
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-[8px] border border-[color:var(--vector-tone)]/35 bg-[color:var(--vector-tone)]/10">
                        <vector.icon className="size-6 text-[color:var(--vector-tone)]" />
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                        {vector.eyebrow}
                      </p>
                    </div>
                    <h3 className="mt-8 text-2xl font-semibold text-[color:var(--ink)]">
                      {vector.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[color:var(--muted-ink)]">
                      {vector.summary}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {vector.links.map((link) => (
                        <span
                          key={link}
                          className="rounded-[8px] border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] text-white/58"
                        >
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-x-5 bottom-4 h-px bg-gradient-to-r from-transparent via-[color:var(--vector-tone)]/60 to-transparent" />
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectNodeButton({
  project,
  active,
  onSelect,
}: {
  project: Project;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onSelect}
      className={cn(
        "group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[8px] border px-3 py-3 text-left transition duration-300",
        active
          ? "border-[color:var(--signal-cyan)]/45 bg-[color:var(--signal-cyan)]/10 shadow-[0_0_38px_rgba(115,231,255,0.09)]"
          : "border-white/10 bg-white/[0.035] hover:border-white/22 hover:bg-white/[0.055]"
      )}
    >
      <span className={cn("size-2.5 rounded-full", active ? "bg-[color:var(--signal-cyan)]" : "bg-white/25")} />
      <span>
        <span className="block text-sm font-medium text-[color:var(--ink)]">{project.title}</span>
        <span className="mt-1 block text-xs text-white/42">{project.focus}</span>
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/38">
        {project.year}
      </span>
    </button>
  );
}

function ProjectDossierVisual({ project }: { project: Project }) {
  const tone = accentValues[project.accent];
  const Glyph = projectGlyphs[project.slug] ?? Orbit;
  const motifs = projectMotifs[project.slug] ?? [project.signal, project.focus, project.year];

  return (
    <div
      className="relative overflow-hidden rounded-[8px] border border-white/10 bg-black/24 p-5"
      style={{ "--project-tone": tone, "--project-glow": `${tone}33` } as React.CSSProperties}
    >
      <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_35%,var(--project-glow),transparent_42%)]" />
      <div className="absolute inset-6 rounded-full border border-[color:var(--project-tone)]/18" />
      <div className="absolute inset-14 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-[color:var(--project-tone)]/30 to-transparent" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--project-tone)]/30 to-transparent" />

      <div className="relative grid aspect-square place-items-center">
        <motion.div
          key={`${project.slug}-halo`}
          initial={{ opacity: 0, scale: 0.86, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="absolute size-[72%] rounded-full border border-[color:var(--project-tone)]/24"
        />
        <motion.div
          key={`${project.slug}-core`}
          initial={{ opacity: 0, y: 18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="relative grid size-40 place-items-center rounded-full border border-white/14 bg-[#07100d]/88"
          style={{ boxShadow: `0 0 90px ${tone}2e` }}
        >
          <Glyph className="size-11 text-[color:var(--project-tone)]" />
          <div className="absolute -bottom-10 w-56 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">
            {project.signal}
          </div>
        </motion.div>
      </div>

      <div className="relative mt-8 grid gap-2">
        {motifs.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.36, delay: index * 0.04 }}
            className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.035] px-3 py-2"
          >
            <span className="text-sm text-white/70">{item}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
              signal
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MissionControl() {
  const [activeSlug, setActiveSlug] = React.useState(projects[0]?.slug ?? "");
  const activeProject = projects.find((project) => project.slug === activeSlug) ?? projects[0];

  return (
    <section id="work" className="relative px-4 py-20 md:px-8 md:py-28">
      <div className="absolute left-0 top-32 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(158,255,201,0.1),transparent_62%)] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Featured work"
          title="Mission dossiers, not portfolio filler"
          description="The work section behaves like a command console: pick a build, inspect the mission, follow the proof, and jump straight into the repository or live system."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <motion.div {...reveal} className="space-y-3">
            {projects.map((project) => (
              <ProjectNodeButton
                key={project.slug}
                project={project}
                active={project.slug === activeProject.slug}
                onSelect={() => setActiveSlug(project.slug)}
              />
            ))}
          </motion.div>

          <motion.div {...reveal}>
            <DeckPanel className="relative min-h-[34rem] rounded-[8px] p-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(115,231,255,0.15),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(158,255,201,0.1),transparent_36%)]" />
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-[color:var(--signal-cyan)]/34 to-transparent" />
              <div className="relative grid min-h-[34rem] gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-[7px] border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em]",
                          accentClasses[activeProject.accent]
                        )}
                      >
                        {activeProject.status}
                      </span>
                      <span className="font-mono text-xs text-white/40">{activeProject.year}</span>
                    </div>
                    <h3 className="mt-5 text-4xl font-semibold tracking-tight text-[color:var(--ink)] md:text-6xl">
                      {activeProject.title}
                    </h3>
                    <p className="mt-3 text-lg text-[color:var(--signal-cyan)]">
                      {activeProject.focus}
                    </p>
                    <p className="mt-6 text-sm font-medium text-white/82">
                      {activeProject.role}
                    </p>
                    {activeProject.achievement ? (
                      <p className="mt-3 inline-flex items-center gap-2 rounded-[7px] border border-[color:var(--signal-mint)]/30 bg-[color:var(--signal-mint)]/10 px-3 py-1.5 text-xs text-[color:var(--signal-mint)]">
                        <BadgeCheck className="size-3.5" />
                        {activeProject.achievement}
                      </p>
                    ) : null}
                    <p className="mt-6 max-w-2xl text-sm leading-7 text-[color:var(--muted-ink)] md:text-base">
                      {activeProject.longDescription}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={activeProject.links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white/78 transition hover:border-white/25 hover:text-white"
                    >
                      <Github className="size-4" />
                      Repository
                    </a>
                    {activeProject.links.live ? (
                      <a
                        href={activeProject.links.live}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white/78 transition hover:border-white/25 hover:text-white"
                      >
                        <ExternalLink className="size-4" />
                        Live
                      </a>
                    ) : null}
                    {activeProject.links.demo ? (
                      <a
                        href={activeProject.links.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white/78 transition hover:border-white/25 hover:text-white"
                      >
                        <Radio className="size-4" />
                        Demo
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="border-t border-white/10 p-6 lg:border-l lg:border-t-0 md:p-8">
                  <ProjectDossierVisual project={activeProject} />
                  <div className="mt-6 grid gap-2">
                    {activeProject.stack.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.035] px-3 py-2"
                      >
                        <span className="text-sm text-white/70">{item}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
                          stack
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DeckPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProofLedger() {
  return (
    <section id="proof" className="relative px-4 py-20 md:px-8 md:py-28">
      <div className="absolute inset-x-0 top-20 mx-auto h-96 max-w-6xl rounded-full bg-[radial-gradient(circle,rgba(255,209,102,0.1),transparent_64%)] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Proof ledger"
          title="External validation, shipped under pressure"
          description="Repeated proof across global hackathons, grant programs, and product-focused build sprints. The ledger makes the signal impossible to miss."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {proofHighlights.map((item, index) => {
            const tone = accentValues[item.tone as Project["accent"]];
            return (
              <motion.div
                key={item.label}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.04 }}
                className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[#07100d]/70 p-5"
                style={{ "--proof-tone": tone } as React.CSSProperties}
              >
                <div className="absolute -right-12 -top-12 size-32 rounded-full bg-[color:var(--proof-tone)]/10 blur-2xl" />
                <p className="text-5xl font-semibold tracking-tight text-[color:var(--ink)]">{item.value}</p>
                <p className="mt-3 text-sm leading-5 text-[color:var(--muted-ink)]">{item.label}</p>
                <div className="mt-6 h-px bg-gradient-to-r from-[color:var(--proof-tone)]/70 to-transparent" />
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div {...reveal}>
            <DeckPanel className="sticky top-24 rounded-[8px]">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-[8px] border border-[color:var(--signal-mint)]/30 bg-[color:var(--signal-mint)]/10">
                  <ShieldCheck className="size-6 text-[color:var(--signal-mint)]" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">
                    credibility pattern
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--ink)]">
                    Lead, architect, ship, defend.
                  </h3>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-[color:var(--muted-ink)]">
                Lead the project, shape the architecture, build the fullstack product,
                integrate the AI or Web3 layer, deploy a usable demo, and explain it
                clearly enough for judges, mentors, or grant reviewers to trust the work.
              </p>
              <div className="mt-7 grid gap-3">
                {sourceNotes.map((note) => (
                  <div key={note.label} className="group rounded-[8px] border border-white/10 bg-white/[0.035] p-3 transition hover:border-[color:var(--signal-cyan)]/35">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--signal-cyan)]">
                      {note.label}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/52">{note.value}</p>
                  </div>
                ))}
              </div>
            </DeckPanel>
          </motion.div>
          <div className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[#06100d]/60 p-4 md:p-6">
            <div className="absolute inset-y-8 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-[color:var(--signal-cyan)]/34 to-transparent md:block" />
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((achievement, index) => {
                const tones = ["amber", "rose", "violet", "mint", "cyan", "blue", "amber"] as const;
                const tone = accentValues[tones[index % tones.length]];
                const featured = index < 3;
                return (
                  <motion.article
                    key={`${achievement.title}-${achievement.context}`}
                    {...reveal}
                    transition={{ ...reveal.transition, delay: index * 0.035 }}
                    className={cn(
                      "group relative overflow-hidden rounded-[8px] border border-white/10 bg-black/18 p-5 transition duration-500 hover:-translate-y-1 hover:border-white/24",
                      featured ? "md:min-h-56" : "md:min-h-48"
                    )}
                    style={{ "--proof-card": tone } as React.CSSProperties}
                  >
                    <div className="absolute -right-14 -top-14 size-36 rounded-full bg-[color:var(--proof-card)]/10 blur-2xl transition group-hover:bg-[color:var(--proof-card)]/16" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs text-[color:var(--proof-card)]">
                          {achievement.year}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                          {achievement.title}
                        </h3>
                      </div>
                      <span className="rounded-[8px] border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">
                        {achievement.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[color:var(--signal-cyan)]">
                      {achievement.context}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[color:var(--muted-ink)]">
                      {achievement.description}
                    </p>
                    <div className="absolute inset-x-5 bottom-4 h-px bg-gradient-to-r from-transparent via-[color:var(--proof-card)]/55 to-transparent" />
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PortfolioHome() {
  React.useEffect(() => {
    const root = document.documentElement;
    const handlePointerMove = (event: PointerEvent) => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-[-4] bg-[color:var(--void)]" />
      <div className="pointer-events-none fixed inset-0 z-[-3] opacity-70 [background:radial-gradient(640px_circle_at_var(--cursor-x)_var(--cursor-y),rgba(115,231,255,0.14),transparent_44%)]" />
      <div className="pointer-events-none fixed inset-0 z-[-2] bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:96px_96px]" />
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-[linear-gradient(180deg,rgba(5,7,6,0)_0%,#050706_72%)]" />

      <section
        id="home"
        className="relative isolate min-h-[calc(100svh-84px)] overflow-hidden px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14 [@media_(max-height:760px)]:pb-8 [@media_(max-height:760px)]:pt-8"
      >
        <HeroSceneLoader />
        <div className="pointer-events-none relative z-10 mx-auto grid min-h-[calc(100svh-150px)] max-w-7xl content-center gap-10 lg:grid-cols-[0.78fr_0.72fr]">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="pointer-events-auto max-w-5xl"
          >
            <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/14 bg-black/24 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--signal-mint)] shadow-[0_0_40px_rgba(158,255,201,0.08)] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-[color:var(--signal-mint)] shadow-[0_0_18px_var(--signal-mint)]" />
              {profile.title}
            </div>
            <h1 className="mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[0.94] tracking-tight text-[color:var(--ink)] md:text-6xl xl:text-7xl [@media_(max-height:760px)]:mt-5 [@media_(max-height:760px)]:text-6xl">
              Building trustworthy AI agents for Web3 systems.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-[color:var(--muted-ink)] md:text-xl [@media_(max-height:760px)]:mt-5 [@media_(max-height:760px)]:text-lg [@media_(max-height:760px)]:leading-7">
              I am <span className="text-[color:var(--ink)]">{profile.name}</span>, an AI
              Researcher & Web3 Builder designing autonomous software that can reason,
              transact, verify risk, and coordinate with evidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-2 [@media_(max-height:760px)]:mt-5">
              {proofChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[7px] border border-white/12 bg-black/24 px-3 py-1.5 text-xs text-white/76 backdrop-blur-md"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3 [@media_(max-height:760px)]:mt-5">
              <LinkButton href="#work">Explore work</LinkButton>
              <LinkButton href={`mailto:${profile.email}`} variant="ghost">
                Contact
              </LinkButton>
            </div>
          </motion.div>

          <div aria-hidden="true" className="pointer-events-none hidden min-h-[34rem] lg:block" />
        </div>
      </section>

      <MetricsRail />
      <ResearchDeck />
      <MissionControl />
      <ProofLedger />

      <section id="system" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Builder system"
            title="The operating stack behind the work"
            description="The stack is organized around the real loop: research, architecture, build, validate, deploy, and explain."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability, index) => (
              <motion.article
                key={capability.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.04 }}
              >
                <DeckPanel className="h-full">
                  <capability.icon className="size-7 text-[color:var(--signal-cyan)]" />
                  <h3 className="mt-5 text-lg font-semibold text-[color:var(--ink)]">
                    {capability.title}
                  </h3>
                  <div className="mt-4 space-y-2">
                    {capability.items.map((item) => (
                      <p key={item} className="text-sm text-[color:var(--muted-ink)]">
                        {item}
                      </p>
                    ))}
                  </div>
                </DeckPanel>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="log" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionHeader
            align="left"
            eyebrow="Build log"
            title="Current momentum, curated."
            description="A living log can grow later. For now this captures the highest-signal milestones without dumping noisy raw activity."
          />
          <div className="space-y-3">
            {buildLog.map((item, index) => (
              <motion.article
                key={`${item.date}-${item.title}`}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.04 }}
              >
                <DeckPanel>
                  <p className="font-mono text-xs text-[color:var(--signal-mint)]">
                    {item.date}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted-ink)]">
                    {item.detail}
                  </p>
                </DeckPanel>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-20 md:px-8 md:py-28">
        <DeckPanel className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <motion.div {...reveal}>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--signal-cyan)]">
              About
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-5xl">
              Lead the idea, build the system, ship the proof.
            </h2>
          </motion.div>
          <motion.div {...reveal} className="space-y-5 text-base leading-8 text-[color:var(--muted-ink)]">
            <p>
              I am a Software Engineering student at Telkom University focused on the
              intersection of AI agents, Web3 trust, and on-chain intelligence. Across
              competitions and research builds, I usually operate close to the core:
              shaping the product direction, designing the architecture, implementing the
              fullstack system, integrating AI/Web3 components, testing the flow, and
              deploying a working demo.
            </p>
            <p>
              My current north star is trustworthy autonomous software: agents that do
              not only generate text, but observe state, use tools, reason over risk,
              coordinate with other systems, and act with evidence.
            </p>
            <p className="text-[color:var(--ink)]">{profile.availability}</p>
          </motion.div>
        </DeckPanel>
      </section>

      <section id="contact" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...reveal}>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--signal-cyan)]">
              Contact
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-[color:var(--ink)] md:text-6xl">
              Let&apos;s build the next proof.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted-ink)]">
              Reach out for AI/Web3 collaboration, research-driven prototypes, hackathon
              teams, product engineering roles, or ambitious autonomous systems work.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href={`mailto:${profile.email}`}>
                <Mail className="size-4" />
                {profile.email}
              </LinkButton>
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex h-12 items-center gap-2 rounded-[8px] border border-white/14 bg-white/[0.055] px-4 text-sm font-medium text-[color:var(--ink)] transition hover:border-white/28 hover:bg-white/[0.09]"
                >
                  <social.icon className="size-4" />
                  {social.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
