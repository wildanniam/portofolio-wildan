# Portfolio V1 Scope Lock

Date: 11 July 2026
Working concept: **The Open Proving Ground**
Language: **English**
Visual direction: **the light editorial visual base combined with the split project-index and evidence-frame interaction**

## Product outcome

The first release must let a technical founder, recruiter, or AI/Web3 researcher do three things quickly:

1. Understand what Wildan builds and why it matters.
2. Inspect four flagship systems through real product and technical evidence.
3. Reach the live product, source, case study, or Wildan directly without passing through decorative interaction.

The canonical experience remains a fast, semantic website. Motion adds context and emphasis; it never becomes the only navigation path.

## Flagship order

1. **Fradium** — homepage opening project and golden case study.
2. **Nova AI Wallet** — an award-recognized hackathon artifact showing full-stack AI-agent building under sprint constraints.
3. **PayGate** — the active product story: founder ownership, agentic-payment infrastructure, and a verified $5,000 SCF Instaward.
4. **Quorum** — an ambitious Stellar hackathon build showing end-to-end product and full-stack systems thinking.

The order can change later through content data. It must not be hard-coded into layout or GSAP timelines.

## Public routes

| Route | Release status | Purpose |
|---|---|---|
| `/` | Required | Curated thesis, flagship explorer, selected moments, current work, about, and contact. |
| `/work` | Required | Semantic, static archive for flagship and non-flagship projects. Add search/filter only after the archive exceeds 12 projects. |
| `/work/fradium` | Required | Full flagship case study and evidence record. |
| `/work/nova-ai` | Required | Full hackathon case study and evidence record; current runtime state does not erase the shipped sprint artifact. |
| `/work/paygate` | Required | Full flagship case study and evidence record. |
| `/work/quorum` | Required | Full hackathon case study and evidence record, with unfinished experiments framed as next iterations rather than disqualifiers. |
| `/contact` | Required | Direct email, GitHub, LinkedIn, and resume links. A public form is deferred until abuse prevention and delivery verification are deliberately scoped. |
| `/moments` | Publish-gated | Added to navigation only after enough verified photographs exist. |
| `/api/contact` | Deferred | Not a V1 dependency. Preserve existing code only if harmless; do not expose it as the primary contact path without validation, rate limiting or honeypot, privacy copy, complete states, and delivery verification. |

## Homepage sequence

### 1. Opening frame

- Wildan Syukri Niam.
- `Software Engineer building AI agents and Web3 systems.` is the locked V1 positioning line. This is honest portfolio positioning; project-specific roles and third-party outcomes continue to follow the provenance rules below.
- One short English thesis.
- Fradium as the only dominant project media.
- Immediate links to Work, GitHub, Contact, and résumé.
- No portrait hero, skill chips, award cloud, 3D object, or decorative dashboard.

### 2. Flagship evidence explorer

- A four-item project index in the locked order.
- One selected evidence frame at a time.
- Real project media, role, lifecycle, one verified outcome, and direct links.
- The contact-sheet-to-evidence-frame transition is the signature motion.
- All four projects remain reachable without scrolling through the animation or using a pointer.
- Every project title is a normal `<a href="/work/{slug}">`; evidence preview is a separate button with `aria-controls` and an explicit selected state.
- With JavaScript disabled, all four summaries, evidence posters, and case-study links remain present in normal document flow.

### 3. Moments in the build

- Show only verified real photographs supplied by Wildan.
- Each published photo has event, date, place, related project or journey context, caption, credit, consent, alt text, crop policy, and focal point when cropped.
- The homepage section is quality-gated: one exceptional, rights-cleared, accurately captioned photo tied to a relevant project may publish; weak filler is never required.
- The dedicated `/moments` route and navigation item are withheld until multiple distinct events or turning points form a meaningful narrative, regardless of raw file count.
- No empty frames or generated competition photographs appear in production.

### 4. Currently building and archive

- A short, current signal rather than a résumé timeline.
- Stable links to the complete `/work` archive.
- Items are dated and can expire from the homepage without losing their permanent route.

### 5. About and contact

- Short builder thesis, location, and availability.
- One current documentary portrait when available.
- Direct email, GitHub, LinkedIn, and résumé.
- No organization-history section and no generic technology grid.

## Flagship case-study template

Every flagship route follows the same evidence-first structure:

1. **Project opening** — one-liner, lifecycle, dates, role, team context, live/source links.
2. **Problem and stakes** — what could go wrong or remain unsolved.
3. **My role and the team** — Wildan's responsibilities, leadership, and generous collaborator credit.
4. **Constraint** — technical, time, product, trust, or ecosystem pressure.
5. **Decision** — one to three important choices and why they were made.
6. **System behavior** — architecture and the main input-to-outcome flow.
7. **Evidence sequence** — product, architecture, trace/test/transaction, and human moment where available.
8. **Outcome and validation** — sourced result, award, grant, shipped behavior, or user proof.
9. **Where it stands** — what is live, experimental, complete, or still evolving.
10. **What I'd improve next** — credible next work and learning rather than an apology for the project.

Hackathon and student work is presented as a legitimate build artifact, not graded against the operating history of a venture-backed production company. The page celebrates the idea, execution, team, learning, and verified outcome first. Technical debt belongs in `Next iteration` when it teaches something useful; it must not dominate or demean the project narrative.

## Publication gates

A flagship may be listed on the homepage before every optional asset exists. Its record must explicitly declare `publication: draft | preview | published` and `caseStudyState: brief | full`. A full case study cannot be called complete until it has:

- one role statement with explicit provenance; Wildan's owner attestation is valid for his leadership and responsibilities, while repository/team evidence may enrich the scope;
- authentic evidence that proves **product reality**;
- an architecture, protocol flow, state transition, transaction path, or equivalent explanation that proves **system reasoning**;
- a test, transaction, agent trace, deployment, validation path, source artifact, or equivalent item that proves **verification**;
- verified live/source links and a `lastVerifiedAt` date;
- an honest lifecycle label;
- limitations and claim sources;
- complete alt text and media dimensions;
- no production placeholder frames.

No fixed screenshot count is required; evidence earns its place by function and inspection value. All four routes may ship as full case studies when their narrative and media are complete. Incomplete technical experiments are contextualized honestly inside the story; the layout never compensates with invented proof.

## Out of scope for V1

- A Harvest Moon-style game or any game navigation.
- A permanent 3D/WebGL hero.
- Custom 3D assets per project.
- A headless CMS.
- A full blog, newsletter, or long-form notes platform.
- Page-wide smooth-scroll replacement or scroll hijacking.
- Multiple competing animation systems.
- A trophy wall, organization timeline, generic skill grid, or every-project card wall.
- A public moments archive before the photo publication gate is met.

## Technical and experience constraints

- Next.js App Router and React Server Components for content-first routes.
- Repository-owned MDX plus typed metadata validated with Zod.
- A committed `DESIGN.md` must be the first development artifact: typeface and license, color/contrast tokens, grid, spacing rhythm, borders, crops, and responsive behavior. V1 is light-only; dark mode is deferred.
- Native scrolling.
- GSAP and `@gsap/react` for the signature transition; ScrollTrigger only for bounded local sequences.
- CSS sticky is the baseline for the desktop explorer. Sticky enhancement is enabled only after real-media prototyping proves sufficient viewport width and height and reduced motion is off.
- CSS and browser-native behavior for ordinary hover, focus, disclosure, and navigation.
- No essential content inside canvas.
- Desktop, mobile, and reduced-motion experiences are authored separately.
- Homepage cold-navigation client JavaScript: 175 KB gzip hard ceiling including shared/runtime/route chunks and any pre-intent prefetch. The pinned Node 24 and Next 16.2.10 server-only fixture measured 145.141 KB gzip before portfolio route code; the production semantic enhancer then measured 171.719 KB while the lazy explorer chunk remained absent pre-intent. Route-owned initial JavaScript remains <=18 KB. The lazily eligible explorer enhancement and media are reported separately.
- Pre-launch lab goals: LCP <= 2.5 s, CLS <= 0.1, TBT <= 200 ms, plus explorer input-to-semantic-selected-state-and-next-paint latency <= 200 ms on the agreed profile. The non-blocking visual transition may continue for 650–850 ms. Field p75 is evaluated after enough real-user monitoring traffic: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1.

## V1 acceptance statement

V1 is ready to ship when a visitor can understand the thesis, inspect all four flagship projects, see only authentic evidence, use the experience with keyboard and touch, and reach Wildan directly—while the homepage remains fast without WebGL or animation.
