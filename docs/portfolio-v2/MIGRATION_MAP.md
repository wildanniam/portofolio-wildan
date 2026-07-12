# Migration Map — V1 to Personal Field Notes

## 1. Safety model

- V2 begins in a protected preview namespace.
- V1 public behavior remains unchanged until Checkpoint F.
- New styles are scoped under `[data-portfolio-v2]`.
- Root cutover is one reviewable change, not weeks of partial public mutation.
- Cleanup happens after cutover, not during the golden slices.

## 2. Keep, adapt, retire

| Current area | Decision | V2 treatment |
| --- | --- | --- |
| Content schemas and repository | Keep + extend | add Moment category and asset-slot validation |
| YAML/MDX project records | Keep | revise public copy only through content review |
| Claim/provenance system | Keep | keep sources structured; make public tone less defensive |
| Publication and preview auth | Keep | add V2 protected preview routes |
| `/work` and `/work/[slug]` | Keep + restyle | new index and shared case-study composition |
| `/moments` | Keep + recompose | category-aware editorial grid and lightbox |
| `/contact` | Keep + restyle | editorial close and direct links |
| Foundation components | Adapt selectively | preserve semantics; replace visual namespace |
| Evidence components | Adapt | reuse in case studies, never as homepage dashboard |
| Project explorer | Retire | replace with equal-weight project overview |
| Explorer GSAP/ScrollTrigger | Retire | replace with bounded cover sequence and CSS states |
| V1 moments sequence | Rewrite composition | preserve records and media helpers |
| V1 tokens and Geist fonts | Supersede | Personal Field Notes tokens and Instrument pair |
| Tests and quality scripts | Keep + update | replace explorer expectations with overview/gallery expectations |
| Legacy V5 3D UI | Defer then retire | remove after V2 root cutover and tracing |

## 3. Target route staging

```text
/preview/personal-field-notes/foundations
/preview/personal-field-notes/home
/preview/personal-field-notes/work/[slug]
/preview/personal-field-notes/moments
```

Preview routes inherit the existing fail-closed authentication, `private,
no-store`, and `noindex` policy.

Final public routes remain:

```text
/
/work
/work/[slug]
/moments
/contact
```

## 4. Component migration

| Current | Target | Notes |
| --- | --- | --- |
| `PortfolioHomeSkeleton` | `PortfolioHome` | rewrite section order and composition |
| `ProjectExplorer` | `ProjectOverviewGrid` | ordinary links; no selection state |
| `ProjectExplorerIsland` | none | delete after cutover |
| explorer enhancer/motion policy | cover motion module | do not reuse sticky/overlay logic |
| `MomentsSection` | `MomentsTeaser` + `MomentsArchive` | reuse data queries, revise composition |
| `MomentFigure` | `MomentFigure` | preserve semantics and media policy |
| `ProjectPage` primitives | V2 case-study primitives | restyle and simplify public narrative |
| `ActionLink` | V2 `ActionLink` | semantics retained; visual state rewritten |
| `EditorialGrid` | V2 `EditorialGrid` | retain idea; implement V2 grid tokens |
| `SiteHeader/Footer` | V2 shell | same routes, approved composition |

## 5. Data migration

Do not rewrite working records wholesale.

Required schema additions should be additive and migrated with fixtures:

```ts
type MomentCategory = "build" | "win" | "learn" | "give";
```

Homepage additions may include an explicit project order and achievement-summary
claim IDs. Derived presentation data belongs in DTO/query code, not YAML copied
across multiple files.

## 6. Switch-over sequence

1. approve V2 docs and base SHA;
2. implement and approve protected foundation preview;
3. implement and approve static homepage;
4. implement and approve PayGate case study;
5. migrate remaining project routes;
6. implement and approve Moments;
7. add and approve motion;
8. pass full QA and create release candidate;
9. switch public route composition to V2;
10. monitor and retain rollback path;
11. remove V1 explorer and legacy dependencies in a later PR.

## 7. Rollback

Before root cutover, rollback means disabling the V2 preview route or reverting a
slice branch. At cutover, retain the immediately previous public composition in
one known commit and document the non-destructive revert. Never use destructive
Git commands or delete V1 before the release candidate is approved.

## 8. Migration acceptance

- no user content or evidence is lost;
- no public URL regresses or changes without a redirect decision;
- no generated image becomes production evidence;
- V1 remains functional until cutover;
- V2 passes the same or stricter content, accessibility, media, and performance
  checks;
- cleanup produces no behavior or metadata regression.
