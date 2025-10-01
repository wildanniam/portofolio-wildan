import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
    { title: "DeFi Protocol", desc: "Smart contracts & subgraph indexing.", href: "#" },
    { title: "NFT Launchpad", desc: "Minting pipeline, royalties, dashboards.", href: "#" },
    { title: "Full‑stack SaaS", desc: "Next.js app with billing & auth.", href: "#" },
];

export function Projects() {
    return (
        <section id="projects" className="container mx-auto px-4 py-12">
            <h2 className="text-xl font-medium tracking-tight">Projects</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                    <a key={p.title} href={p.href} className="group">
                        <Card className="transition-colors group-hover:border-lime-400/60">
                            <CardHeader>
                                <CardTitle className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    {p.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{p.desc}</p>
                            </CardContent>
                        </Card>
                    </a>
                ))}
            </div>
        </section>
    );
}



