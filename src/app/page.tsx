import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { Contact } from "@/components/contact";
import { About } from "@/components/about";

export default function Home() {
    return (
        <main className="min-h-dvh">
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Contact />
        </main>
    );
}
