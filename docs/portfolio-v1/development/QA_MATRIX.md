# QA Matrix — Portfolio V1

Date: 11 July 2026
Status: **release contract**

## 1. Quality strategy

QA is layered:

1. content and schema tests prevent invalid stories/assets from publishing;
2. component/state tests cover selection and interruption logic;
3. browser tests cover routes, semantics, keyboard, no-JavaScript, and reduced motion;
4. automated accessibility and performance checks catch regressions;
5. visual review checks authored quality against the locked references;
6. manual device and assistive-technology checks validate what automation cannot.

Issue 01 locks versions that are compatible with the actual Next.js runtime. The expected tool categories are a lightweight unit runner, Playwright-class browser automation, axe, Lighthouse, and production bundle reporting.

## 2. Standard command contract

```bash
npm ci
npm run validate:content
npm run lint -- --max-warnings=0
npm run typecheck
npm run test
npm run test:e2e
npm run test:a11y
npm run build
npm run analyze:bundle
npm run lighthouse
```

Expected tiers:

| Stage | Required checks |
|---|---|
| Local iteration | affected tests, content validation, typecheck |
| Before PR update | lint, typecheck, tests, affected screenshots, build when routing/config changes |
| CI | clean install, content, lint, typecheck, unit, E2E smoke, build |
| Release candidate | every command plus full browser/mode matrix and manual review |

## 3. Viewports

| Viewport | Purpose |
|---|---|
| 1440×900 | Primary desktop visual composition |
| 1280×800 | Common laptop and shorter viewport |
| 1120×760 | Proposed sticky-enhancement threshold boundary |
| 1024×768 | Short desktop/tablet boundary; sticky should gracefully disable if unsafe |
| 768×1024 | Authored tablet portrait |
| 390×844 | Primary mobile |
| 360×800 | Narrow mobile |
| Desktop at 200% zoom | Reflow, focus visibility, sticky-header safety |

The test fails if body-level horizontal overflow exists. It may not be hidden by a global overflow rule.

## 4. Browsers and modes

| Dimension | Required |
|---|---|
| Engines | Chromium, WebKit, Firefox |
| Input | Pointer, touch emulation, keyboard-only |
| Motion | Default and `prefers-reduced-motion: reduce` |
| JavaScript | Enabled and disabled |
| Network/CPU | Slow 4G plus mobile CPU throttling for lab performance |
| Data preference | Save-Data when any product loop exists |
| Zoom/text | 200% browser zoom and enlarged text smoke test |
| OS theme | Light and dark OS preference; site remains correctly light-only |
| Assistive tech | VoiceOver/Safari smoke; TalkBack/Chrome smoke when a physical Android test is available |

## 5. Content and publication tests

Required automated cases:

- every project and moment record parses successfully;
- `draft` records never enter public queries/routes/navigation/metadata/sitemap;
- `preview` records appear only with `PORTFOLIO_V1_PREVIEW=1`, always `noindex`, and remain absent from production navigation/sitemap;
- `published` flagships are `full` and reference only ready assets; published non-flagships may be `brief`;
- duplicate slug/ID fails;
- homepage reference to an unknown slug fails;
- all published flagships have role, lifecycle, dates, team context, and case-study state;
- product-reality, system-reasoning, and verification gates are represented;
- published claims have allowed provenance;
- Wildan's role accepts owner attestation;
- third-party awards/grants require source records and verification dates;
- a public link has a valid URL and `lastVerifiedAt`;
- a private/offline/unavailable link has no fake URL;
- a published media item has dimensions, alt text, a valid intrinsic/focal crop policy, valid provenance/rights, and a ready state;
- a published documentary photo has credit, rights, consent, caption, and focal data when cropped;
- a published moment has event, date, place, and either a non-empty related-project context or an explicit journey-context label;
- every third-party/community asset has a recorded source, license decision, and required attribution;
- planned/private/missing media cannot enter a public renderer;
- the `/moments` publication gate controls route, navigation, and sitemap together;
- canonical slugs are exactly `fradium`, `nova-ai`, `paygate`, and `quorum` for the four flagships.

Manual content review:

- project roles match Wildan's approved wording;
- Nova and Quorum are positively framed as hackathon artifacts;
- PayGate's active-product status and $5,000 Instaward stay within the sourced claim scope;
- collaborator credit is generous and visible;
- `What I'd improve next` is constructive, not an apology section;
- no fake metric, user count, partnership, deployment, or production claim appears.

## 6. Route and document tests

Required:

- `/`, `/work`, `/work/fradium`, `/work/nova-ai`, `/work/paygate`, `/work/quorum`, and `/contact` return 200 when publishable;
- every `published + brief` project appears in `/work`, static params, metadata, and sitemap, and its `/work/{slug}` renders a server-only brief without empty MDX chapters or flagship motion;
- unknown, draft, and preview-with-env-off case-study slugs return the intended not-found behavior; preview-with-env-on may return 200 but remains `noindex`;
- `/moments` follows its gate;
- `/preview/open-proving-ground` returns 404 with the preview env disabled, returns 200 plus `noindex` when enabled, never appears in navigation/sitemap, and is absent after root cutover;
- navigation works from a direct deep link, not only from homepage state;
- browser back/forward restores useful state without replaying an aggressive intro;
- every route has one `h1`, ordered headings, landmarks, title, description, canonical URL, and Open Graph image;
- sitemap and robots expose only intended routes;
- all internal links and public source/live/GitHub/contact links resolve or are explicitly marked unavailable;
- external reachability uses retries and a report; a bot-protected source such as X receives manual verification rather than making the deterministic build fail;
- no `href="#"` placeholder remains.

## 7. No-JavaScript and progressive-enhancement tests

With JavaScript disabled:

- Wildan's name, positioning, thesis, and primary links are visible;
- every homepage section heading and essential sentence is visible;
- all four flagship summaries, posters, roles/outcomes, and case-study anchors are present;
- `/work` and every case study are readable;
- header navigation works or exposes a semantic fallback;
- direct contact works;
- no loader, opacity-zero wrapper, blank frame, or hydration-dependent copy remains.

With JavaScript enabled:

- enhancement does not replace anchors with click-only containers;
- evidence preview buttons are separate from project links;
- selected semantic content updates immediately;
- visual overlays never duplicate accessible content.

## 8. Evidence explorer tests

Functional:

- Fradium is initially selected from content order;
- each project link navigates directly;
- each preview button updates selected state and its controlled panel;
- the first selection updates semantic state and the next painted frame immediately even when the lazy GSAP chunk has not finished loading; motion may enhance only after it is ready;
- rapid selection cannot leave a stale image, caption, selection state, or overlay;
- resizing across desktop/tablet/mobile destroys and recreates only the correct enhancement context;
- scroll/sticky release does not trap or jump the page;
- off-screen/inactive motion and video pause as designed;
- route unmount removes timelines, listeners, overlays, and ScrollTriggers.

Accessibility:

- each preview control has an accessible name, selected/pressed state, and control relationship;
- focus remains on the activating button;
- a concise live status announces selected project changes without chatter;
- project links remain anchors in the tab order;
- overlay is `aria-hidden`, inert, unfocusable, and contains no IDs, links, buttons, or duplicate captions;
- hover has an equivalent focus-visible state;
- touch does not depend on hover.

Motion:

- default project switch completes in the approved 650–850 ms range;
- only transform/opacity is animated in the expansion path;
- image/frame dimensions are reserved and CLS remains within budget;
- reduced motion performs an immediate or <=150 ms static handoff with no travel, pin, scrub, or parallax;
- mobile uses the 250–400 ms in-flow change and mounts no desktop sticky timeline.

## 9. Accessibility gates

Automated:

- zero axe serious or critical violations on required routes and key states;
- automated checks run after explorer selection and mobile-menu open state, not only at first paint.

Manual:

- skip link is first useful focus and lands on main content;
- visible focus is never clipped or hidden beneath sticky UI;
- keyboard order follows reading order;
- all actions work with Enter/Space according to native semantics;
- no focus trap exists outside a true modal;
- normal text contrast is at least 4.5:1;
- large text and meaningful non-text UI contrast are at least 3:1;
- primary controls provide a 44×44 target where practical; compact grouped controls meet at least 24×24 with adequate spacing;
- captions, alt text, and source labels provide equivalent context;
- decorative rules, overlays, and imagery stay outside the accessibility tree;
- at 200% zoom, content reflows and no essential relationship is lost.

## 10. Media and gallery tests

- every image has intrinsic width/height and produces no layout shift;
- responsive `sizes` reflect the authored layout;
- the LCP image is prioritized deliberately and not duplicated;
- below-fold media loads lazily;
- product UI remains readable at mobile crop;
- focal point metadata preserves faces, awards, signage, and relevant context;
- photo public derivatives contain no unnecessary EXIF/location metadata;
- captions remain outside images and readable;
- missing or broken media fails validation rather than producing a production placeholder;
- video has a poster, textual alternative, and visible controls when required;
- video autoplay obeys muted/inline/visibility/motion/Save-Data conditions;
- inactive video and animation stop outside the viewport.

## 11. Performance gates

Measure from a production build with a fresh browser profile. Report media separately from JavaScript/CSS.

| Metric | Gate |
|---|---:|
| Homepage cold-navigation client JS | `<=170 KB` gzip total; route-owned initial code `<=18 KB` |
| Case-study cold-navigation client JS | `<=165 KB` gzip total; route-owned initial code `<=12 KB` |
| Lazy explorer enhancement | `<=60 KB` gzip and absent from cold navigation before explorer approach/intent |
| Homepage WebGL/Three requests | `0` |
| Initial CSS | `<=30 KB` gzip |
| LCP image | `<=200 KB` desktop; `<=140 KB` mobile |
| Initial above-fold media | `<=750 KB` desktop; `<=500 KB` mobile |
| Lab mobile LCP | `<=2.5 s` |
| Lab mobile CLS | `<=0.1` |
| Lab mobile TBT | `<=200 ms` |
| Explorer input → semantic selected state + next paint | `<=200 ms`; non-blocking visual transition may continue `650–850 ms` |
| Field p75 after enough RUM | LCP `<=2.5 s`, INP `<=200 ms`, CLS `<=0.1` |

Method:

- use one committed CI script that reads the production route/client chunk map and gzip-computes the framework/runtime, shared, route-owned, and lazy enhancement sets;
- define initial JavaScript as every JS chunk requested or prefetched during a cold production navigation before user intent; explorer-approach/explicit-intent chunks are measured in the separate enhancement budget;
- make `test:e2e`, `test:a11y`, `analyze:bundle`, and `lighthouse` self-contained: build when required, start a production server on the documented deterministic port, wait for readiness, run, and always stop it;
- run at least three cold Lighthouse samples on the agreed machine/profile and record the median;
- include any chunk downloaded/prefetched before intent in the practical page budget;
- capture an explorer selection performance trace and inspect long tasks/layout shifts;
- verify no continuous pointer/background repaint exists;
- verify `will-change` is temporary and bounded;
- document device, browser, network, CPU, date, and commit for each report.

## 12. Visual QA checklist

Compare against [DESIGN.md](./DESIGN.md), the [editorial visual base](../references/visual-base-editorial.png), and the [evidence interaction reference](../references/interaction-structure-evidence.png).

Foundation:

- cold light canvas, near-black ink, and one cobalt accent;
- Geist type hierarchy feels intentional at every breakpoint;
- shared grid and rules align across sections;
- media, not decorative chrome, holds visual dominance;
- square frames and restrained controls replace rounded dashboard cards;
- no glow, glass, scanline, ambient blob, generic card wall, or tiny-uppercase-everywhere pattern remains.

Homepage:

- name and thesis are legible immediately;
- Fradium is the only dominant opening project media;
- flagship explorer clearly distinguishes project link from preview action;
- all four items have stable rhythm despite different title lengths/content;
- moments feel documentary and connected to projects;
- About/contact closes quietly without turning into a résumé section.

Case studies:

- evidence sequence is inspectable at actual reading sizes;
- role/team and verified outcome are easy to locate;
- long prose stays within the reading measure;
- diagrams and proof have appropriate intrinsic ratios;
- source links sit close to the claims they support;
- the template feels consistent without making all projects visually identical.

Responsive:

- tablet is authored, not an accidental midpoint;
- short desktop disables unsafe sticky behavior;
- mobile product crops remain useful;
- type wrapping, caption lengths, and contact-sheet layouts are intentional;
- no hidden overflow, clipped focus, or sticky collision exists.

## 13. Console and runtime hygiene

- unexpected browser console errors fail E2E;
- warnings are not globally monkey-patched or suppressed;
- an exact known local-only Speed Insights request may be narrowly ignored if documented; broad network/console ignores are forbidden;
- no hydration mismatch, missing-key, invalid DOM nesting, stale asset, or failed media request remains;
- route navigation and viewport changes do not leak listeners or timelines.

## 14. Screenshot baseline set

Required stable baselines:

- homepage top and complete page at 1440×900 and 390×844;
- `/work` at desktop and mobile;
- Fradium case-study opening, system behavior, evidence, and outcome;
- one representative Nova/PayGate/Quorum case-study page after content completion;
- explorer default and one switched-project state;
- reduced-motion explorer final state;
- mobile menu open, when the approved header composition contains a collapsible menu;
- moments lead/contact-sheet state when published;
- contact page;
- 200% zoom smoke captures for header, explorer, and case-study prose.

Screenshot diffs are reviewed, not blindly updated. An intentional change requires a note in the PR.

## 15. Release sign-off

| Area | Owner/check | Required evidence |
|---|---|---|
| Content and roles | Wildan | Approved copy and role labels |
| Claims and sources | Developer/reviewer | Validation report and working source links |
| Photographs | Wildan | Exact crop/caption/rights approval |
| Visual | Wildan + developer | Approved desktop/mobile preview and screenshot set |
| Accessibility | Developer/reviewer | Axe report plus manual keyboard/AT notes |
| Performance | Developer/reviewer | Bundle/media report and Lighthouse results |
| Engineering | CI/reviewer | Clean install and full command suite |
| Release | Wildan | Explicit merge/deploy approval |

No release is declared complete from screenshots alone. Content, semantics, performance, accessibility, and maintainability are equal parts of the acceptance contract.
