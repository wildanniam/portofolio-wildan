import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div className="container mx-auto px-4 py-24 text-center">
                <motion.h1
                    className="text-4xl md:text-6xl font-semibold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Wildan Syukri Niam
                </motion.h1>
                <motion.p
                    className="mt-4 text-base md:text-lg text-muted-foreground"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    Blockchain & Full‑stack Developer
                </motion.p>
                <motion.div
                    className="mt-8 flex items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <a href="#projects">Lihat Proyek</a>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="border-lime-400 text-lime-400 hover:bg-lime-400/10">
                        <a href="/contact">Hubungi</a>
                    </Button>
                </motion.div>
            </div>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]">
                <div className="absolute -inset-[40%] bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.25),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.25),transparent_35%)]" />
            </div>
        </section>
    );
}



