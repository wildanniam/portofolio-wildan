import { Badge } from "@/components/ui/badge";

const skills = [
    "Solidity",
    "Foundry",
    "Hardhat",
    "TypeScript",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "Prisma",
];

export function Skills() {
    return (
        <section className="container mx-auto px-4 py-12">
            <h2 className="text-xl font-medium tracking-tight">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                    <Badge key={s} variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground">
                        {s}
                    </Badge>
                ))}
            </div>
        </section>
    );
}



