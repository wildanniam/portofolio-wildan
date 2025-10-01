import { Badge } from "@/components/ui/badge";

const keywords = [
    "Blockchain",
    "Smart Contract",
    "Internet Computer",
    "Fullstack",
    "Flutter",
    "CI/CD",
    "Test Automation",
];

export function Footer() {
    return (
        <footer className="mt-16 border-t border-border/60">
            <div className="container mx-auto px-4 py-8 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                    {keywords.map((k) => (
                        <Badge
                            key={k}
                            variant="secondary"
                            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                        >
                            {k}
                        </Badge>
                    ))}
                </div>
                <div className="mt-4 inline-block">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-[length:100%_2px] bg-no-repeat bg-left-bottom pb-1">
                        Available for opportunities
                    </span>
                </div>
            </div>
        </footer>
    );
}


