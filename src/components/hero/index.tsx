"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
});

export function Hero() {
    return (
        <section className="relative section overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    {/* Left: Text */}
                    <div className="order-2 md:order-1">
                        <motion.h1
                            className="font-semibold tracking-tight gradient-text text-5xl md:text-6xl lg:text-7xl"
                            {...fadeUp(0)}
                        >
                            Wildan Syukri Niam
                        </motion.h1>

                        <motion.p
                            className="mt-3 text-sm md:text-base text-muted-foreground"
                            {...fadeUp(0.05)}
                        >
                            Blockchain Developer • Fullstack Engineer
                        </motion.p>

                        <motion.p
                            className="mt-4 text-base md:text-lg max-w-xl text-foreground/80"
                            {...fadeUp(0.12)}
                        >
                            "Building secure and scalable blockchain & web solutions that empower the future of technology."
                        </motion.p>

                        <motion.div className="mt-5 flex flex-wrap gap-2" {...fadeUp(0.18)}>
                            <span className="glass px-3 py-1 rounded-full text-sm">Blockchain Developer</span>
                            <span className="glass px-3 py-1 rounded-full text-sm">Web3 Enthusiast</span>
                            <span className="glass px-3 py-1 rounded-full text-sm">Fullstack Engineer</span>
                        </motion.div>

                        <motion.p className="mt-4 text-sm text-muted-foreground" {...fadeUp(0.22)}>
                            Telkom University • Software Engineering
                        </motion.p>

                        <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...fadeUp(0.28)}>
                            <Button asChild size="lg" className="button-radius brand-gradient">
                                <a href="#projects">View My Projects</a>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="button-radius border-[1.5px] border-[color:var(--accent-secure)] text-[color:var(--accent-secure)] hover:bg-[color:var(--accent-secure)]/10">
                                <a href="/contact">Collaborate With Me</a>
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right: Profile image with gradient background shape */}
                    <div className="relative order-1 md:order-2 flex justify-center">
                        {/* Animated blurred gradient blob */}
                        <div className="absolute -top-10 -right-10 w-56 h-56 md:w-72 md:h-72 rounded-full brand-gradient blur-blob -z-10" />
                        <div className="absolute -bottom-8 -left-6 w-40 h-40 md:w-56 md:h-56 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, rgba(124,255,163,0.35), transparent 60%)" }} />

                        {/* Profile visual (placeholder) */}
                        <div className="glass card-surface p-2 md:p-3 rounded-2xl">
                            <div className="relative size-48 md:size-64 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-background to-secondary">
                                {/* Gunakan gambar profil di sini bila tersedia di /public */}
                                <Image src="/next.svg" alt="Profile" width={180} height={180} className="opacity-80" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}



