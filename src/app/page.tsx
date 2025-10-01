import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";

export default function Home() {
    return (
        <main className="min-h-dvh">
            <Hero />
            <Skills />
            <Projects />
        </main>
    );
}
