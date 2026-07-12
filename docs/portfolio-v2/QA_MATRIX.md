# QA and Acceptance Matrix — Personal Field Notes

## 1. Quality strategy

QA happens at every checkpoint. Screenshots alone are not approval: visual
comparison, semantics, interaction states, content correctness, accessibility,
performance, and runtime hygiene must agree.

Severity:

- **P0**: data loss, inaccessible primary route, broken release, security leak;
- **P1**: blocked primary path, content occlusion, false public content, major
  responsive failure, serious/critical axe finding;
- **P2**: visible polish, copy, crop, or secondary interaction defect;
- **P3**: minor refinement that does not impair the path.

No P0/P1 may remain at any approval gate.

## 2. Viewport matrix

| Name | Size | Purpose |
| --- | --- | --- |
| Wide desktop | 1440x900 | approved desktop comparison |
| Short desktop | 1440x760 | prevent vertical assumptions/occlusion |
| Compact desktop | 1120x800 | 12-column stress point |
| Tablet landscape | 1024x768 | breakpoint and navigation |
| Tablet portrait | 768x1024 | 8-column composition |
| Small tablet | 640x960 | transition to mobile |
| Mobile | 390x844 | approved mobile comparison |
| Narrow mobile | 360x800 | text/crop/tap-target stress |

Test at 1x and representative 2x image DPR where media selection matters.

## 3. Browser and mode matrix

- Chromium desktop and mobile emulation for every PR;
- WebKit for release candidate routes;
- Firefox for release candidate routes;
- JavaScript enabled and disabled;
- normal and reduced motion;
- keyboard-only;
- touch/coarse pointer;
- Save-Data or equivalent degraded enhancement test;
- authenticated preview and unauthenticated fail-closed behavior.

## 4. Route matrix

Required routes:

- `/`;
- `/work`;
- `/work/fradium`;
- `/work/nova-ai`;
- `/work/paygate`;
- `/work/quorum`;
- at least one published brief project;
- `/moments`;
- `/contact`;
- not-found;
- sitemap, robots, and representative social image;
- protected V2 preview routes in valid, invalid, and missing credential states.

## 5. Content gates

- exact public roles match the approved role table;
- PayGate grant/award wording matches verified sources and does not imply more;
- hackathon projects are positive and clearly contextualized;
- owner-attested responsibilities are not suppressed because repository proof is
  incomplete;
- all third-party metrics/outcomes have provenance;
- generated mockup copy and imagery never enter public records;
- each homepage project uses its own correct approved thumbnail;
- Moment category, date, place, caption, alt, credit, consent, crop, and focal
  point validate;
- unpublished records are absent from routes, metadata, sitemap, and navigation;
- external link audit is rerun before release.

## 6. Homepage visual gates

- identity and positioning are clear within five seconds;
- hero remains legible before fonts and animation settle;
- four flagship projects receive equal visual weight;
- project overview contains only summary-level information;
- project title, role, thumbnail, and link are correctly associated;
- achievement summaries are equal-weight and verified;
- Moments teaser shows category/event diversity;
- currently-building status is visible but not dominant;
- no image overlaps text or viewport controls;
- no horizontal document overflow;
- mobile project items stack intentionally;
- short desktop does not trigger sticky or clipped behavior.

## 7. Case-study gates

- one `h1` and logical heading hierarchy;
- back, live, source, and next-project links are ordinary semantic links;
- role/context/status are clear near the opening;
- product media is authentic and properly captioned;
- system diagrams remain readable through reflow or contained scroll;
- public facts, owner reflection, and limitations are distinguishable;
- prose remains within the approved line length;
- no page-specific fork is needed for flagship routes;
- incomplete sections disappear rather than render empty frames.

## 8. Moments and lightbox gates

- server-rendered document contains all public Moments;
- filters are progressive enhancement and expose category in text;
- category selection has active, focus, and URL/history behavior if URL state is
  implemented;
- empty categories never appear publicly;
- filmstrip has visible controls/affordance and is not autoplayed;
- lightbox opens from keyboard and pointer;
- focus enters dialog, remains contained, closes with Escape, and returns to the
  triggering image;
- next/previous controls announce the position;
- captions remain associated with the active image;
- body scroll is restored on every close/unmount/route path;
- image failure leaves useful caption/context rather than a blank panel;
- faces, boards, and signs are not cropped beyond meaning.

## 9. Motion gates

- static final content exists without JavaScript;
- cover sequence settles within 700–900ms;
- project hover/focus response completes within 180–300ms;
- focus does not move because of animation;
- animation changes transform/opacity, not layout dimensions;
- rapid navigation, resize, reduced-motion change, bfcache, and route interruption
  leave no inline-style or timeline residue;
- reduced motion displays the settled state immediately;
- coarse pointer has no hover-only dependency;
- no ScrollTrigger, pin, smooth-scroll, or pointer-following code appears without
  a new documented approval;
- no duplicate ID, duplicate media layer, or stale overlay exists.

## 10. Accessibility gates

- zero serious/critical axe findings on required routes;
- skip link becomes visible and lands correctly;
- visible focus is never clipped or hidden by media;
- semantic landmarks, headings, lists, links, buttons, figures, and captions are
  used correctly;
- icon-only buttons have accessible names;
- pointer targets are at least 24x24 CSS px, with 44px preferred for primary
  mobile controls;
- contrast is verified in rendered context, including accents and visited/focus
  states;
- content reflows at 400% zoom without two-dimensional page scrolling, except
  contained diagrams where necessary;
- alt text describes the meaningful content and does not repeat captions
  mechanically;
- decorative marks are hidden from assistive technology;
- no time limit, auto-advance, or unpausable motion exists.

## 11. Performance gates

Use `quality/budgets.json` as the executable source. V2 proposed targets are in
the development plan.

Verify:

- initial, route-owned, lazy, pre-intent, and post-trigger JavaScript;
- CSS gzip;
- initial media and largest image transfer by viewport;
- font transfer, preload use, and fallback layout shift;
- zero WebGL context requests;
- zero unexpected failed requests, HTTP errors, and page errors;
- public Lighthouse median across three mobile runs;
- LCP resource is intentional and not lazy-loaded;
- below-fold images are lazy and have explicit dimensions;
- no animation produces CLS or long main-thread tasks.

## 12. Visual comparison protocol

At each checkpoint:

1. capture implementation at the matching approved viewport;
2. place approved reference and implementation side by side;
3. evaluate hierarchy, composition, whitespace, type character, crop, color,
   density, and interaction affordance;
4. record differences as intentional, defect, or generated-mock limitation;
5. fix P0/P1 and agreed P2 differences;
6. recapture the same viewport and state;
7. create a baseline only after Wildan approves the implementation.

Do not compare from memory. Do not copy inaccurate generated text or media merely
to reduce screenshot differences.

## 13. Anti-slop review

Before release, answer yes to all:

- could this homepage still be identified as Wildan's if the name were hidden?
- do real projects and real people supply the visual specificity?
- is the first viewport more than a generic large headline plus vague copy?
- are project entries meaningfully authored rather than repeated generic cards?
- are accent colors meaningful and restrained?
- is there one coherent motion signature rather than repeated fade-ups?
- does mobile look designed rather than squeezed?
- does the whole route set feel like one publication?

## 14. Verification command contract

Expected commands, adjusted only through an explicit tooling issue:

```bash
npm run validate:content
npm run audit:media
npm run lint
npm run typecheck
npm run test:run
npm run test:foundation
npm run test:content:e2e
npm run test:e2e
npm run test:a11y
npm run analyze:bundle
npm run audit:links
npm run audit:release-routes
npm run lighthouse
npm run test:release
```

Focused PRs run their relevant subset plus build. Checkpoint F runs the complete
contract against a production build and records environment, date, SHA, and
result.

## 15. Release sign-off

Release evidence includes:

- approved desktop/mobile screenshots;
- approved motion recording and reduced-motion comparison;
- route/content/media/link audit reports;
- axe report;
- bundle and Lighthouse report;
- browser/viewport coverage table;
- known nonblocking deviations from generated references;
- tested rollback instructions;
- Wildan's explicit approval.
