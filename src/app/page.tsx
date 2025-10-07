import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { Contact } from "@/components/contact";
import { About } from "@/components/about";

export default function Home() {
    return (
        <main className="min-h-dvh">
            <Hero />
            <About />
            <Projects />
            <Contact />
        </main>
    );
}
