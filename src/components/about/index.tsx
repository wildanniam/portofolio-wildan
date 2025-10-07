"use client";

import { motion } from "framer-motion";
import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { GlobalSpotlight, ParticleCard, MagicBentoStyles } from "@/components/MagicBento";
import { Layers3, Smartphone, Workflow, BookCheck, Layout, Server, Blocks, Users } from "lucide-react";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
});

// Skills content (dipindah dari Skills section)
const skills = [
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

export function About() {
    const gridRef = React.useRef<HTMLDivElement | null>(null);
    return (
        <section id="about" className="section relative overflow-hidden min-h-[100svh] flex items-center snap-start">
            {/* Background image from bottom to top with fade */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0">
                    <Image
                        src="/background-2.webp"
                        alt=""
                        fill
                        priority={false}
                        className="object-cover object-bottom opacity-35"
                    />
                </div>
                {/* Top fade so it blends with page background */}
                <div className="absolute inset-x-0 top-0 h-32"
                    style={{
                        backgroundImage: "linear-gradient(to top, transparent, var(--background))",
                    }}
                />
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                    {/* Left: narrative + quick facts */}
                    <div className="md:col-span-7">
                        <motion.h2 className="text-4xl md:text-5xl font-semibold tracking-tight gradient-text" {...fadeUp(0)}>
                            About
                        </motion.h2>
                        <motion.div className="mt-5 space-y-4 text-base md:text-lg leading-relaxed text-foreground/85" {...fadeUp(0.06)}>
                            <p>
                                My name is <span className="font-medium">Wildan Syukri Niam</span>, a Software Engineering student passionate about <span className="font-medium">Fullstack Development, QA Automation, and DevOps</span>. I enjoy transforming ideas into secure, scalable, and user‑centric applications—ranging from smooth mobile experiences to reliable backend systems.
                            </p>
                            <p>
                                Beyond coding, I thrive in hackathons and collaborative research, where I’ve led and mentored teams to deliver impactful solutions. As the <span className="font-medium">Head of MotionLab</span> and <span className="font-medium">VP of DTC Laboratory</span>, I’ve guided peers in building production‑ready apps while cultivating strong teamwork and leadership.
                            </p>
                            <p>
                                Currently, I’m exploring the intersection of <span className="font-medium">Web3 and system reliability</span>—bridging my background in automation and fullstack development with early experiments in smart contracts and decentralized apps. I aim to build technology that balances <span className="font-medium">innovation, performance, and trust</span>.
                            </p>
                        </motion.div>

                        {/* Quick Facts */}
                        <motion.div className="mt-6 flex flex-wrap gap-3" {...fadeUp(0.2)}>
                            <span className="glass px-3 py-1 rounded-full text-xs md:text-sm border border-border/60">🎓 Telkom University — GPA 3.60</span>
                            <span className="px-3 py-1 rounded-full text-xs md:text-sm bg-[color:var(--accent-secure)] text-black border border-transparent accent-pulse">🏆 5x Hackathon Winner</span>
                            <span className="glass px-3 py-1 rounded-full text-xs md:text-sm border border-border/60">👨‍💻 Head of MotionLab, VP DTC Laboratory</span>
                            <span className="glass px-3 py-1 rounded-full text-xs md:text-sm border border-border/60">🔧 QA Automation Engineer Intern @ Infomedia</span>
                        </motion.div>
                    </div>

                    {/* Right: Cards with React Bits effects (spotlight + particles), layout tetap */}
                    <div className="md:col-span-5">
                        <motion.div {...fadeUp(0.1)}>
                            <MagicBentoStyles />
                            {/* Global spotlight mengikuti area grid */}
                            <div className="relative bento-section" ref={gridRef}>
                                <GlobalSpotlight gridRef={gridRef} enabled />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {skills.map((s) => (
                                        <ParticleCard key={s.title} className="card card--border-glow group rounded-2xl border border-border/60 overflow-hidden">
                                            <div className={`rounded-2xl p-4 bg-gradient-to-br ${s.gradient} glass`}>
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
                                                <p className="mt-3 text-sm text-foreground/80 line-clamp-2">
                                                    {s.description}
                                                </p>
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
                </div>
            </div>
        </section>
    );
}


