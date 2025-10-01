"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";

type Project = {
    title: string;
    tagline: string;
    description: string;
    stack: string[];
    year: string;
    category: "Blockchain" | "Web" | "Mobile";
    links: { github?: string; live?: string };
};

const allProjects: Project[] = [
    {
        title: "Fradium",
        tagline: "Multi-chain wallet with real-time risk analysis",
        description: "Wallet lintas chain dengan analitik risiko on-the-fly untuk keamanan transaksi.",
        stack: ["Solidity", "Next.js", "Ethers", "AI"],
        year: "2024",
        category: "Blockchain",
        links: { github: "#", live: "#" },
    },
    {
        title: "NaraWallet",
        tagline: "Lightweight Web3 wallet",
        description: "Dompet Web3 ringan fokus pada UX cepat dan integrasi dApps.",
        stack: ["TypeScript", "Vite", "Ethers"],
        year: "2024",
        category: "Blockchain",
        links: { github: "#" },
    },
    {
        title: "AmanMemilih",
        tagline: "Civic platform (Web & Mobile)",
        description: "Platform partisipasi warga, tersedia di web dan mobile.",
        stack: ["Next.js", "Flutter", "Firebase"],
        year: "2023",
        category: "Web",
        links: { live: "#" },
    },
    {
        title: "HabituApp",
        tagline: "Habit Tracker",
        description: "Aplikasi pelacak kebiasaan dengan notifikasi dan statistik.",
        stack: ["Flutter", "Supabase"],
        year: "2023",
        category: "Mobile",
        links: { github: "#", live: "#" },
    },
    {
        title: "StudyMate",
        tagline: "Study Companion",
        description: "Pendamping belajar dengan reminder, catatan, dan rekomendasi.",
        stack: ["Next.js", "Prisma", "Postgres"],
        year: "2022",
        category: "Web",
        links: { github: "#" },
    },
];

const categories = ["All", "Blockchain", "Web", "Mobile"] as const;

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-20%" },
    transition: { duration: 0.6, delay },
});

function ProjectCard({ p, i }: { p: Project; i: number }) {
    return (
        <motion.div
            {...fadeUp(0.04 + i * 0.04)}
            className="group [perspective:1000px]"
        >
            <Card className="rounded-2xl border-border/60 shadow-sm transition duration-300 group-hover:shadow-lg group-hover:border-[color:var(--accent-secure)]/60 [transform-style:preserve-3d] group-hover:-translate-y-0.5">
                <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            {p.title}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.year}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{p.tagline}</p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80">{p.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {p.stack.map((s) => (
                            <Badge key={s} variant="secondary" className="bg-white/10 dark:bg-white/5">
                                {s}
                            </Badge>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-sm">
                        {p.links.github && (
                            <a href={p.links.github} className="inline-flex items-center gap-1 hover:underline" target="_blank" rel="noreferrer">
                                <Github className="size-4" /> GitHub
                            </a>
                        )}
                        {p.links.live && (
                            <a href={p.links.live} className="inline-flex items-center gap-1 hover:underline" target="_blank" rel="noreferrer">
                                <ExternalLink className="size-4" /> Live
                            </a>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function Projects() {
    return (
        <section id="projects" className="section">
            <div className="container mx-auto px-4">
                <motion.h2 className="text-3xl md:text-4xl font-semibold tracking-tight" {...fadeUp(0)}>
                    Projects
                </motion.h2>

                <div className="mt-4">
                    <Tabs defaultValue="All">
                        <TabsList className="glass">
                            {categories.map((c) => (
                                <TabsTrigger key={c} value={c} className="data-[state=active]:brand-gradient data-[state=active]:text-white">
                                    {c}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {categories.map((c) => {
                            const filtered = c === "All" ? allProjects : allProjects.filter((p) => p.category === c);
                            return (
                                <TabsContent key={c} value={c} className="mt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filtered.map((p, i) => (
                                            <ProjectCard key={p.title} p={p} i={i} />
                                        ))}
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </div>
            </div>
        </section>
    );
}



