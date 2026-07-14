# Portfolio V4 Development Plan

- Status: locked for implementation on Issue #29
- Branch: `codex/29-research-build-atlas`
- Strategy: preserve the validated foundation, replace the presentation layer
- Release policy: no merge before every V4 blocker and human visual gate passes

## 1. Engineering diagnosis

The existing site should not be repaired by stacking new animation on top of the V3 Atlas.

### Foundation to retain

- Next.js App Router and current public route URLs.
- Server-first rendering.
- YAML/MDX content repository.
- Zod schemas, content validation, claim provenance, and role labels.
- Responsive `next/image` derivatives and media audit.
- Moments dialog behavior, keyboard handling, and focus return.
- Playwright, Axe, Lighthouse, link audit, route audit, and bundle/media tooling.
- Fradium → Nova → PayGate → Quorum editorial order.

### Presentation to replace or materially refactor

- `pfn-home.tsx` hero, proof ribbon, and screenshot-led Atlas.
- Work index layout and generic image association.
- Project opening and generic case-study chapter language.
- About, Contact, metadata, and social copy that still use the V3 identity.
- Project-image selection through a single generic `projectPrimaryImage()` path.
- Hard-coded Atlas variants, flagship claim IDs, and moment ordering duplicated in UI code.
- The 2,648-line `pfn.css` presentation monolith.
- Legacy dependencies and UI components that are no longer reachable after migration.

### Root causes to remove

1. One factual `oneLiner` is reused in contexts that need different editorial copy.
2. Full screenshots are forced into `16:10`, `4:5`, or `4:3` containers.
3. `order: -1` changes media association and DOM/visual sequence.
4. Project identity lacks a logo/brand asset contract.
5. Static layout was not approved against a high-fidelity target before full implementation.
6. Tests protect routing, overflow, and accessibility but not crop quality, visual ownership, hierarchy, or prestige.
7. Automated passes were treated as sufficient release evidence.

## 2. Target architecture

```text
src/components/portfolio/
├── shell/
│   ├── site-header.tsx
│   ├── mobile-navigation.tsx
│   └── site-footer.tsx
├── home/
│   ├── research-build-hero.tsx
│   ├── research-coordinates.tsx
│   ├── project-atlas.tsx
│   ├── project-stage.tsx
│   ├── scenes/
│   │   ├── fradium-scene.tsx
│   │   ├── nova-scene.tsx
│   │   ├── paygate-scene.tsx
│   │   └── quorum-scene.tsx
│   ├── moments-preview.tsx
│   └── current-dispatch.tsx
├── project/
│   ├── project-opening.tsx
│   ├── project-narrative.tsx
│   ├── project-evidence.tsx
│   └── project-navigation.tsx
├── media/
│   ├── responsive-media.tsx
│   ├── project-logo.tsx
│   └── artifact-fragment.tsx
└── motion/
    ├── atlas-motion-loader.tsx
    └── atlas-motion-runtime.tsx

src/styles/portfolio/
├── tokens.css
├── base.css
├── shell.css
├── home.css
├── atlas.css
├── project.css
├── moments.css
└── motion.css
```

Server components render every meaningful word, image, link, and final visual state. Client boundaries are limited to the mobile menu, Moments filtering/lightbox, and progressive motion enhancement.

## 3. Content and presentation contracts

### Profile

Update the canonical profile and metadata to use:

- identity: `AI Researcher & Web3 Builder`;
- discipline: `Software Engineering`;
- research direction: trustworthy autonomous systems;
- operating rhythm: researching / building / shipping.

Root metadata, social metadata, About, Contact, and structured copy must derive from the same canonical profile instead of duplicating identity strings.

### Research content

Add a validated site-level research source for:

- AI Agents;
- Trustworthy Autonomous Systems;
- On-chain Intelligence;
- Agentic Payments.

Each record contains a concrete summary and related project slugs.

### Homepage project narrative

Extend the homepage content contract with per-project:

- question;
- concise product answer;
- selected outcome claim ID;
- authentic artifact IDs;
- flow labels;
- stage variant.

Factual role, lifecycle, links, claims, and team context continue to come from project YAML. Presentation code must not duplicate factual copy.

### Branding

Logo files are identity assets, not evidence assets. Add a typed brand-asset contract containing:

- mark and optional wordmark path;
- intrinsic dimensions;
- light/dark suitability;
- accessible/decorative behavior;
- project-scoped colors;
- source repository, revision, source path, creator, and rights.

## 4. Asset production plan

### Source freeze

Record the canonical source revision and asset path for Fradium, Nova, PayGate, and Quorum before copying anything into the portfolio.

### Intake

Create a contact sheet for each project and score candidates by:

- product clarity at homepage size;
- authenticity;
- ability to explain one system flow;
- mobile legibility;
- visual compatibility with the stage.

### Stage asset slots

Each project receives at most:

1. one mark;
2. one optional wordmark;
3. one primary product surface;
4. two supporting UI fragments;
5. one connector treatment.

### Production derivatives

- Copy selected assets to `public/media/projects/{slug}/atlas/`.
- Sanitize SVG IDs and remove remote or embedded resources.
- Generate desktop and mobile raster derivatives with Sharp.
- Preserve intrinsic dimensions and meaningful UI states.
- Use `contain` or intrinsic layout for product UI.
- Add provenance and accessible summaries.

### Known asset gap

Nova's available 64px mark cannot be enlarged. Obtain a vector/high-resolution export or create a faithful trace that passes an overlay comparison against the authentic mark. Do not redesign the logo.

## 5. Motion architecture

Add only `gsap` and `@gsap/react` after static visual approval.

### Loading model

- Hero entrance stays CSS-first and does not require eager GSAP.
- Static Atlas HTML is complete before JavaScript.
- A small loader observes the Atlas with roughly a 300px root margin.
- GSAP and ScrollTrigger are dynamically imported only when the Atlas approaches the viewport.
- Reduced-motion users do not download the motion runtime.
- A failed dynamic import leaves the static experience complete.

### Runtime rules

- Use `useGSAP()` with a scoped Atlas root and automatic context cleanup.
- Register plugins only in the client motion module.
- Maximum five ScrollTriggers: one Atlas intro and four stages.
- Put ScrollTrigger on each master timeline, never on nested child tweens.
- No pin, scrubbed long sequence, horizontal scroll, or smooth-scroll proxy.
- Animate transforms, opacity, SVG stroke, and small bounded clips only.
- Use `gsap.quickTo()` for optional 4–6px pointer depth.
- Remove temporary `will-change` after animation.
- Refresh only after a real layout/media change.

### Timeline budget

Each stage completes once within 850–900ms:

```text
0–160ms    mark resolves
100–420ms  connector forms
240–720ms  authentic fragments assemble
520–850ms  outcome and action settle
```

## 6. Ordered implementation phases

### Phase 0 — Clean execution baseline

Tasks:

- Start from a clean worktree and branch based on the intended canonical main.
- Carry forward the current metadata fix explicitly.
- Create one high-signal GitHub issue and one implementation branch.
- Record current route, visual, bundle, media, accessibility, and Lighthouse baselines.
- Preserve the current V3 deployment as rollback.

Exit gate:

- branch is clean and not `main`;
- issue contains scope, design links, and V4 gates;
- baseline artifacts are reproducible;
- no unrelated user changes are included.

### Phase 1 — Human visual target gate

Tasks:

- Produce high-fidelity desktop frames for the hero, Research Coordinates, Project Atlas idle state, one stage interaction state, case-study opening, and Moments preview.
- Produce 390px hero and Project Atlas frames.
- Compare and lock two typography pairings.
- Produce a concise keyframe storyboard for `Signal → System`.

Exit gate — Human Visual Gate 1:

- Wildan approves the actual frames, not only a written description;
- the first viewport clearly says AI Researcher & Web3 Builder;
- four projects are visible as a collection;
- stage ownership and image association are unambiguous;
- static frames already feel prestigious without animation.

No final layout implementation may begin before this gate passes.

### Phase 2 — Content, schema, and asset contract

Tasks:

- Update profile, metadata, and hero copy.
- Add research-coordinate content.
- Add homepage project narrative and typed stage configuration.
- Add project branding contract and referential validation.
- Remove duplicated ordering/claim decisions from UI code.
- Select and generate Atlas asset derivatives.
- Extend unit and media-audit coverage.

Exit gate:

- content validation and media audit pass;
- roles and approved claims are unchanged;
- every stage resolves mark, question, product answer, outcome, and artifact IDs;
- no production asset is upscaled or unprovenanced;
- Nova logo gap is resolved.

### Phase 3 — Design-system and shell refactor

Tasks:

- Split the global stylesheet into semantic modules.
- Freeze typography, grid, spacing, color, focus, z-index, media, and motion tokens.
- Rebuild header/navigation from the canonical navigation source.
- Retain the skip link, semantic landmarks, mobile dialog, and focus behavior.
- Build `ProjectLogo`, `ArtifactFragment`, and responsive media primitives.

Exit gate:

- shell works at 1440, 1024, 768, 390, and 320px;
- no duplicated navigation source remains;
- focus is visible on paper and all four project-stage backgrounds;
- stylesheet modules have clear ownership and no cross-route selector leakage.

### Phase 4 — Static golden slice

Tasks:

- Implement the static hero.
- Implement Research Coordinates.
- Implement the 2 × 2 Project Atlas with all four static system scenes.
- Do not add GSAP yet.
- Capture desktop, tablet, and mobile screenshots.

Exit gate — Human Visual Gate 2:

- rendered result is approved against the high-fidelity target;
- every project is recognizable before hover;
- no asset crosses another stage boundary;
- no important product state is cropped;
- copy, role, outcome, and CTA remain visible without JavaScript;
- mobile is independently composed rather than stacked desktop CSS.

If this gate fails, return to composition and assets. Do not proceed by adding animation.

### Phase 5 — Motion enhancement

Tasks:

- Add lazy GSAP/ScrollTrigger runtime.
- Implement one `Signal → System` timeline per project.
- Implement bounded pointer/focus behavior.
- Add complete reduced-motion behavior.
- Trace animation runtime on desktop and a mid-tier mobile profile.

Exit gate:

- static and animated final states are visually identical;
- motion completes within budget and explains workflow;
- reduced motion avoids downloading the runtime and shows the settled scene;
- no motion-attributable layout shift, long task, focus loss, or stale inline transform remains.

### Phase 6 — Full homepage and gallery polish

Tasks:

- Replace the V3 proof ribbon with project-local outcomes.
- Implement curated Moments preview and deep links to relevant stories.
- Polish the full Moments route while preserving accessible dialog behavior.
- Implement Currently Shipping for PayGate.
- Rewrite research/about close and contact invitation.

Exit gate:

- homepage forms one narrative from identity → research → builds → moments → current direction;
- gallery crops and focal points are reviewed individually;
- near-duplicate photos are grouped rather than repeated;
- About and Contact do not repeat the hero verbatim.

### Phase 7 — Work index and flagship case studies

Tasks:

- Replace screenshot-cover work records with logo-led bounded archive entries.
- Rebuild case-study openings around question, product answer, role, outcome, and authentic visual.
- Render the human MDX narrative where it adds unique story instead of leaving it unused.
- Keep structured YAML as the fact source.
- Add project-aware chapters and navigation.
- Restore Atlas position when navigating back where browser support allows.

Exit gate:

- Atlas → case study → back/next path works with keyboard, touch, and browser history;
- each flagship exposes identity, role, state, outcome, media, and actions within two viewports;
- case studies are coherent siblings but not visual clones;
- full screenshots preserve useful ratios;
- unavailable actions never render as dead links.

### Phase 8 — Responsive, accessibility, and state completeness

Tasks:

- Verify desktop 1280/1440, tablet 768/1024, mobile 320/360/390/430, and 200% zoom.
- Complete the global state matrix for header, links, stages, media, gallery, lightbox, external actions, and 404.
- Verify semantic order, contrast, alt text, focus, touch targets, and reduced motion.
- Test content and image error fallbacks.

Exit gate:

- no horizontal overflow or incoherent overlap;
- no keyboard or touch dead end;
- all interaction states are visible and stable;
- WCAG 2.2 AA and Axe checks pass;
- tablet feels designed, not compressed.

### Phase 9 — Performance and cleanup

Tasks:

- Remove legacy presentation components after parity.
- Audit and remove unused Motion/Framer Motion, React Bits, theme, form, toast, and UI-library dependencies when no reachable route requires them.
- Enforce V4 JS and media budgets.
- Verify no WebGL/canvas payload.
- Generate updated social images and metadata.

Exit gate:

- route-owned initial JS remains within the existing budget;
- lazy motion chunk remains within its budget;
- LCP, CLS, INP, media weight, and Lighthouse targets pass;
- no dead CSS, unused client component, console error, React warning, or hydration warning remains.

### Phase 10 — Release candidate and merge

Tasks:

- Run all static, content, media, unit, E2E, accessibility, link, route, bundle, and Lighthouse checks.
- Test Chromium, Firefox, and WebKit.
- Attach required screenshots, motion recordings, and keyboard walkthrough.
- Open a focused PR linked to the implementation issue.
- Perform user review on the public preview.

Exit gate — Human Visual Gate 3:

- every P0 and P1 item in `QA_MATRIX.md` is zero;
- Wildan explicitly approves the public preview in the current implementation thread;
- PR contains verification, screenshots, risks, and rollback target;
- merge occurs only after visual approval and green checks;
- production smoke test passes after merge.

## 7. State matrix

| Surface | Required states |
| --- | --- |
| Header | default, current, hover, focus, mobile closed/open, Escape, focus return |
| CTA/link | default, hover, focus-visible, active, unavailable |
| Atlas stage | static, enter, settled, hover, focus-within, touch, reduced-motion |
| Product media | loading, loaded, error, desktop source, mobile source |
| Gallery filter | default, selected, focus, zero result, result announcement |
| Lightbox | opening, open, previous, next, closing, Escape, focus return |
| External action | public, unavailable, broken-link prevention |
| Route transition | normal, interrupted, browser back, reduced-motion fallback |
| 404 | explanation, Home recovery, Work recovery |

## 8. Performance budgets

Do not raise budgets to make the implementation pass.

### JavaScript

- motion loader/controller: no more than 4KB gzip additional;
- lazy GSAP + ScrollTrigger chunk: no more than 50KB gzip;
- homepage route-owned initial JS: retain the current 18KB gzip ceiling;
- total lazy route JS: retain the current 60KB gzip ceiling unless a documented tooling measurement proves the profile definition changed;
- zero WebGL, Three.js, R3F, or canvas runtime.

### Media

- logo SVG: no more than 12KB unless documented;
- desktop product fragment: no more than 90KB;
- mobile product fragment: no more than 60KB;
- total project stage after lazy load: no more than 180KB desktop / 110KB mobile;
- largest image: no more than 180KB desktop / 120KB mobile.

### Runtime

- mobile LCP: no more than 2.5s in the release profile;
- CLS: no more than 0.05;
- INP: no more than 200ms;
- no motion-attributable long task over 50ms;
- only one project-stage timeline active at a time;
- no persistent animation loop after the stage settles;
- Lighthouse mobile Performance at least 90;
- Accessibility, Best Practices, and SEO at least 95.

## 9. Verification commands

The exact implementation PR must run at minimum:

```sh
npm run validate:content
npm run audit:media
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm run test:a11y
npm run audit:links
npm run audit:release-routes
npm run analyze:bundle
npm run lighthouse
```

Visual and motion review is additional; these commands do not replace it.

## 10. Commit and review strategy

Use a small number of coherent commits, for example:

1. `docs: lock research build atlas direction`
2. `feat: add portfolio content and brand asset contracts`
3. `feat: build static hero and project atlas`
4. `feat: add bounded atlas motion`
5. `feat: rebuild work and project narratives`
6. `feat: polish moments about and contact`
7. `test: enforce portfolio v4 release gates`

Do not create artificial commits, issues, or PRs. One implementation issue and one focused PR are preferred.

## 11. Stop conditions

Stop and return to the relevant phase when:

- the static design requires motion to look complete;
- any project visual can be mistaken for another project;
- a screenshot requires destructive cropping;
- typography is only convincing at one viewport;
- mobile is a reordered desktop layout rather than a designed reading flow;
- a new library is being added to compensate for weak composition;
- user approval is missing at a human visual gate;
- any P0 or P1 issue remains at release time.

The implementation is complete only when the portfolio is visually convincing, understandable, accessible, performant, and technically green at the same time.
