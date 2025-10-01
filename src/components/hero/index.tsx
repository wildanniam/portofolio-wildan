"use client";

import { Button } from "@/components/ui/button";
import ButtonPurple from "@/components/ui/button-purple";
import ButtonGreen from "@/components/ui/button-green";
import Image from "next/image";
import * as React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Particles } from "@/components/hero/particles";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay },
});

export function Hero() {
    // typing + deleting name loop
    const fullName = "Wildan Syukri Niam";
    const [typed, setTyped] = React.useState("");
    const [caret, setCaret] = React.useState(true);
    React.useEffect(() => {
        let i = 0;
        let forward = true;
        let paused = false;
        const typeMs = 100; // slower typing speed
        const pauseEndMs = 3000; // longer pause after completed typing
        const pauseStartMs = 1500; // longer pause before retyping

        const interval = setInterval(() => {
            if (paused) return;
            if (forward) {
                setTyped(fullName.slice(0, i + 1));
                i += 1;
                if (i >= fullName.length) {
                    forward = false;
                    paused = true;
                    setTimeout(() => { paused = false; }, pauseEndMs);
                }
            } else {
                setTyped(fullName.slice(0, i - 1));
                i -= 1;
                if (i <= 0) {
                    forward = true;
                    paused = true;
                    setTimeout(() => { paused = false; }, pauseStartMs);
                }
            }
        }, typeMs);

        const blink = setInterval(() => setCaret((c) => !c), 500);
        return () => { clearInterval(interval); clearInterval(blink); };
    }, []);

    // tilt interactions for photo
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-60, 60], [10, -10]);
    const rotateY = useTransform(x, [-60, 60], [-10, 10]);
    function onMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
    }
    function onLeave() { x.set(0); y.set(0); }

    return (
        <section id="home" className="relative overflow-hidden min-h-dvh md:min-h-[100svh] flex items-center">
            {/* Background image */}
            <div className="absolute inset-0 -z-40">
                <Image src="/background-1.webp" alt="" fill priority className="object-cover opacity-20" />
                {/* Bottom fade to match page background */}
                <div className="absolute inset-x-0 bottom-0 h-40" style={{ backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0), var(--background))" }} />
            </div>
            <Particles />
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left: Text */}
                    <div className="order-2 md:order-1">
                        <motion.h1
                            className="font-semibold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-tight whitespace-nowrap"
                            {...fadeUp(0)}
                        >
                            <span className="gradient-text whitespace-nowrap">{typed}</span>
                            <span className="inline-block w-3 ml-1 align-middle" style={{ opacity: caret ? 1 : 0 }}>|</span>
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
                            {[
                                "Blockchain Developer",
                                "Web3 Enthusiast",
                                "Fullstack Engineer",
                            ].map((b) => (
                                <motion.span key={b} whileHover={{ y: -3, scale: 1.02 }} className="glass px-3 py-1 rounded-full text-sm">
                                    {b}
                                </motion.span>
                            ))}
                        </motion.div>

                        <motion.p className="mt-4 text-sm text-muted-foreground" {...fadeUp(0.22)}>
                            Telkom University • Software Engineering
                        </motion.p>

                        <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...fadeUp(0.28)}>
                            <ButtonPurple size="md" className="button-radius" onClick={() => { window.location.hash = "projects"; }}>
                                View My Projects
                            </ButtonPurple>
                            <ButtonGreen size="md" fontWeight="medium" className="button-radius" onClick={() => { window.location.href = "/contact"; }}>
                                Collaborate With Me
                            </ButtonGreen>
                        </motion.div>
                    </div>

                    {/* Right: Profile image with gradient background shape */}
                    <div className="relative order-1 md:order-2 flex justify-center">
                        {/* Animated blurred gradient blobs */}
                        <motion.div
                            className="absolute -top-16 right-0 w-72 h-72 md:w-96 md:h-96 rounded-full brand-gradient-animate -z-10"
                            style={{ filter: "blur(40px)" }}
                            animate={{
                                y: [0, -12, 0],
                                x: [0, 10, 0],
                                scale: [1, 1.05, 1],
                                rotate: [0, 6, 0],
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute bottom-0 -left-10 w-48 h-48 md:w-64 md:h-64 rounded-full"
                            style={{ background: "radial-gradient(circle at 30% 30%, rgba(124,255,163,0.35), transparent 60%)", filter: "blur(30px)" }}
                            animate={{ y: [0, 14, 0], x: [0, -12, 0], scale: [1, 1.07, 1] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                        />

                        {/* Profile visual with gradient border + glass + hover scale */}
                        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 280, damping: 24 }} className="relative rounded-2xl p-[2px] brand-gradient will-change-transform">
                            <div className="glass rounded-2xl p-2 md:p-3">
                                <div className="relative w-56 md:w-80 aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-background/30 to-secondary/30">
                                    <Image
                                        src="/wildan-2.png"
                                        alt="Profile"
                                        fill
                                        priority
                                        className="object-cover"
                                        sizes="(min-width: 768px) 22rem, 16rem"
                                        style={{ objectPosition: "center 18%" }}
                                    />
                                </div>
                            </div>
                            {/* Aurora + orbital nodes (replaces previous ring) */}
                            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] overflow-hidden">
                                {/* Aurora mesh gradients */}
                                <motion.div
                                    className="absolute -inset-10 blur-2xl"
                                    style={{
                                        background:
                                            "radial-gradient(40%_40%_at_30%_20%, rgba(111,100,255,0.28), transparent 60%), radial-gradient(45%_45%_at_70%_60%, rgba(91,73,232,0.24), transparent 65%), radial-gradient(35%_35%_at_60%_20%, rgba(75,178,85,0.22), transparent 60%)",
                                    }}
                                    animate={{ scale: [1, 1.04, 1], rotate: [0, 5, 0] }}
                                    transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
                                />

                                {/* Orbiting nodes */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ transformOrigin: "50% 60%" }}
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                                >
                                    <span className="absolute left-1/2 top-2 size-2.5 -translate-x-1/2 rounded-full bg-[color:var(--accent-secure)] shadow-[0_0_14px_rgba(75,178,85,0.6)]" />
                                    <span className="absolute right-[14%] top-1/3 size-2 rounded-full bg-blue-400/90 shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
                                    <span className="absolute left-[16%] bottom-[18%] size-1.5 rounded-full bg-purple-400/90 shadow-[0_0_10px_rgba(167,139,250,0.55)]" />
                                </motion.div>

                                {/* Soft sweep highlight */}

                            </div>
                            {/* Floating crypto-like nodes */}
                            <motion.span className="absolute -right-6 top-10 size-3 rounded-full bg-[color:var(--accent-secure)] shadow-[0_0_16px_rgba(124,255,163,0.6)]" initial={{ y: -6 }} animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                            <motion.span className="absolute -left-4 bottom-6 size-2.5 rounded-full bg-blue-400/80 shadow-[0_0_12px_rgba(96,165,250,0.6)]" initial={{ y: 6 }} animate={{ y: [6, -6, 6] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
                        </motion.div>

                        {/* Floating badges around photo */}
                        <motion.div className="absolute -right-2 -bottom-10 hidden md:flex items-center gap-2 rounded-full px-3 py-1 glass text-xs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <span className="size-1.5 rounded-full bg-[color:var(--accent-secure)]" /> Secure by Design
                        </motion.div>
                        <motion.div className="absolute -left-6 top-6 hidden md:flex items-center gap-2 rounded-full px-3 py-1 glass text-xs" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <span className="size-1.5 rounded-full bg-blue-400" /> Multi‑chain Ready
                        </motion.div>
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



