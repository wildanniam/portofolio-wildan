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
        <section id="home" className="relative overflow-hidden min-h-dvh md:min-h-[100svh] flex items-center">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <div className="order-2 md:order-1">
                        <motion.h1
                            className="font-semibold tracking-tight gradient-text text-5xl md:text-6xl lg:text-7xl leading-tight"
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
                            <Button asChild size="lg" className="button-radius brand-gradient shadow-md shadow-purple-500/10">
                                <a href="#projects">View My Projects</a>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="button-radius border-[1.5px] border-[color:var(--accent-secure)] text-[color:var(--accent-secure)] hover:bg-[color:var(--accent-secure)]/10">
                                <a href="/contact">Collaborate With Me</a>
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right: Profile image with gradient background shape */}
                    <div className="relative order-1 md:order-2 flex justify-center">
                        {/* Animated blurred gradient blobs */}
                        <div className="absolute -top-16 right-0 w-72 h-72 md:w-96 md:h-96 rounded-full brand-gradient blur-blob -z-10" />
                        <div className="absolute bottom-0 -left-10 w-48 h-48 md:w-64 md:h-64 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, rgba(124,255,163,0.35), transparent 60%)" }} />

                        {/* Profile visual with gradient border + glass */}
                        <div className="relative rounded-2xl p-[2px] brand-gradient">
                            <div className="glass rounded-2xl p-2 md:p-3">
                                <div className="relative size-56 md:size-80 rounded-2xl overflow-hidden">
                                    <Image src="/wildan.png" alt="Profile" width={512} height={512} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Large vignette fade */}
            <div className="pointer-events-none absolute inset-0 -z-20 opacity-50 [mask-image:radial-gradient(55%_55%_at_60%_40%,black,transparent)]">
                <div className="absolute inset-0 bg-[radial-gradient(600px_400px_at_80%_20%,rgba(124,255,163,0.12),transparent),radial-gradient(800px_500px_at_90%_10%,rgba(122,92,255,0.18),transparent)]" />
            </div>
        </section>
    );
}



