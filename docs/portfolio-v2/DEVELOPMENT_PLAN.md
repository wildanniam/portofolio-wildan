# Development Plan V2 — Personal Field Notes

Date: 12 July 2026

Status: **Checkpoint A approved by Wildan; implementation authorized**

Delivery model: issue-driven, branch-per-slice, reviewed PRs, no direct meaningful
work on `main`, no merge without Wildan's explicit approval.

## 1. Outcome

Replace the failed Open Proving Ground presentation with the approved Personal
Field Notes system while preserving the repository's validated content and
quality infrastructure.

The finished portfolio must:

1. introduce Wildan clearly and memorably;
2. present PayGate, Fradium, Nova AI, and Quorum with equal homepage weight;
3. move detailed evidence and technical storytelling into reusable case studies;
4. showcase documentary moments through a deliberate gallery system;
5. remain fast, semantic, accessible, and attractive without JavaScript;
6. accept future projects and moments through content records;
7. remain reversible until the final root cutover.

## 2. Current foundation assessment

### Preserve

- Next.js route groups and server-first route architecture;
- YAML/MDX content repository and Zod validation;
- publication states and preview authentication;
- project roles, claims, provenance, and external-link audit;
- `/work`, `/work/[slug]`, `/moments`, `/contact`, sitemap, robots, metadata;
- media audit, asset licenses, derivative workflow, and release scripts;
- unit, Playwright, accessibility, no-JS, visual, bundle, and Lighthouse harness;
- case-study data and authentic project media.

### Rewrite or retire

- Open Proving Ground design tokens and Geist-led typography;
- project explorer markup, enhancer, sticky eligibility, overlay lifecycle, and
  explorer-specific tests;
- evidence-ledger homepage composition;
- `opg-*` visual classes on routes that move to V2;
- V1 homepage and Moments composition where it conflicts with the approved
  overview-first hierarchy;
- old social image and visual baselines after replacement approval.

### Defer removal

Legacy 3D components and dependencies are not removed during early V2 work.
They are deleted only after root cutover and dependency tracing proves they have
no remaining consumers.

## 3. Delivery principles

### Preview before replacement

Build V2 in a new protected preview namespace and a scoped `[data-portfolio-v2]`
style boundary. Do not mutate the public root incrementally.

### Static before motion

Every route is approved in its semantic, no-JavaScript form before animation.
Motion cannot repair an unresolved layout.

### One golden slice

The homepage static composition and PayGate case study prove the system before
all routes are migrated.

### Content-driven repetition

The four projects use shared components. A new project must require content and
media records, not a new bespoke React page.

### Checkpoint-driven approval

Do not continue across a failed visual checkpoint. Improve the current slice,
then re-run its gate.

## 4. Phase plan

### Phase 0 — Base, safety, and source-of-truth freeze

Purpose: ensure the redesign begins from a known, reversible state.

Work:

- choose and record the implementation base SHA after the current release
  candidate work is either merged or explicitly selected as the base;
- confirm a clean worktree and inventory any user-owned changes;
- track the V2 docs and approved references;
- mark V1 visual docs as superseded, without deleting historical evidence;
- create one implementation epic and high-signal child issues;
- define branch order and dependency relationships;
- capture current public and protected-preview screenshots at 1440x900,
  1024x768, 768x1024, 390x844, and a short desktop viewport;
- record current bundle, media, Lighthouse, and accessibility baselines.

Exit gate:

- no unaccounted work can be lost;
- V2 source of truth is linked from the implementation issue;
- baseline SHA, screenshots, and measurements are reproducible;
- no code from a superseded branch is silently reused.

### Phase 1 — Content and asset contract V2

Purpose: make every visible slot factual before layout work.

Work:

- extend moments with the `build | win | learn | give` category;
- preserve existing date/place/context/credit/consent/crop validation;
- audit and intake the newly supplied ReFactory photographs;
- define hero portrait candidates and approve one desktop/mobile focal policy;
- define the exact correct thumbnail for each flagship;
- create a verified achievement-summary query with equal-weight records;
- confirm homepage project order in `content/site/homepage.yaml`;
- revise English homepage copy to fit the approved content budgets;
- verify PayGate current status and Instaward sources immediately before publish;
- prohibit generated mockup images from public content queries;
- create an asset-slot matrix for hero, four project thumbnails, achievements,
  homepage Moments, full Moments, and each case-study chapter.

Exit gate:

- content validation fails on missing category, rights, alt, crop, source, or
  incorrect project media mapping;
- each flagship has one approved homepage thumbnail and complete case-study
  media package;
- at least five distinct approved Moments span more than one category;
- homepage contains no placeholder or generated evidence.

### Phase 2 — V2 foundations and isolated preview shell

Purpose: implement the design vocabulary without composing the full homepage.

Work:

- self-host Instrument Serif and Instrument Sans with license files;
- prefer build-time `next/font/google` delivery; fall back to vendored official
  WOFF2 files only when the installed runtime lacks the required families;
- implement `pfn-*` color, type, spacing, grid, motion, focus, and layer tokens;
- create a `[data-portfolio-v2]` scope and neutral document shell;
- implement foundation primitives from `DESIGN_SPEC.md`;
- build protected foundation previews for typography, rules, links, metadata,
  project item, media frame, field note, and category mark;
- author all default, hover, focus, active, reduced-motion, and no-JS states;
- add visual tests at desktop, tablet, and mobile;
- verify font-loading behavior and prevent layout shift.

Exit gate:

- tokens are the only source of repeated visual values;
- contrast and focus checks pass in rendered context;
- no foundation primitive contains project-specific copy or styling;
- font and CSS budgets pass;
- foundations visually match the approved reference language.

### Phase 3 — Static homepage golden slice

Purpose: approve the overview-first homepage before case studies and motion.

Work:

- implement `EditorialHeader` and `FieldNotesHero` as server components;
- implement the equal-weight four-project overview from validated content;
- implement verified achievement summaries;
- implement a static Moments teaser with correct real assets;
- implement currently-building and About/Contact close;
- implement a concise `/about` route from profile content; it expands the
  homepage teaser without becoming an organization chronology or CV dump;
- ensure ordinary links reach `/work/[slug]` without JavaScript;
- compose intentional desktop, tablet, mobile, and short-desktop layouts;
- add the protected V2 homepage preview route;
- add homepage visual and semantic tests.

Exit gate — **Checkpoint B**:

- Wildan approves desktop and mobile static screenshots;
- all four projects have equal perceived hierarchy;
- no project details exceed the homepage content budget;
- no image covers or floats over content;
- no-JS and keyboard paths work;
- real thumbnails are correctly mapped;
- homepage budgets and axe checks pass.

### Phase 4 — PayGate case-study golden slice

Purpose: approve the reusable detail template on the active product.

Work:

- restyle existing case-study primitives into the V2 vocabulary;
- implement the sequence defined in `DESIGN_SPEC.md`;
- use authentic PayGate media, not generated award imagery;
- distinguish product status, grant/award, and future plans accurately;
- preserve source links and claim provenance;
- ensure diagrams reflow or scroll internally without document overflow;
- implement desktop/mobile next-project navigation;
- add route metadata and social image based on authentic media.

Exit gate — **Checkpoint C**:

- Wildan approves PayGate desktop and mobile case-study screenshots;
- content clearly separates verified facts, owner-attested role, and reflection;
- long-form text is readable and not dashboard-like;
- all media captions and alternatives are complete;
- no project-specific page fork is required;
- route, no-JS, a11y, media, and performance checks pass.

### Phase 5 — Remaining flagship case studies and work archive

Purpose: prove the template is content-driven.

Work:

- migrate Fradium, Nova AI, and Quorum through the shared template;
- preserve the approved positive framing and exact public roles;
- restyle `/work` as a durable index for flagship and archive projects;
- keep non-flagship projects concise through the existing brief route model;
- verify previous/next project order and metadata;
- create authentic route-specific social images.

Exit gate:

- no new project-specific React component or animation exists;
- all four flagship routes pass validation and return 200 when published;
- archive projects remain visually subordinate but discoverable;
- every public result and award resolves to approved provenance.

### Phase 6 — Moments teaser, archive, filters, and lightbox

Purpose: make the human journey a real content system.

Work:

- implement the homepage filmstrip with native scroll snap first;
- implement `/moments` editorial grid from validated records;
- add category navigation/filtering as progressive enhancement;
- keep all moments present in the server-rendered no-JS document;
- implement an accessible Radix Dialog lightbox with next/previous controls,
  caption, position, close, focus return, Escape, and swipe where justified;
- preserve intrinsic images where appropriate and focal crops where approved;
- lazy-load noncritical images and avoid preloading the archive;
- add empty-category behavior for authoring previews without showing empty public
  filters.

Exit gate — **Checkpoint D**:

- Wildan approves homepage and full Moments desktop/mobile screenshots;
- categories are understandable without color alone;
- keyboard, touch, focus trap, focus return, and no-JS content pass;
- no autoplay or carousel-only content path exists;
- faces, award boards, and signage retain intended focal context;
- photo rights and credits pass validation.

### Phase 7 — Bounded motion and route enhancement

Purpose: add life without reintroducing fragility.

Work:

- implement cover assembly with scoped `useGSAP()` only after static approval;
- implement project-item hover/focus with CSS;
- evaluate View Transitions for project route navigation as optional progressive
  enhancement; ship only if it degrades cleanly;
- honor reduced motion, Save-Data, coarse pointer, interruption, resize, route
  change, and bfcache restoration;
- guarantee final content state before enhancement and after any failure;
- keep ScrollTrigger out unless a later approved sequence genuinely requires it;
- measure pre-intent and post-trigger JavaScript.

Exit gate — **Checkpoint E**:

- Wildan approves real recorded motion, not only still screenshots;
- motion matches the approved storyboard timings and purpose;
- no element changes layout dimensions during animation;
- reduced-motion state is immediate and complete;
- no duplicate nodes, stale styles, scroll lock, or focus movement remains after
  interruption;
- performance budgets pass on desktop and mobile.

### Phase 8 — Responsive, accessibility, performance, and SEO hardening

Purpose: validate the entire system rather than happy-path screenshots.

Work:

- run the viewport matrix from `QA_MATRIX.md`;
- run keyboard and screen-reader-oriented semantic checks;
- run axe on homepage, work, four case studies, Moments, Contact, 404, and
  protected preview failure states;
- validate no-JS and reduced motion on the complete route set;
- validate 200% and 400% zoom/reflow where applicable;
- run bundle, media, font, Lighthouse, route, link, sitemap, robots, metadata,
  and social-image audits;
- inspect console, hydration, network, image, and route-transition failures;
- create fresh visual baselines only after Wildan approves the rendered build;
- execute a final anti-slop critique against `DESIGN_SPEC.md`.

Exit gate:

- no P0 or P1 issue remains;
- no unverified required viewport/state remains;
- public Core Web Vitals targets and hard repository budgets pass;
- content is readable and usable without animation or JavaScript;
- implementation matches the approved references in hierarchy and rhythm.

### Phase 9 — Root cutover and release candidate

Purpose: switch safely without losing rollback capability.

Work:

- freeze content and rerun external-source verification;
- switch public root and shared metadata to V2;
- activate V2 quality budgets;
- keep V1 accessible only through a temporary private rollback route if needed;
- run the complete release command matrix against the production build;
- verify Vercel preview protection and public deployment behavior separately;
- perform Wildan's final desktop/mobile review on a real preview URL;
- prepare a release note with known nonblocking differences from generated mocks.

Exit gate — **Checkpoint F**:

- Wildan explicitly approves the release candidate;
- root, routes, metadata, sitemap, robots, OG images, links, and analytics work;
- no preview authentication leaks into public routes;
- rollback steps are tested and documented;
- deployment is not merged or promoted without approval.

### Phase 10 — Post-cutover cleanup

Purpose: remove dead architecture only after production confidence.

Work:

- remove project explorer components, motion controller, CSS, and tests;
- remove old V1 route previews and stale visual baselines;
- trace and remove unused Three.js, R3F, postprocessing, react-bits, old Motion,
  theme, form/email, and legacy UI dependencies only when no consumers remain;
- remove legacy 3D components and assets;
- rename V2 namespaces only if the migration benefit exceeds churn;
- update README, architecture docs, and `AGENTS.md` with durable commands and
  decisions;
- rerun the complete suite after dependency cleanup.

Exit gate:

- dependency graph contains no unused heavy visual stack;
- production behavior and budgets remain unchanged or improve;
- no historical content, attribution, or source record is lost.

## 5. Approval checkpoints

| Gate | Approval artifact | Blocks |
| --- | --- | --- |
| A | V2 plan, design spec, migration map, QA matrix, base SHA | all coding |
| B | Static homepage desktop/mobile + real asset map | case-study replication |
| C | PayGate case study desktop/mobile | remaining case studies |
| D | Moments homepage/archive desktop/mobile | gallery publication |
| E | Recorded motion + reduced-motion comparison | root cutover |
| F | Release preview, QA report, budgets, rollback | merge/deploy |

## 6. Issue and branch decomposition

Recommended issue order:

1. V2 source-of-truth and implementation base;
2. content/category and asset-contract extensions;
3. V2 tokens, fonts, and foundation previews;
4. static homepage golden slice;
5. PayGate case-study golden slice;
6. remaining flagship case studies and work archive;
7. Moments teaser, archive, filter, and lightbox;
8. bounded motion and transition hardening;
9. responsive/a11y/performance/SEO hardening;
10. release candidate and root cutover;
11. post-cutover legacy cleanup.

Do not create one issue per component. Each issue should deliver a reviewable
vertical outcome with verification and a rollback boundary.

## 7. Hard budgets

Repository limits remain authoritative. Proposed V2 targets:

| Metric | Homepage desktop | Homepage mobile | Case study |
| --- | ---: | ---: | ---: |
| Total initial JS gzip | <=175 KiB | <=175 KiB | <=170 KiB |
| Route-owned JS gzip | <=12 KiB | <=12 KiB | <=12 KiB |
| Pre-intent additional JS | 0 | 0 | 0 |
| Lazy interaction JS | <=50 KiB | <=50 KiB | <=35 KiB |
| CSS gzip | <=30 KiB | <=30 KiB | <=30 KiB |
| Initial media transfer | <=650 KiB | <=420 KiB | <=750 KiB |
| Largest initial image | <=180 KiB | <=120 KiB | <=200 KiB |
| WebGL requests | 0 | 0 | 0 |
| CLS | <0.05 | <0.05 | <0.05 |
| INP target | <200ms | <200ms | <200ms |
| Public LCP target | <3.2s | <3.2s | <3.2s |

Initial font transfer target: <=160 KiB total, with only genuinely critical font
files preloaded. The initial 2.5 s LCP proposal was revised to 3.2 s after the
first V2 production mobile-lab median measured 3.03 s with a 0.94 performance
score, 0 CLS, and 59.5 ms TBT; the executable ceiling remains tighter than the
previous 4.0 s legacy envelope. Budgets may become stricter after further
measured foundation work; they may not be loosened merely to accommodate
decorative behavior.

## 8. Main risks and mitigations

| Risk | Prevention | Release signal |
| --- | --- | --- |
| Mockup copied literally, including false media | asset-slot validation and manual mapping review | every image resolves to approved content ID |
| Homepage becomes another case study | enforce homepage content budget | four equal project items at all viewports |
| Editorial becomes rigid or generic | compare rhythm, crop, scale, and density to approved references | visual checkpoint approval |
| Editorial becomes scrapbook chaos | 70/30 rule, token spacing, rotation limits | hierarchy is clear in five seconds |
| Mobile becomes squeezed desktop | independent mobile composition and snapshots | 390px approval before replication |
| Gallery becomes trophy wall | category and event diversity requirements | multiple categories/events above fold |
| Motion recreates overlay bug | no sticky media; static-first; interruption tests | zero occlusion and stale layers |
| Fonts hurt LCP/CLS | subset, self-host, fallback tuning, preload audit | font and Lighthouse budgets pass |
| Existing evidence discipline makes tone too defensive | separate provenance storage from public editorial copy | copy reads positively while sources remain available |
| Legacy cleanup breaks routes | remove only after cutover and consumer tracing | full suite passes before and after cleanup |
| Photo rights remain incomplete | publication validation blocks unapproved assets | only consented assets reach public queries |

## 9. Definition of done

V2 is done only when:

- Checkpoints A–F are approved;
- homepage, four flagship routes, work archive, Moments, Contact, and document
  routes are complete;
- actual implementation matches the approved design system, not merely its
  color palette;
- every production image is authentic, optimized, credited, consented, and
  correctly mapped;
- keyboard, focus, no-JS, reduced motion, touch, resize, interruption, and route
  navigation are verified;
- desktop, tablet, mobile, and short-desktop visual QA passes;
- content, unit, E2E, axe, bundle, media, link, route, Lighthouse, and release
  checks pass;
- no P0/P1 defects or unexplained console/network errors remain;
- rollback is documented and tested;
- Wildan explicitly approves merge and release;
- obsolete heavy visual dependencies are removed in the cleanup phase or a
  documented consumer explains why they remain.
