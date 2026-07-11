# Development Plan - The Open Proving Ground V1

Date: 11 July 2026
Status: **approved; implementation in progress**
Implementation model: issue-driven, branch-per-slice, reviewed PRs, no direct meaningful work on `main`

## 1. Outcome

Build a fast, evidence-first English portfolio that:

1. establishes Wildan as a software engineer building AI agents and Web3 systems;
2. makes Fradium, Nova AI Wallet, PayGate, and Quorum inspectable through authentic evidence;
3. celebrates both hackathon artifacts and an active product without overstating either;
4. showcases documentary photographs as meaningful build moments;
5. stays semantic, keyboard-usable, and readable without animation or JavaScript;
6. can receive future projects and photographs through content records rather than page rewrites.

The implementation is a controlled rewrite. The existing Next.js repository remains the host, but the dark 3D homepage architecture is not the foundation for the final visual direction.

## 2. Inputs already locked

- [Portfolio V1 source of truth](../README.md)
- [Blueprint summary](../blueprint-summary.md)
- [V1 scope](../scope-v1.md)
- [Content and asset contract](../content-asset-contract.md)
- [Gallery photo intake](../gallery-photo-intake.md)
- [Flagship evidence audit](../flagship-evidence-audit/evidence-audit-report.md)
- [Motion storyboard](../motion-storyboard.md)
- [Design contract](./DESIGN.md)
- [Target architecture](./ARCHITECTURE.md)

Public roles:

| Project        | Role                               |
| -------------- | ---------------------------------- |
| Fradium        | **Leader & Full-Stack Developer**  |
| Nova AI Wallet | **Full-Stack & AI Builder**        |
| PayGate        | **Founder & Full-Stack Developer** |
| Quorum         | **Full-Stack Product Builder**     |

PayGate is presented as an active product awarded a verified **$5,000 SCF Instaward**. Nova and Quorum are presented positively as ambitious hackathon artifacts.

## 3. Current baseline

The baseline passes a production build and TypeScript, but it is not suitable to extend toward the locked concept.

| Area                         | Current state                                            | V1 implication                                                                              |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Homepage boundary            | One 861-line Client Component                            | Recompose from Server Components and bounded client leaves                                  |
| Hero                         | R3F/Three.js scene, postprocessing, pointer interaction  | Remove from V1 after replacement parity                                                     |
| Initial JS                   | 214.9 KB gzip                                            | Must fall below 175 KB total; route-owned initial target is <=18 KB on the measured runtime |
| Eligible desktop WebGL chunk | 328.2 KB gzip                                            | Must become zero homepage WebGL requests                                                    |
| No-JavaScript                | 20 opacity-zero wrappers; 0 of 7 `h2` headings visible   | Critical content must be server-visible at first paint                                      |
| Accessibility                | 17 serious contrast nodes; missing interaction semantics | Zero serious/critical axe findings and complete keyboard path                               |
| Content                      | Project facts mixed with icons/colors/presentation       | Migrate to validated YAML/MDX records                                                       |
| Routes                       | `/work` and `/contact` redirect to hash anchors          | Implement real static routes and case studies                                               |
| Testing                      | No unit, E2E, accessibility, visual, or Lighthouse suite | Add proportional automated and manual gates                                                 |
| Toolchain                    | Next 16 runtime with `eslint-config-next` 15             | Align versions in a dedicated verified change                                               |

Two user-owned modifications currently exist in the exact legacy files that the migration will replace. They remain untouched during planning and must be preserved before destructive cleanup.

## 4. Delivery strategy

### Golden vertical slice first

Fradium is the first complete slice across:

- validated project record;
- real media package;
- homepage explorer;
- responsive behavior;
- signature GSAP transition;
- full case-study route;
- metadata and source links;
- no-JavaScript and reduced-motion fallback;
- performance and accessibility measurement.

The other three flagships are not implemented through bespoke components. They enter the approved schema and component system after the Fradium slice proves it.

### Static semantics before motion

For every surface:

1. build the semantic, responsive, no-JavaScript form;
2. validate content and accessibility;
3. add a bounded client enhancement;
4. measure bundle and interaction cost;
5. retain the enhancement only if it improves comprehension.

### Replace before remove

Legacy routes/components are deleted only after the replacement route passes content, visual, responsive, accessibility, and performance parity. This keeps migration reversible and protects existing user changes.

## 5. Phased implementation

### Phase 0 — Protect the baseline and promote the source of truth

Purpose: remove ambiguity before code changes.

Work:

- record the exact current branch/SHA, preserve the two existing user modifications in an approved safety commit/branch or explicit patch, and establish a clean agreed base for every implementation branch;
- capture desktop and mobile baseline screenshots plus current build/bundle measurements;
- promote the approved blueprint, `DESIGN.md`, architecture, and development plan into tracked documentation;
- mark the old reactor/3D direction documents as superseded and retain them only as historical context if useful;
- replace the boilerplate README with local setup, content validation, QA, and publishing instructions;
- create the implementation epic and child issues through the standard GitHub workflow.

Exit gate:

- no unaccounted user work can be lost;
- one tracked source of truth exists;
- each development slice has an issue, dependency, acceptance criteria, verification plan, and branch.

### Phase 1 — Design, toolchain, and content foundations

Purpose: make layout and data reusable before page work.

Work:

- implement the light editorial tokens, Geist typography scale, grid, spacing, rules, focus, and media primitives;
- remove theme switching from the new shell path;
- align Next.js and `eslint-config-next` major versions, then re-run baseline checks;
- pin the supported Node/npm runtime and add self-contained `typecheck`, content validation, test, E2E, a11y, analysis, and Lighthouse scripts;
- begin the YAML/MDX work with a pinned Next 16.2.10/Turbopack compatibility spike;
- create Zod project, evidence, claim, link, media, moment, and site schemas;
- keep pure parsers/validators separate from an `import "server-only"` filesystem repository and referential validation;
- wire deterministic content validation into `prebuild`; keep external URL reachability as a separate retrying report;
- seed the four canonical slugs: `fradium`, `nova-ai`, `paygate`, and `quorum`;
- review the GitHub/current-data inventory and seed the selected non-flagship archive projects as `brief` records with the minimum public copy, lifecycle, role, link, and media contract;
- implement only V1 fields and MDX/media renderers that an approved record actually consumes;
- establish the photo/project derivative pipeline and asset-license manifest; use community/library assets only as licensed technique references and create the final diagram, redaction, caption, and Open Graph templates in-house;
- create reusable shell, grid, rule, metadata, action-link, media-frame, and caption components.

Exit gate:

- `npm run validate:content`, typecheck, lint, and build pass;
- sample records fail correctly for missing evidence, broken slug references, private/planned public media, or missing alt text;
- foundation screenshots match the design contract at desktop, tablet, and mobile;
- no project-specific visual component exists.

### Phase 2 — Static shell and route skeletons

Purpose: establish the complete semantic website without signature motion.

Work:

- make the root layout neutral, move the current chrome/styles into a `(legacy)` route-group layout, and build the new metadata, skip link, header, navigation, footer, and tokens inside a scoped `(v1)` route-group layout;
- implement a server-first homepage skeleton in the locked section order;
- replace redirect-only `/work` with a real static archive;
- add `/work/[slug]` with static params, per-project metadata, and publication handling;
- replace redirect-only `/contact` with direct email, GitHub, LinkedIn, and résumé links;
- verify no reachable legacy UI consumes `/api/contact`, then disable/remove the unprotected endpoint in this route phase; defer dead email/form dependency cleanup to Phase 8B;
- add `not-found`, `sitemap`, and `robots` behavior;
- keep `/moments` gated until its publication rule passes;
- add the temporary `/preview/open-proving-ground` composition, enabled only by `PORTFOLIO_V1_PREVIEW=1`, protected by a deployment-secret `PORTFOLIO_V1_PREVIEW_TOKEN`, marked `private, no-store` and `noindex`, and omitted from navigation/sitemap;
- implement the full case-study structural template without project-specific forks;
- implement the server-only YAML `ProjectBriefPage` used by published non-flagship routes.

Exit gate:

- route structure and fixture tests work, while draft/preview project records remain absent from public queries until their real evidence is ready;
- every public route has one clear `h1`, unique metadata, and canonical navigation;
- JavaScript-disabled navigation, archive, project summaries, and direct contact work;
- the legacy root retains visual parity; preview env off returns 404, missing/invalid credentials fail closed, valid env/token credentials return 200 plus `private, no-store` and `noindex`, and preview stays out of navigation/sitemap;
- no placeholder frame appears in production output.

### Phase 3A — Fradium static golden vertical slice

Purpose: approve the real content, evidence, responsive composition, and semantics before GSAP is introduced.

Work:

- curate the smallest Fradium media package that proves product reality, system reasoning, and verification;
- finalize the English opening thesis/layout and its CSS-only decorative reveal;
- write the final English Fradium project record and case study;
- implement the static four-project explorer markup with Fradium selected;
- build separate direct project links and evidence-preview buttons;
- implement the contact sheet, selected evidence frame, facts, captions, source links, and live/source actions;
- author the static tablet, mobile, keyboard, and no-JavaScript behavior;
- create Fradium Open Graph media from authentic project material.

Static approval gate:

- Wildan approves the Fradium content hierarchy, evidence selection, case-study readability, and one desktop/mobile visual checkpoint;
- all four project links and summaries work with keyboard, touch, and JavaScript disabled;
- preview controls use the locked button-group semantics;
- Fradium case study is accurate, positive, and credits collaborators;
- static accessibility, media, and layout budgets pass.

### Phase 3B — Fradium motion golden prototype

Purpose: add the one signature enhancement to an already approved semantic slice.

Work:

- add `@gsap/react`;
- add the GSAP contact-sheet-to-frame transition as a bounded client island;
- lazy-load the GSAP/ScrollTrigger island only when the explorer approaches or receives explicit preview intent;
- derive sticky eligibility and scroll distance from real media, not fixed storyboard guesses;
- author wide-static, sticky-eligible, tablet, mobile, reduced-motion, rapid-selection, resize, and interruption behavior;
- verify cleanup, off-screen behavior, and temporary overlay/layer ownership.

Motion approval gate:

- Wildan approves the signature behavior on the environment-gated preview route;
- the explorer works with pointer, keyboard, touch, reduced motion, and JavaScript disabled;
- semantic selected content updates immediately while focus stays on the triggering control;
- animation remains interruptible and leaves no duplicate overlay/caption/ID;
- bundle, media, axe, and lab-performance budgets pass before replication.

If this gate fails, improve the single slice. Do not duplicate an unresolved interaction across three more projects.

### Phase 4 — Nova, PayGate, and Quorum case studies

Purpose: prove the architecture is content-driven.

Work:

- complete the three project records and evidence packages;
- write positive, technically specific English case studies through the shared template;
- migrate canonical slugs and verified links;
- present Nova as an award-recognized hackathon artifact and AI-agent experiment;
- present PayGate as the active founder-led product and place the verified $5,000 Instaward beside its sources;
- present Quorum as an ambitious Stellar hackathon build with clear system thinking;
- include role/team, constraint, decision, flow, evidence, outcome, current state, and next iteration for each;
- feed all records into the same explorer and archive queries;
- add route-specific metadata and authentic Open Graph media.

Exit gate:

- adding each project required content/media work, not a new section component or timeline;
- all four routes pass content validation and return 200 when published;
- claims and external outcomes have valid provenance;
- owner-attested responsibilities use the approved role labels;
- hackathon context is visible but never framed as an apology.

Implementation checkpoint — Issue #15:

- 13 ready evidence assets now cover the remaining three flagships: authentic
  product surfaces, system maps, source/testnet/hardening ledgers, a settlement
  correction, the Nova award photograph, and an original PayGate Instaward
  citation plate;
- all three use the existing explorer, case-study template, metadata selector,
  no-JavaScript fallback, and one lazy GSAP module with no project-specific React
  component or timeline;
- a media-load race exposed by switching into a previously hidden project is now
  handled before ScrollTrigger creates its visual overlay;
- the homepage stays at 167.69 KiB initial JavaScript with zero pre-intent
  enhancement bytes; the lazy enhancement measures 45.13 KiB after the new
  load-safe lifecycle;
- content validation, 21-file media audit, responsive/no-JavaScript browser tests,
  axe across all flagship surfaces, and desktop/mobile visual checkpoints pass;
- records remain `preview` until checkpoint D approves the exact derivatives;
  Nova's award photo additionally needs final photographer credit and public-release
  consent.

### Phase 5 — Complete homepage and moments system

Purpose: finish the portfolio narrative around the flagship work.

Implementation status (Issue #17):

- the explicit four-mode schema, shared narrative gate/order, six curated preview
  records, SSR gallery components, homepage/archive composition, authenticated
  preview route, responsive styling, and publication validation are implemented;
- a reusable local workflow produces seven sRGB, metadata-free, redacted,
  byte-bounded review crops without copying masters into tracked files;
- the public derivatives and `/moments` publication flip remain at checkpoint E
  until exact dates/places, credits, rights/consent, captions, and crops are approved.

Work:

- retain the approved opening thesis/layout and complete its immediate Work, GitHub, Contact, and résumé links;
- add the selected moments section using approved documentary derivatives only;
- implement `lead`, `contact-sheet`, `evidence`, and `portrait` photo modes through shared components;
- map captions, event/date/place, related project or journey context, credit/consent, crop policy, focal point when cropped, and alt text from records;
- add the short `Currently building` signal and durable `/work` link;
- add a concise About and direct-contact close;
- publish `/moments` only if multiple distinct events form a real narrative; otherwise keep the homepage selection only;
- verify every public social/contact URL and remove `#` placeholders.

Exit gate:

- no filler photo or empty asset frame appears;
- photo masters remain outside the repository and public files contain no unnecessary metadata;
- the homepage tells a coherent sequence without an organization timeline, generic skill grid, or card wall;
- mobile crops preserve faces, awards, signage, and relevant context.

### Phase 6 — Motion production hardening

Purpose: keep the experience sophisticated without recreating the old performance problem.

Work:

- keep GSAP + CSS as the only motion stack;
- scope `useGSAP()` and clean up all timelines/ScrollTriggers on unmount and media-query changes;
- ensure one owner for explorer selection and any approved figure/moment sequence; the opening stays CSS-only;
- validate rapid switching with overwrite/cancellation;
- pause off-screen video and inactive motion;
- remove temporary `will-change` after transitions;
- verify no nested ScrollTriggers, blanket section reveals, pointer followers, or page-wide scroll smoothing;
- remove travel/pinning/parallax entirely under reduced motion.

Implementation checkpoint — Issue #19:

- a previously failed lead image now returns directly to the static profile on
  revisit instead of waiting forever for an `error` event the browser will not
  emit twice;
- delayed overlay cleanup is cancellable and identity-safe, so a leave/re-enter
  interruption cannot remove the newly active visual;
- live reduced-motion and Save-Data changes, coarse pointer, active resize,
  repeated eligibility cycles, route replacement, history traversal, failed
  media, and failed lazy chunks are covered against the production build;
- the representative route matrix now covers 1440, 1120, 1024, 768, 640, 390,
  and short-desktop viewports, with responsive no-JavaScript fallbacks at 640
  and 390 pixels;
- a credential-gated, noindex Moments layout fixture exercises lead, evidence,
  portrait, and contact-sheet media using existing project derivatives only;
  pending real Moments records no longer inherit an empty media column;
- skip-link landing, visible focus, minimum 24×24 action targets, internal
  diagram scrolling, document overflow, overlay cleanup, and listener balance
  are regression-tested;
- the protected production preview measures 167.69 KiB initial JavaScript,
  2.03 KiB route-owned JavaScript, 0 pre-intent enhancement bytes, 45.17 KiB
  post-trigger GSAP, 26.08 KiB CSS, 87.11/50.67 KiB desktop/mobile initial
  media, and zero WebGL/runtime failures; all locked V1 budgets pass;
- the three-run mobile Lighthouse median is 0.94 performance, 1.00
  accessibility, 1.00 best practices, 3.03 s LCP, 0 CLS, and 23.5 ms TBT under
  the temporary protected-preview profile. The stricter public SEO and 2.5 s
  LCP gates remain Phase 8A release checks after root cutover.

Exit gate:

- primary content is visible and interactive before motion completes;
- motion uses transform/opacity and introduces no layout shift;
- every enhanced sequence has a static final state and a keyboard/touch path;
- low-end test hardware shows no sustained jank or runaway main-thread activity.

### Phase 7 — Responsive, accessibility, performance, SEO, and visual QA

Purpose: turn the complete build into a release candidate.

Work:

- run the [QA matrix](./QA_MATRIX.md) across viewports, browsers, input modes, reduced motion, no JavaScript, zoom, and constrained network/CPU;
- resolve visual inconsistencies against both locked reference images and `DESIGN.md`;
- test keyboard order, visible focus, skip link, sticky-header offsets, announcements, and target sizes;
- run axe and manual screen-reader smoke checks;
- enforce JavaScript, CSS, media, LCP, CLS, and responsiveness budgets;
- verify route metadata, canonical URLs, Open Graph images, sitemap, robots, and broken links;
- add screenshot baselines for the homepage, work archive, Fradium case study, moments, and mobile menu;
- make unexpected browser console errors fail E2E.

Release-candidate gate:

- zero axe serious/critical findings;
- all required routes, links, content checks, tests, lint, typecheck, and build pass;
- no horizontal overflow at the supported viewports or 200% zoom;
- performance budgets in section 7 pass;
- visual QA has no unresolved high-priority mismatch.

### Phase 8A — Release candidate and root switch

Purpose: validate and approve the complete V1 before destructive cleanup.

Work:

- deploy the complete environment-gated preview and run final content/link/source verification;
- obtain the release-candidate approval checkpoint;
- switch the root route to the approved server-first homepage;
- remove the temporary preview route only after the root composition is verified;
- re-run the complete production route, visual, no-JavaScript, reduced-motion, accessibility, bundle, media, and Lighthouse checks;
- confirm the old system is now unreachable but leave destructive source/dependency deletion to Phase 8B.

Exit gate:

- clean-install CI and root-route preview checks pass;
- V1 is the only reachable public composition;
- legacy source is still recoverable and has not been mixed into the root-switch diff;
- Wildan explicitly approves cleanup to proceed.

### Phase 8B — Post-cutover legacy cleanup

Purpose: remove the old system only after the replacement and root switch are safe.

Work:

- remove the observatory scene, old homepage, MagicBento, old section set, and other unreachable UI;
- remove any remaining email/form code for V1 unless a separately scoped secure form replaces it;
- delete unused public assets after a verified reference scan;
- remove Three/R3F/postprocessing, Framer Motion/`motion`, `next-themes`, React Bits, and unused form/Radix/email/toast dependencies;
- run dependency/import and public-asset reachability scans;
- verify production output has no WebGL request or old dark-theme code path;
- run the complete release checks from a clean install;
- deploy the cleanup preview, compare it against the approved release candidate, then request Wildan's explicit merge/release approval.

Exit gate:

- clean-install CI and preview checks pass;
- only intentional dependencies and assets remain;
- old project/user work is preserved in Git history;
- the cleanup PR merges only after explicit approval and preserves the approved live output.

## 6. Approval checkpoints

| Checkpoint               | Decision                                                       |
| ------------------------ | -------------------------------------------------------------- |
| A — Foundation           | Tokens, typography, grid, shell, mobile foundation             |
| B — Fradium static slice | Content structure, evidence selection, case-study readability  |
| C — Fradium motion slice | Signature interaction, reduced motion, keyboard/touch behavior |
| D — Four flagships       | Roles, narrative tone, claims, links, media packages           |
| E — Moments              | Exact photographs, crops, captions, rights/consent             |
| F — Release candidate    | Visual quality, performance, accessibility, final content      |

No later checkpoint should force project-specific architecture changes. If it does, the shared contract is corrected first.

Every checkpoint produces the same review packet:

- preview URL;
- 1440×900 and 390×844 screenshots for the affected surface;
- content diff and exact assets under review;
- current bundle/media/accessibility results where applicable;
- a written `approve` or `revise` decision with unresolved notes.

## 7. Non-negotiable budgets

| Metric                                                |                                                                            Budget |
| ----------------------------------------------------- | --------------------------------------------------------------------------------: |
| Homepage cold-navigation client JavaScript            |                         `<=175 KB` gzip total; route-owned initial code `<=18 KB` |
| Case-study cold-navigation client JavaScript          |                         `<=170 KB` gzip total; route-owned initial code `<=12 KB` |
| Lazy explorer enhancement                             | `<=60 KB` gzip, loaded only near explorer/explicit intent and reported separately |
| Homepage WebGL/Three request                          |                                                                               `0` |
| Initial CSS                                           |                                                                    `<=30 KB` gzip |
| LCP image                                             |                                             `<=200 KB` desktop; `<=140 KB` mobile |
| Initial above-fold media                              |                                             `<=750 KB` desktop; `<=500 KB` mobile |
| Lab mobile LCP                                        |                                                                         `<=2.5 s` |
| Lab mobile CLS                                        |                                                                           `<=0.1` |
| Lab mobile TBT                                        |                                                                        `<=200 ms` |
| Explorer input → semantic selected state + next paint |                           `<=200 ms`; visual transition may continue `650–850 ms` |
| Field p75 after enough traffic                        |                                        LCP `<=2.5 s`, INP `<=200 ms`, CLS `<=0.1` |
| Axe                                                   |                                                `0` serious or critical violations |

The committed CI budget script defines `initial client JavaScript` as the gzip sum of framework/runtime, shared, and route client chunks requested or prefetched from a cold production navigation before user intent. Media, font transfers, CSS, and chunks loaded only after an explicit action or explorer approach are reported separately; development tooling is excluded from the production build measurement. A request captured before intent counts even when the framework labels it lazy. The same script/configuration is used locally and in CI.

Runtime calibration on 11 July 2026 first measured a 145.141 KB gzip total
initial floor from a server-only fixture on Node 24.18.0 and Next 16.2.10.
Issue #11 then measured the real production V1 route's shared-runtime floor at
169.637 KB. Issue #13 measured the production semantic explorer enhancer at a
171.719 KB cold total with zero pre-intent enhancement bytes. The homepage
ceiling is narrowly rebaselined to 175 KB in `quality/budgets.json`; the
server-only case-study ceiling remains 170 KB, and the separate 18 KB and 12 KB
route-owned limits did not move.

## 8. Main risks and mitigations

| Risk                                                           | Mitigation                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Existing user edits overlap migration targets                  | Preserve them before cleanup; replacement-first, deletion-last                        |
| Blueprint is currently ignored while obsolete docs are tracked | Promote approved contracts before implementation                                      |
| Real evidence/media arrives unevenly                           | Publication states and asset gates; never fabricate placeholders                      |
| Signature motion expands scope                                 | Fradium-only prototype and approval gate before replication                           |
| GSAP harms semantics or no-JS                                  | Server markup first; client overlay is inert and optional                             |
| Project copy drifts from evidence                              | Zod records, source links, owner attestation, `lastVerifiedAt`                        |
| Multiple animation libraries remain                            | GSAP + CSS ownership; remove Framer Motion and `motion` after parity                  |
| Asset cleanup deletes valuable originals                       | Public derivatives only; private masters outside repo; reference scan before deletion |
| Toolchain upgrade causes unrelated regressions                 | Dedicated issue/PR with clean-install build and browser smoke test                    |
| `/moments` becomes filler                                      | Publish gate based on narrative diversity, not file count                             |

## 9. Definition of done

V1 is complete only when:

- the four flagship stories use the approved roles and positive context;
- every published flagship proves product reality, system reasoning, and verification;
- all required routes are real, static where expected, metadata-complete, and directly navigable;
- future projects can be added through content and media records;
- the homepage and case studies remain useful without JavaScript and with reduced motion;
- desktop, tablet, and mobile are authored and visually approved;
- performance, accessibility, content, test, lint, typecheck, build, SEO, and link gates pass;
- the old 3D/client-heavy system and dead dependencies are removed only after parity;
- the implementation lives in reviewed issue-linked PRs;
- Wildan explicitly approves the release/merge.
