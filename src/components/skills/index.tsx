"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Blocks, Workflow, Hammer, Brain, UsersRound } from "lucide-react";

type SkillCard = {
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string; // tailwind color token for badge
    label: string;
    description: string;
};

const items: SkillCard[] = [
    {
        category: "Blockchain",
        icon: Blocks,
        color: "bg-blue-500/15 text-blue-400",
        label: "Smart Contract",
        description: "Solidity, ICP, Hardhat, Fetch AI",
    },
    {
        category: "Web Dev",
        icon: Hammer,
        color: "bg-purple-500/15 text-purple-400",
        label: "Fullstack",
        description: "React, Next.js, Flutter, Firebase, Flask API",
    },
    {
        category: "DevOps",
        icon: Workflow,
        color: "bg-emerald-500/15 text-emerald-400",
        label: "Pipelines",
        description: "CI/CD, Jenkins, GitHub Actions",
    },
    {
        category: "AI/Automation",
        icon: Brain,
        color: "bg-cyan-500/15 text-cyan-400",
        label: "Quality",
        description: "TestOps, Self-Healing Automation",
    },
    {
        category: "Soft Skills",
        icon: UsersRound,
        color: "bg-amber-500/15 text-amber-400",
        label: "Leadership",
        description: "MotionLab Koordas, VP DTC, Mentorship",
    },
];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-20%" },
    transition: { duration: 0.6, delay },
});

export function Skills() {
    return (
        <section id="skills" className="section">
            <div className="container mx-auto px-4">
                <motion.h2 className="text-3xl md:text-4xl font-semibold tracking-tight" {...fadeUp(0)}>
                    Skills & Expertise
                </motion.h2>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {items.map((item, i) => (
                        <motion.div key={item.label} {...fadeUp(0.06 + i * 0.04)}>
                            <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-xl p-2 brand-gradient text-white/90">
                                            <item.icon className="size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${item.color}`}>
                                                    {item.category}
                                                </span>
                                                <Badge className="bg-[color:var(--accent-secure)] text-black">Active</Badge>
                                            </div>
                                            <div className="mt-2 font-medium">{item.label}</div>
                                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}



