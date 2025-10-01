import { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";

export const metadata: Metadata = {
    title: "Wildan Syukri Niam — Blockchain & Full‑stack Developer",
    description: "Portfolio of Wildan Syukri Niam: blockchain, smart contracts, and full‑stack work.",
};

export default function HomePage() {
    return (
        <main className="min-h-dvh">
            <Hero />
            <Skills />
            <Projects />
        </main>
    );
}



