"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  ExternalLink,
  Github,
  Mail,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CommandDeckScene } from "@/components/observatory/command-deck-scene";
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
    <div className={cn("deck-panel scanline overflow-hidden rounded-[10px] p-5 md:p-6", className)}>
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
        "group inline-flex h-12 items-center gap-2 rounded-[9px] px-4 text-sm font-medium transition duration-300",
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

function HeroTelemetry() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ["observe", "agent state"],
        ["verify", "risk signal"],
        ["execute", "bounded action"],
      ].map(([verb, noun]) => (
        <div
          key={verb}
          className="rounded-[9px] border border-white/10 bg-black/20 px-3 py-3 backdrop-blur-md"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--signal-mint)]">
            {verb}
          </p>
          <p className="mt-1 text-sm text-white/60">{noun}</p>
        </div>
      ))}
    </div>
  );
}

function MetricsRail() {
  return (
    <section className="relative z-10 px-4 pb-16 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-white/10 bg-white/10 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-[#060a08]/92 px-5 py-6">
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
      <div className="absolute inset-x-0 top-12 mx-auto h-64 max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(115,231,255,0.14),transparent_62%)] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Research vectors"
          title="Four command channels for autonomous systems"
          description="Each research vector is connected to shipped work: agents that use tools, wallets that explain risk, on-chain intelligence, and payment rails for autonomous software."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {researchVectors.map((vector, index) => (
            <motion.article
              key={vector.title}
              {...reveal}
              transition={{ ...reveal.transition, delay: index * 0.05 }}
              className="group relative min-h-[21rem] overflow-hidden rounded-[10px] border border-white/10 bg-[#07100d]/78 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-1 hover:border-white/24"
            >
              <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 [background:radial-gradient(circle_at_50%_0%,rgba(115,231,255,0.15),transparent_45%)]" />
              <div className="absolute right-4 top-4 font-mono text-[10px] text-white/25">
                0{index + 1}
              </div>
              <div className="relative">
                <div className="flex size-12 items-center justify-center rounded-[9px] border border-white/12 bg-white/[0.045]">
                  <vector.icon className="size-6 text-[color:var(--signal-cyan)]" />
                </div>
                <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">
                  {vector.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
                  {vector.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted-ink)]">
                  {vector.summary}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {vector.links.map((link) => (
                    <span
                      key={link}
                      className="rounded-[7px] border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] text-white/58"
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute inset-x-4 bottom-4 h-px bg-gradient-to-r from-transparent via-[color:var(--signal-cyan)]/50 to-transparent" />
            </motion.article>
          ))}
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
        "group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[9px] border px-3 py-3 text-left transition duration-300",
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
            <DeckPanel className="relative min-h-[34rem] p-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(115,231,255,0.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(158,255,201,0.1),transparent_36%)]" />
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
                  <div className="relative flex aspect-square items-center justify-center rounded-[10px] border border-white/10 bg-black/20">
                    <div className="absolute inset-8 rounded-full border border-[color:var(--signal-cyan)]/20" />
                    <div className="absolute inset-16 rounded-full border border-[color:var(--signal-mint)]/16" />
                    <div className="absolute h-px w-[82%] bg-gradient-to-r from-transparent via-[color:var(--signal-cyan)]/50 to-transparent" />
                    <div className="absolute h-[82%] w-px bg-gradient-to-b from-transparent via-[color:var(--signal-mint)]/35 to-transparent" />
                    <div className="relative grid size-40 place-items-center rounded-full border border-white/14 bg-[#07100d]/86 shadow-[0_0_80px_rgba(115,231,255,0.12)]">
                      <Sparkles className="size-10 text-[color:var(--signal-cyan)]" />
                      <div className="absolute -bottom-8 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                        {activeProject.signal}
                      </div>
                    </div>
                  </div>

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
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Proof ledger"
          title="External validation, shipped under pressure"
          description="Repeated proof across global hackathons, grant programs, and product-focused build sprints. The ledger makes the signal impossible to miss."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div {...reveal}>
            <DeckPanel className="sticky top-24">
              <ShieldCheck className="size-9 text-[color:var(--signal-mint)]" />
              <h3 className="mt-6 text-3xl font-semibold tracking-tight text-[color:var(--ink)]">
                Credibility pattern
              </h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted-ink)]">
                Lead the project, shape the architecture, build the fullstack product,
                integrate the AI or Web3 layer, deploy a usable demo, and explain it
                clearly enough for judges, mentors, or grant reviewers to trust the work.
              </p>
              <div className="mt-7 grid gap-3">
                {sourceNotes.map((note) => (
                  <div key={note.label} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--signal-cyan)]">
                      {note.label}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/52">{note.value}</p>
                  </div>
                ))}
              </div>
            </DeckPanel>
          </motion.div>
          <div className="relative">
            <div className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-transparent via-[color:var(--signal-cyan)]/35 to-transparent" />
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <motion.article
                  key={`${achievement.title}-${achievement.context}`}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.035 }}
                  className="relative ml-10 rounded-[10px] border border-white/10 bg-[#07100d]/78 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-white/24 hover:bg-white/[0.055]"
                >
                  <span className="absolute -left-[2.7rem] top-6 grid size-5 place-items-center rounded-full border border-[color:var(--signal-cyan)]/50 bg-[#050706]">
                    <span className="size-1.5 rounded-full bg-[color:var(--signal-cyan)]" />
                  </span>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-[color:var(--signal-mint)]">
                        {achievement.year}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                        {achievement.title}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--signal-cyan)]">
                        {achievement.context}
                      </p>
                    </div>
                    <span className="rounded-[7px] border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/44">
                      {achievement.type}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--muted-ink)]">
                    {achievement.description}
                  </p>
                </motion.article>
              ))}
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
        className="relative isolate min-h-[calc(100svh-84px)] overflow-hidden px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14"
      >
        <CommandDeckScene />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-150px)] max-w-7xl content-center gap-10 lg:grid-cols-[0.82fr_0.54fr]">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <div className="inline-flex items-center gap-2 rounded-[9px] border border-white/14 bg-black/24 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--signal-mint)] shadow-[0_0_40px_rgba(158,255,201,0.08)] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-[color:var(--signal-mint)] shadow-[0_0_18px_var(--signal-mint)]" />
              {profile.title}
            </div>
            <h1 className="mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[0.94] tracking-tight text-[color:var(--ink)] md:text-6xl xl:text-7xl">
              Building trustworthy AI agents for Web3 systems.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-[color:var(--muted-ink)] md:text-xl">
              I am <span className="text-[color:var(--ink)]">{profile.name}</span>, an AI
              Researcher & Web3 Builder designing autonomous software that can reason,
              transact, verify risk, and coordinate with evidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {proofChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[7px] border border-white/12 bg-black/24 px-3 py-1.5 text-xs text-white/76 backdrop-blur-md"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="#work">Explore work</LinkButton>
              <LinkButton href={`mailto:${profile.email}`} variant="ghost">
                Contact
              </LinkButton>
            </div>
          </motion.div>

          <motion.aside
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="self-end lg:self-center"
          >
            <DeckPanel className="hidden lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[color:var(--signal-cyan)]">
                System protocol
              </p>
              <div className="mt-5 space-y-4">
                <HeroTelemetry />
                <div className="rounded-[9px] border border-white/10 bg-white/[0.035] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">
                    active thesis
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Autonomous software becomes useful when it can act with verifiable
                    context, bounded authority, and transparent incentives.
                  </p>
                </div>
              </div>
            </DeckPanel>
          </motion.aside>
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
                  className="inline-flex h-12 items-center gap-2 rounded-[9px] border border-white/14 bg-white/[0.055] px-4 text-sm font-medium text-[color:var(--ink)] transition hover:border-white/28 hover:bg-white/[0.09]"
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
