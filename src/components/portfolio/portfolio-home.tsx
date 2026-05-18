"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  Github,
  Mail,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { AgentMap } from "@/components/observatory/agent-map";
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
  cyan: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
  mint: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
  violet: "border-violet-300/35 bg-violet-300/10 text-violet-100",
  amber: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  rose: "border-rose-300/35 bg-rose-300/10 text-rose-100",
  blue: "border-blue-300/35 bg-blue-300/10 text-blue-100",
};

const vectorClasses: Record<string, string> = {
  cyan: "from-cyan-300/18 to-cyan-300/0 border-cyan-300/30",
  mint: "from-emerald-300/18 to-emerald-300/0 border-emerald-300/30",
  violet: "from-violet-300/18 to-violet-300/0 border-violet-300/30",
  amber: "from-amber-300/18 to-amber-300/0 border-amber-300/30",
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 0.7, ease: "easeOut" },
} as const;

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div {...reveal} className="mx-auto max-w-3xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--signal-cyan)]">
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
        "inline-flex h-11 items-center gap-2 rounded-[8px] px-4 text-sm font-medium transition duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--signal-cyan)]",
        variant === "primary"
          ? "bg-[color:var(--ink)] text-[#050706] hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(158,255,201,0.18)]"
          : "border border-white/12 bg-white/[0.04] text-[color:var(--ink)] hover:border-white/25 hover:bg-white/[0.08]"
      )}
    >
      {children}
      <ArrowUpRight className="size-4" />
    </a>
  );
}

function ProjectDossier({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      {...reveal}
      transition={{ ...reveal.transition, delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06] md:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-[6px] border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]",
                accentClasses[project.accent]
              )}
            >
              {project.status}
            </span>
            <span className="font-mono text-xs text-white/40">{project.year}</span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--ink)]">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--signal-cyan)]">{project.focus}</p>
        </div>
        <div className="rounded-[8px] border border-white/10 bg-[#06100d] px-3 py-2 text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            Signal
          </p>
          <p className="mt-1 max-w-[12rem] text-xs text-white/75">{project.signal}</p>
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-white/80">{project.role}</p>
      {project.achievement ? (
        <p className="mt-2 inline-flex items-center gap-2 rounded-[6px] border border-[color:var(--signal-mint)]/30 bg-[color:var(--signal-mint)]/10 px-2.5 py-1 text-xs text-[color:var(--signal-mint)]">
          <BadgeCheck className="size-3.5" />
          {project.achievement}
        </p>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-[color:var(--muted-ink)]">
        {project.longDescription}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <span
            key={item}
            className="rounded-[6px] border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/65"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={project.links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-white/78 transition hover:text-white"
        >
          <Github className="size-4" />
          Repository
        </a>
        {project.links.live ? (
          <a
            href={project.links.live}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/78 transition hover:text-white"
          >
            <ExternalLink className="size-4" />
            Live
          </a>
        ) : null}
        {project.links.demo ? (
          <a
            href={project.links.demo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/78 transition hover:text-white"
          >
            <Radio className="size-4" />
            Demo
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}

export function PortfolioHome() {
  const reduceMotion = useReducedMotion();

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
      <div className="pointer-events-none fixed inset-0 z-[-3] bg-[color:var(--void)]" />
      <div className="pointer-events-none fixed inset-0 z-[-2] bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none fixed inset-0 z-[-1] opacity-80 [background:radial-gradient(540px_circle_at_var(--cursor-x)_var(--cursor-y),rgba(115,231,255,0.12),transparent_42%),linear-gradient(180deg,rgba(5,7,6,0)_0%,#050706_100%)]" />

      <section
        id="home"
        className="relative flex min-h-[calc(100svh-88px)] items-start px-4 py-10 md:px-8 md:py-12"
      >
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.04] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--signal-mint)]">
              <span className="size-1.5 rounded-full bg-[color:var(--signal-mint)] shadow-[0_0_18px_var(--signal-mint)]" />
              {profile.title}
            </div>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[0.96] tracking-tight text-[color:var(--ink)] md:text-6xl">
              Building trustworthy AI agents for Web3 systems.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[color:var(--muted-ink)]">
              I am <span className="text-[color:var(--ink)]">{profile.name}</span>, an AI
              Researcher & Web3 Builder designing autonomous software that can reason,
              transact, verify risk, and coordinate with evidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {proofChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[6px] border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs text-white/72"
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

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <AgentMap />
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 border-y border-white/10 md:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="border-white/10 px-4 py-6 odd:border-r md:border-r md:last:border-r-0"
            >
              <p className="text-4xl font-semibold tracking-tight text-[color:var(--ink)]">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted-ink)]">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="research" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Research vectors"
            title="Where the work is heading"
            description="The portfolio is organized around a thesis: autonomous software becomes useful when it can act with verifiable context, bounded authority, and transparent economic incentives."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {researchVectors.map((vector, index) => (
              <motion.article
                key={vector.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.05 }}
                className={cn(
                  "rounded-[8px] border bg-gradient-to-b p-5",
                  vectorClasses[vector.color]
                )}
              >
                <vector.icon className="size-6 text-[color:var(--ink)]" />
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
                  {vector.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                  {vector.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted-ink)]">
                  {vector.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {vector.links.map((link) => (
                    <span
                      key={link}
                      className="rounded-[6px] border border-white/10 px-2 py-1 text-[11px] text-white/58"
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Featured work"
            title="Project dossiers, not portfolio filler"
            description="Each build is positioned as evidence: a shipped product, awarded prototype, funded sprint, or research-grade experiment connected to AI agents and Web3 trust."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectDossier key={project.slug} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Proof ledger"
            title="External validation, shipped under pressure"
            description="The strongest signal is not a stack list. It is repeated execution across global hackathons, grant programs, and product-focused build sprints."
          />
          <div className="mt-14 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div
              {...reveal}
              className="rounded-[8px] border border-white/10 bg-white/[0.035] p-6"
            >
              <ShieldCheck className="size-8 text-[color:var(--signal-mint)]" />
              <h3 className="mt-5 text-2xl font-semibold text-[color:var(--ink)]">
                Credibility pattern
              </h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted-ink)]">
                The pattern across these wins is consistent: lead the project, shape the
                architecture, build the fullstack product, integrate the AI or Web3 layer,
                deploy a usable demo, and explain the product clearly enough for judges,
                mentors, or grant reviewers to trust the execution.
              </p>
              <div className="mt-6 grid gap-3">
                {sourceNotes.map((note) => (
                  <div key={note.label} className="border-l border-white/12 pl-4">
                    <p className="text-sm font-medium text-[color:var(--ink)]">
                      {note.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/50">{note.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="grid gap-3">
              {achievements.map((achievement, index) => (
                <motion.article
                  key={`${achievement.title}-${achievement.context}`}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.035 }}
                  className="grid gap-4 rounded-[8px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/25 hover:bg-white/[0.06] md:grid-cols-[6rem_1fr_auto]"
                >
                  <div>
                    <p className="font-mono text-xs text-[color:var(--signal-cyan)]">
                      {achievement.year}
                    </p>
                    <p className="mt-2 rounded-[6px] border border-white/10 px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/48 md:text-left">
                      {achievement.type}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[color:var(--ink)]">
                      {achievement.title}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--signal-mint)]">
                      {achievement.context}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted-ink)]">
                      {achievement.description}
                    </p>
                  </div>
                  <CalendarDays className="hidden size-5 text-white/22 md:block" />
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="system" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Builder system"
            title="The operating stack behind the work"
            description="The goal is not to look broad for the sake of it. The stack is organized around the actual loop: research, architecture, build, validate, deploy, and explain."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability, index) => (
              <motion.article
                key={capability.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.04 }}
                className="rounded-[8px] border border-white/10 bg-[#07100d]/80 p-5"
              >
                <capability.icon className="size-6 text-[color:var(--signal-cyan)]" />
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
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="log" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <motion.div {...reveal}>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--signal-cyan)]">
              Build log
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--ink)] md:text-5xl">
              Current momentum, curated.
            </h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--muted-ink)]">
              This section should eventually become a living log. For now it captures the
              highest-signal milestones without dumping raw GitHub activity onto the page.
            </p>
          </motion.div>
          <div className="space-y-3">
            {buildLog.map((item, index) => (
              <motion.article
                key={`${item.date}-${item.title}`}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.04 }}
                className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5"
              >
                <p className="font-mono text-xs text-[color:var(--signal-mint)]">
                  {item.date}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[color:var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted-ink)]">
                  {item.detail}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[8px] border border-white/10 bg-white/[0.035] p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
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
        </div>
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
                  className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.04] px-4 text-sm font-medium text-[color:var(--ink)] transition hover:border-white/25 hover:bg-white/[0.08]"
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
