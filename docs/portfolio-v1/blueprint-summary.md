# Pre-Development Blueprint - The Open Proving Ground

Date: 11 July 2026
Decision status: **concept, scope, content contract, and Fradium motion direction locked**
Development-plan status: **approved and tracked**
Implementation status: **active through GitHub Issue #1 and reviewed pull requests**

Canonical index: [Portfolio V1 source of truth](./README.md)
Preserved starting state: [V5 preservation baseline](./baseline/README.md)

## Final direction

The portfolio is an evidence-first editorial archive, not a game, a 3D showcase, or a decorated resume. Its signature behavior moves a visitor from a compact contact sheet into inspectable project evidence. The interface remains fast and semantic when motion is unavailable.

The visual direction is light-only for V1: cold editorial surfaces, generous typography, thin rules, cobalt selection accents, authentic product media, and documentary photographs. Three.js/WebGL is intentionally absent from V1; the work is the spectacle.

The recommended opening position is:

> **Software Engineer building AI agents and Web3 systems.**

This is positioning copy, not a professional-license test. Project roles use Wildan's own account of his responsibilities, strengthened—not overruled—by public artifacts.

## The completed pre-development decisions

1. **Flagship evidence audit** — Fradium, Nova AI Wallet, PayGate, and Quorum were audited through repository history, source, live products, public proof, and limitations.
2. **V1 scope lock** — routes, homepage order, release boundaries, performance targets, and explicit non-goals are fixed.
3. **Content and asset contract** — future projects, evidence, claims, photographs, links, publication states, and reusable components have a typed contract.
4. **Motion storyboard** — Fradium is the golden prototype for the opening and contact-sheet-to-evidence-frame transition, including mobile, keyboard, no-JavaScript, reduced-motion, and performance behavior.
5. **Development plan** — design foundations, target architecture, controlled migration, issue slices, quality budgets, and release gates are mapped before production code changes.

## Flagship dossier

| Project | Public role | Project context | Strongest case-study thesis | Case-study state |
|---|---|---|---|---|
| Fradium | **Leader & Full-Stack Developer** | Award-winning team-built hackathon project that grew into a public beta. | Leading a team to make on-chain risk legible before money moves. | Full case study. |
| Nova AI Wallet | **Full-Stack & AI Builder** | Award-recognized hackathon artifact and AI-agent experiment. | Turning wallet intent into inspectable actions without taking over the signature. | Full hackathon case study. |
| PayGate | **Founder & Full-Stack Developer** | Active product on Stellar; awarded a **$5,000 SCF Instaward**. | Following one machine-paid request through `402 -> payment -> escrow -> protected upstream -> proof`. | Full active-product case study. |
| Quorum | **Full-Stack Product Builder** | Ambitious Stellar hackathon build spanning events, contracts, passes, settlement, and evidence. | Separating contract settlement from cash-out so two money movements cannot masquerade as one. | Full hackathon case study. |

### Narrative principles that must survive implementation

- **Owner attestation is valid:** Wildan's account is the source of truth for his leadership, role, and private or coordination work. Git history cannot record the entire job.
- **Hackathon is context, not an apology:** Nova and Quorum are presented as ambitious artifacts from an intense build sprint, not as failed startups.
- **Celebrate before qualifying:** each case study opens with idea, execution, team, result, and learning. Current technical debt appears only where it creates a useful `What I would improve next` chapter.
- **Credit remains generous:** strong personal ownership and explicit collaborator credit can coexist.
- **PayGate grant is verified:** Stellar Indonesia publicly congratulated PayGate and repeated the announcement that it was awarded $5K through Instawards; the official rules describe Instawards as short execution-focused funding, typically $1,000–$5,000 paid in XLM. Sources: [Stellar Indonesia announcement](https://x.com/Indo_Stellar/status/2075550378553421994) and [SCF Instawards rules](https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules).

## V1 shape

```text
/
├── Opening frame — identity, thesis, Fradium
├── Flagship evidence explorer — Fradium, Nova, PayGate, Quorum
├── Moments in the build — quality/rights gated
├── Currently building + static work archive
└── About + direct contact

/work
├── /fradium
├── /nova-ai
├── /paygate
└── /quorum

/contact — direct contact links
/moments — publication-gated documentary archive
```

`/moments` is published only after several distinct events or turning points form a real narrative. Search/filter is deferred until `/work` exceeds 12 projects. Contact uses direct email/social links in V1; a public form is deferred until its abuse, privacy, delivery, and state contract is deliberately scoped.

## Technology ownership

| Layer | Choice | Where it is used |
|---|---|---|
| Application | Next.js App Router, React Server Components, TypeScript | Semantic routes, server-first content, metadata, and low client cost. |
| Content | Repository-owned YAML/MDX, Zod validation | Project dossiers, case studies, claim sources, evidence, moments, and current work. |
| Motion | GSAP + `@gsap/react` | Lazily eligible contact-sheet-to-evidence-frame transition only. |
| Scroll | Native scroll, CSS sticky baseline, optional bounded ScrollTrigger | Fradium evidence prototype only when viewport and motion guards pass. No page-wide smoothing or hijacking. |
| Ordinary interaction | CSS and browser-native controls | Opening decoration, hover, focus, links, disclosure, and route navigation. |
| Media | Next/Image-compatible derivatives, poster-first video | Authentic product captures, diagrams, technical proof, and documentary photographs. |
| 3D | None in V1 | Reconsider only if a future project has authentic spatial evidence that cannot be communicated better in 2D. |

## Motion contract in one sentence

All critical copy and links exist at first paint; semantic selection updates immediately; a visual-only, inert overlay then performs the 650–850 ms evidence expansion without duplicating accessible content or blocking navigation.

The desktop sticky distance is not a guessed `vh` value. It is derived from a real Fradium prototype. Tablet/mobile use normal flow, reduced motion removes travel, and no-JavaScript keeps all four project summaries and links.

## Asset strategy

Assets are not a collection of decorative 3D objects. Each flagship needs the smallest authentic package that proves:

1. **Product reality** — a real state or outcome.
2. **System reasoning** — architecture, protocol flow, state transition, or transaction path.
3. **Verification** — test, trace, transaction, deployment, source, or validation artifact.

Generated visuals may explain a system, but can never impersonate a screenshot, person, award, transaction, customer, or result. Photo masters stay outside the workspace and repository; only cropped, redacted, EXIF-stripped, optimized, rights-cleared derivatives are published.

## Development-entry gate

Before production UI work, review and promote the new development package into tracked repository documentation. Preserve the two existing user-modified migration targets, then implement the approved `DESIGN.md` tokens and prototype only the Fradium explorer with real evidence before feeding the same component the other three records.

The source artifacts for this decision are:

- [Flagship evidence audit](./flagship-evidence-audit/evidence-audit-report.md)
- [V1 scope lock](./scope-v1.md)
- [Content, asset, and component contract](./content-asset-contract.md)
- [Flagship asset readiness](./asset-readiness.md)
- [Gallery photo intake](./gallery-photo-intake.md)
- [Fradium motion storyboard](./motion-storyboard.md)
- [Development package](./development/README.md)
