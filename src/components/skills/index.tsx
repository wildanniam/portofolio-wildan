"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ParticleCard, GlobalSpotlight, MagicBentoStyles } from "@/components/MagicBento";
import { Layers3, Smartphone, Workflow, BookCheck, Layout, Server, Blocks, Users } from "lucide-react";

type SkillItem = {
    title: string;
    status: "Active" | "Exploring";
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    tags: string[];
    gradient: string;
};

const skills: SkillItem[] = [
    {
        title: "Fullstack Development",
        status: "Active",
        icon: Layers3,
        description: "Building scalable frontends and backends with focus on clean architecture and usability.",
        tags: ["Next.js", "React", "Laravel", "Flask", "MySQL", "Firebase"],
        gradient: "from-purple-400/15 to-blue-400/15",
    },
    {
        title: "Mobile Development",
        status: "Active",
        icon: Smartphone,
        description: "Cross-platform apps with smooth UI/UX and responsive features.",
        tags: ["Flutter", "Firebase"],
        gradient: "from-emerald-400/15 to-teal-400/15",
    },
    {
        title: "DevOps & TestOps",
        status: "Active",
        icon: Workflow,
        description: "Automating pipelines, CI/CD integration, and self-healing testing systems.",
        tags: ["Jenkins", "GitHub Actions", "Docker", "Linux Server"],
        gradient: "from-cyan-400/15 to-sky-400/15",
    },
    {
        title: "QA Automation & Technical Writing",
        status: "Active",
        icon: BookCheck,
        description: "Ensuring software reliability through test automation and clear documentation.",
        tags: ["Katalon Studio", "API Testing", "Regression Testing"],
        gradient: "from-rose-400/15 to-fuchsia-400/15",
    },
    {
        title: "Frontend Engineering",
        status: "Active",
        icon: Layout,
        description: "Responsive interfaces with modern UI frameworks and reusable components.",
        tags: ["React.js", "Next.js", "Tailwind CSS"],
        gradient: "from-indigo-400/15 to-violet-400/15",
    },
    {
        title: "Backend Systems",
        status: "Active",
        icon: Server,
        description: "Building and maintaining secure and reliable backend services.",
        tags: ["Laravel", "Flask", "MySQL"],
        gradient: "from-amber-400/15 to-orange-400/15",
    },
    {
        title: "Blockchain & Web3",
        status: "Exploring",
        icon: Blocks,
        description: "Early exploration into smart contracts and wallet development through hackathon projects.",
        tags: ["ICP", "Hardhat", "EVM"],
        gradient: "from-blue-400/15 to-purple-400/15",
    },
    {
        title: "Leadership & Mentorship",
        status: "Active",
        icon: Users,
        description: "Leading labs, mentoring teams, and driving innovation through hackathons.",
        tags: ["MotionLab", "DTC", "Hackathon"],
        gradient: "from-lime-400/15 to-emerald-400/15",
    },
];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
});

export function Skills() {
    const gridRef = React.useRef<HTMLDivElement | null>(null);
    return (
        <section id="skills" className="section">
            <div className="container mx-auto px-4">
                <motion.h2 className="text-3xl md:text-4xl font-semibold tracking-tight" {...fadeUp(0)}>
                    Skills & Expertise
                </motion.h2>

                <motion.div className="mt-6" {...fadeUp(0.05)}>
                    <MagicBentoStyles />
                    <div className="relative bento-section" ref={gridRef}>
                        <GlobalSpotlight gridRef={gridRef} enabled />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {skills.map((s) => (
                                <ParticleCard key={s.title} className="card card--border-glow rounded-2xl border border-border/60 overflow-hidden">
                                    <div className={`rounded-2xl p-5 bg-gradient-to-br ${s.gradient} glass transition-transform duration-300 ease-out group hover:translate-y-[-2px]`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center justify-center rounded-lg bg-background/70 border border-border/60 size-9">
                                                    <s.icon className="size-4 text-foreground/80" />
                                                </span>
                                                <div className="font-medium">{s.title}</div>
                                            </div>
                                            {s.status === "Active" ? (
                                                <Badge className="bg-[color:var(--accent-secure)] text-black">Active</Badge>
                                            ) : (
                                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Exploring</Badge>
                                            )}
                                        </div>
                                        <p className="mt-3 text-sm text-foreground/80 line-clamp-2">{s.description}</p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {s.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 text-xs rounded-full border border-border/60 bg-background/60">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </ParticleCard>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
