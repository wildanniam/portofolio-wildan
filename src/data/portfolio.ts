import {
  Bot,
  BrainCircuit,
  CircuitBoard,
  Code2,
  DatabaseZap,
  FlaskConical,
  Globe2,
  Instagram,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  WalletCards,
  Zap,
} from "lucide-react";

export const profile = {
  name: "Wildan Syukri Niam",
  title: "AI Researcher & Web3 Builder",
  email: "wildanniam4@gmail.com",
  location: "Bandung, Indonesia",
  school: "Software Engineering, Telkom University",
  statement:
    "Building trustworthy AI agents, on-chain intelligence, and autonomous payment systems.",
  intro:
    "I design and ship autonomous systems that can reason, transact, verify risk, and coordinate safely across real-world software and blockchain environments.",
  availability:
    "Open to research collaboration, Web3 product teams, AI engineering roles, and ambitious hackathon-grade builds.",
};

export const socials = [
  {
    label: "GitHub",
    href: "https://github.com/wildanniam",
    icon: Code2,
  },
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/wildanniam_/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: Globe2,
  },
];

export const proofChips = [
  "WCHL Global Finale Winner",
  "$5,000 SCF Instaward",
  "Refactory Hackathon 2nd Place",
  "Lisk Builders Hackathon Winner",
];

export const metrics = [
  {
    value: "6",
    label: "flagship AI/Web3 builds",
  },
  {
    value: "$5K",
    label: "SCF Instaward accepted",
  },
  {
    value: "2026",
    label: "active build year",
  },
  {
    value: "3.66",
    label: "CGPA at Telkom University",
  },
];

export const researchVectors = [
  {
    title: "AI Agents",
    eyebrow: "Reasoning systems",
    icon: BrainCircuit,
    summary:
      "Autonomous workflows, tool use, human-in-the-loop safety, and agent reliability for real software tasks.",
    links: ["SpecHeal", "Nova AI Wallet", "Crucible"],
    color: "cyan",
  },
  {
    title: "Web3 Trust",
    eyebrow: "Risk-aware crypto UX",
    icon: ShieldCheck,
    summary:
      "Safer transaction layers, address intelligence, threat detection, and transparent signals before users move funds.",
    links: ["Fradium", "Nova AI Wallet"],
    color: "mint",
  },
  {
    title: "On-chain Intelligence",
    eyebrow: "Multi-chain analysis",
    icon: CircuitBoard,
    summary:
      "Wallet behavior, anomaly detection, verifiable reports, and chain-native analytics for security decisions.",
    links: ["Fradium", "Crucible"],
    color: "violet",
  },
  {
    title: "Agentic Payments",
    eyebrow: "Autonomous commerce",
    icon: WalletCards,
    summary:
      "API monetization, x402-style flows, Stellar settlement, and payment rails designed for software agents.",
    links: ["AgentPay", "PayGate Stellar"],
    color: "amber",
  },
];

export type Project = {
  slug: string;
  title: string;
  status: string;
  year: string;
  role: string;
  focus: string;
  achievement?: string;
  description: string;
  longDescription: string;
  stack: string[];
  links: {
    github: string;
    live?: string;
    demo?: string;
    docs?: string;
  };
  signal: string;
  accent: "cyan" | "mint" | "violet" | "amber" | "rose" | "blue";
};

export const projects: Project[] = [
  {
    slug: "fradium",
    title: "Fradium",
    status: "Flagship",
    year: "2025",
    role: "Project Lead & Fullstack Developer",
    focus: "AI-powered Web3 trust layer",
    achievement: "WCHL Global Finale Winner",
    description:
      "A fully on-chain security and analytics platform for safer multi-chain Web3 transactions.",
    longDescription:
      "Fradium combines wallet UX, browser extension flows, AI threat detection, community reporting, tokenized incentives, and developer APIs into a trust layer for Web3 activity. The system analyzes addresses across Bitcoin, Ethereum, Solana, ICP, and other networks so users can understand risk before they transact.",
    stack: ["ICP", "Motoko", "Rust", "JavaScript", "Python", "ONNX", "Wallet UX"],
    links: {
      github: "https://github.com/fradiumofficial/fradium",
      live: "https://fradium.io",
      docs: "https://fradium.gitbook.io/docs",
      demo: "https://youtu.be/4Twnw54thms",
    },
    signal: "Trust before transaction",
    accent: "mint",
  },
  {
    slug: "agentpay",
    title: "AgentPay",
    status: "Live Demo",
    year: "2026",
    role: "Product Builder & Fullstack Developer",
    focus: "Agent-native API payments",
    description:
      "An x402-powered marketplace where AI agents discover paid APIs and settle requests with Stellar testnet USDC.",
    longDescription:
      "AgentPay turns ordinary HTTP APIs into agent-readable paid tools. Providers publish endpoints and prices; external agents discover a machine-readable registry, handle HTTP 402 payment flows, pay per request, and receive provider responses only after settlement verification.",
    stack: ["Next.js", "TypeScript", "Stellar", "x402", "Supabase", "Prisma", "Soroban"],
    links: {
      github: "https://github.com/wildanniam/AgentPay",
      live: "https://agent-pay-jet.vercel.app",
    },
    signal: "APIs that agents can pay for",
    accent: "cyan",
  },
  {
    slug: "nova-ai-wallet",
    title: "Nova AI Wallet",
    status: "Awarded",
    year: "2026",
    role: "Fullstack Developer, AI Agent Developer & Deployment Lead",
    focus: "AI wallet orchestration",
    achievement: "Lisk Builders Hackathon Winner",
    description:
      "A chat-first wallet orchestration layer for analysis, transaction preparation, and crypto payment workflows.",
    longDescription:
      "Nova is not just a chatbot. It is an agentic wallet layer that understands user intent, calls wallet and on-chain tools, renders smart UI cards, and keeps final signing under explicit user control. It explores a Lisk-first experience while preparing for broader multi-chain workflows.",
    stack: ["Next.js", "CopilotKit", "Gemini", "Wagmi", "Viem", "PostgreSQL", "Midtrans"],
    links: {
      github: "https://github.com/OfficialNovaAI/nova-wallet",
      live: "https://nova-wallet-puce.vercel.app",
    },
    signal: "Chat to understand, prepare, and act",
    accent: "violet",
  },
  {
    slug: "specheal",
    title: "SpecHeal",
    status: "2nd Place",
    year: "2026",
    role: "Product Developer, Fullstack Developer & AI Integration Lead",
    focus: "AI-assisted test recovery",
    achievement: "Refactory Hackathon 2nd Place",
    description:
      "A recovery cockpit for Playwright UI failures that separates safe selector healing from real product bugs.",
    longDescription:
      "SpecHeal was built for Refactory Hackathon's Engineering Productivity x AI challenge. It captures failure evidence, checks OpenSpec behavior, asks an AI verdict engine for structured reasoning, validates candidates in browser, applies controlled patches, reruns proof, persists audit trails, and hands off product bugs to Jira.",
    stack: ["Next.js", "Playwright", "OpenAI", "OpenSpec", "PostgreSQL", "Jira", "Kubernetes"],
    links: {
      github: "https://github.com/antech2-async/SpecHeal",
      live: "http://merge-kalau-berani.hackathon.sev-2.com",
    },
    signal: "Trustworthy recovery, not false green",
    accent: "rose",
  },
  {
    slug: "crucible",
    title: "Crucible",
    status: "Hackathon Build",
    year: "2026",
    role: "Fullstack & Smart Contract Developer",
    focus: "Autonomous agent accountability",
    description:
      "A coordination layer where agents register, stake, complete tasks, and get rewarded or slashed through verifiable outcomes.",
    longDescription:
      "Crucible explores the economics of agent reliability. Agents register with identities, lock stake before work, submit outputs through verifiable paths, and carry reputation into future assignments. It uses on-chain escrow, slashing, trust-tier updates, and a live arena dashboard.",
    stack: ["Next.js", "TypeScript", "Solidity", "Hardhat", "0G Galileo", "0G Storage"],
    links: {
      github: "https://github.com/antech2-async/crucible",
      live: "https://crucible-kappa-gules.vercel.app",
    },
    signal: "Make agent trust economically real",
    accent: "blue",
  },
  {
    slug: "paygate-stellar",
    title: "PayGate Stellar",
    status: "Funded Sprint",
    year: "2026",
    role: "Product Builder & Fullstack Developer",
    focus: "Stellar API micropayment middleware",
    achievement: "$5,000 SCF Instaward",
    description:
      "A Stellar middleware generator and earnings dashboard for monetizing API endpoints with micropayments.",
    longDescription:
      "PayGate is accepted for a $5,000 SCF Instaward in XLM through the Stellar Ambassador Program. The product direction is a developer-friendly path to API monetization: fill a scoped form, generate middleware, drop it into an API route, and receive verifiable USDC micropayments on Stellar.",
    stack: ["React", "Vite", "Tailwind", "Stellar", "USDC", "Node.js", "Express"],
    links: {
      github: "https://github.com/wildanniam/paygate-stellar",
      live: "https://paygate-stellar.vercel.app",
    },
    signal: "Micropayment rails for API builders",
    accent: "amber",
  },
];

export const achievements = [
  {
    year: "2026",
    title: "$5,000 SCF Instaward",
    context: "PayGate Stellar",
    description:
      "Accepted into Stellar Community Fund Instawards for a scoped Stellar-focused product sprint.",
    type: "Grant",
  },
  {
    year: "2026",
    title: "Refactory Hackathon 2nd Place",
    context: "SpecHeal",
    description:
      "Built an end-to-end AI engineering productivity product for Playwright failure recovery.",
    type: "Hackathon",
  },
  {
    year: "2026",
    title: "SEA Lisk Builders Hackathon Winner",
    context: "Nova AI Wallet",
    description:
      "Recognized for an AI wallet orchestration layer and strong social/product execution.",
    type: "Hackathon",
  },
  {
    year: "2025",
    title: "WCHL Global Finale Winner",
    context: "Fradium",
    description:
      "Won the Fully On-Chain Track with a Web3 trust layer for address analysis and AI threat detection.",
    type: "Global",
  },
  {
    year: "2025",
    title: "NextGen AI Global Hackathon 1st Place",
    context: "Internet Computer Protocol",
    description:
      "Awarded for shipping applied AI work in a global builder competition.",
    type: "AI",
  },
  {
    year: "2025",
    title: "National Hackathon 13 1st Place",
    context: "Codefest.id",
    description:
      "Placed first in a national hackathon, strengthening a track record of fast product execution.",
    type: "National",
  },
  {
    year: "2025",
    title: "Bank Indonesia Scholarship Awardee",
    context: "Academic & leadership recognition",
    description:
      "Selected as a scholarship awardee while leading lab programs and competition communities.",
    type: "Scholarship",
  },
];

export const capabilities = [
  {
    title: "Product Architecture",
    icon: DatabaseZap,
    items: ["PRD", "C4 models", "MVP scoping", "technical narrative"],
  },
  {
    title: "Fullstack Systems",
    icon: Code2,
    items: ["Next.js", "TypeScript", "APIs", "PostgreSQL", "deployment"],
  },
  {
    title: "AI Integration",
    icon: Bot,
    items: ["agent loops", "tool calling", "structured verdicts", "generative UI"],
  },
  {
    title: "Web3 Protocols",
    icon: Zap,
    items: ["wallet UX", "smart contracts", "Stellar", "ICP", "0G", "risk engines"],
  },
];

export const buildLog = [
  {
    date: "May 2026",
    title: "Accepted for SCF Instaward",
    detail:
      "PayGate Stellar entered a $5,000 Stellar-focused build sprint through SCF Instawards.",
  },
  {
    date: "May 2026",
    title: "Shipped SpecHeal at Refactory Hackathon",
    detail:
      "Built a usable AI recovery cockpit for Playwright failures and placed 2nd.",
  },
  {
    date: "2026",
    title: "Expanded agentic payments research",
    detail:
      "Developed AgentPay as a stronger technical demo for x402-style autonomous API payments.",
  },
  {
    date: "2025",
    title: "Pushed Fradium into global validation",
    detail:
      "Led a Web3 trust layer from architecture to hackathon proof with wallet, analytics, AI, and on-chain components.",
  },
];

export const sourceNotes = [
  {
    label: "GitHub",
    value: "Project repositories, READMEs, live demos, and implementation evidence.",
  },
  {
    label: "CV",
    value: "Education, internships, leadership, and achievement history.",
  },
  {
    label: "SCF",
    value: "Instaward rules describe scoped Stellar build sprints and funding ranges.",
  },
];

export const heroNodes = [
  { label: "Agent", icon: Bot },
  { label: "Wallet", icon: WalletCards },
  { label: "Risk", icon: ShieldCheck },
  { label: "Verifier", icon: FlaskConical },
  { label: "Payment", icon: Zap },
  { label: "Proof", icon: Trophy },
  { label: "Build", icon: Sparkles },
];
