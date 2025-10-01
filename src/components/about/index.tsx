"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Wallet,
    Code2,
    Cpu,
    ShieldCheck,
    Network,
    Boxes,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
});

const skills = [
    { title: "Cross-chain Wallet", icon: Wallet, gradient: "from-blue-500/20 to-purple-500/20" },
    { title: "Smart Contracts", icon: ShieldCheck, gradient: "from-indigo-500/20 to-fuchsia-500/20" },
    { title: "AI-powered dApps", icon: Cpu, gradient: "from-emerald-400/20 to-cyan-400/20" },
    { title: "Web3 Infra", icon: Network, gradient: "from-sky-400/20 to-violet-500/20" },
    { title: "Fullstack Apps", icon: Code2, gradient: "from-pink-400/20 to-orange-400/20" },
    { title: "Interoperability", icon: Boxes, gradient: "from-teal-400/20 to-lime-400/20" },
];

export function About() {
    return (
        <section id="about" className="section">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    {/* Left: narrative + stats */}
                    <div>
                        <motion.h2 className="text-3xl md:text-4xl font-semibold tracking-tight" {...fadeUp(0)}>
                            About
                        </motion.h2>
                        <motion.p className="mt-4 text-foreground/80" {...fadeUp(0.06)}>
                            Aktif di hackathon, proyek blockchain, dan aplikasi fullstack. Fokus pada membangun solusi
                            yang aman, skalabel, dan berdampak nyata.
                        </motion.p>
                        <motion.p className="mt-3 text-foreground/80" {...fadeUp(0.12)}>
                            Niche: cross-chain wallet, pengembangan smart contract, dan dApps bertenaga AI.
                            Beberapa proyek nyata yang pernah dikerjakan: <span className="font-medium">Fradium</span>,
                            <span className="font-medium"> BimbingIn</span>.
                        </motion.p>
                        <motion.p className="mt-3 text-foreground/80" {...fadeUp(0.18)}>
                            Branding & komunitas: aktif di <span className="font-medium">MotionLab</span> (Koordas),
                            <span className="font-medium"> Vice President DTC</span>, dan beberapa kemenangan kompetisi.
                        </motion.p>

                        <motion.div className="mt-6 flex gap-6" {...fadeUp(0.24)}>
                            <div>
                                <div className="text-2xl font-semibold">20+</div>
                                <div className="text-sm text-muted-foreground">Repos</div>
                            </div>
                            <div>
                                <div className="text-2xl font-semibold">5</div>
                                <div className="text-sm text-muted-foreground">Showcase</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: skills grid */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {skills.map((s, i) => (
                                <motion.div key={s.title} {...fadeUp(0.08 + i * 0.04)}>
                                    <Card className="card-surface border-border/60">
                                        <CardContent className="p-4">
                                            <div
                                                className={`relative rounded-xl p-4 bg-gradient-to-br ${s.gradient} glass`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <s.icon className="size-5 text-foreground/80" />
                                                        <div className="font-medium">{s.title}</div>
                                                    </div>
                                                    <Badge className="bg-[color:var(--accent-secure)] text-black">Active</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


