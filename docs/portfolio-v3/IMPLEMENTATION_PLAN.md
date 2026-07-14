# Portfolio V3 Implementation Plan

> [!WARNING]
> Historical implementation plan. New work must follow
> [Portfolio V4 — Research / Build Atlas](../portfolio-v4/README.md).

Issue: #25  
Branch: `codex/25-portfolio-v3-integration`  
Release policy: merge only after every blocking gate passes

## Architecture decision

The validated repository, schema, and source content remain the canonical data layer. V3 replaces the presentation layer and adds small view-model helpers for editorial ordering, responsive media, outcome selection, and layout variants. Content is not duplicated into components.

The application stays server-first. Client boundaries are limited to the mobile menu, Moments filtering and lightbox, and an optional hero motion component.

## Phase 0. Preserve and baseline

- Keep the divergent original workspace untouched.
- Preserve its local main state on `codex/archive-local-main-20260714`.
- Work from a clean worktree based on `origin/main`.
- Record baseline lint, typecheck, and unit test results.

Exit gate:

- Clean integration branch.
- Baseline quality suite passes.
- Issue #25 contains the locked scope and acceptance criteria.

## Phase 1. Design lock and view models

- Add V3 design, implementation, and QA documents.
- Introduce shared responsive-media helpers.
- Introduce explicit homepage project and Moments variants.
- Introduce proof-ribbon and case-study opening view models.
- Keep all factual text sourced from validated content.
- Replace Instrument typography with the locked display and text pair.

Exit gate:

- No raw file-order or `nth-child` dependency controls editorial ordering.
- All selected media has a documented mobile and desktop behavior.
- Static build remains valid.

## Phase 2. Shared shell

- Build the V3 site header, mobile navigation, route-aware links, skip link, and footer.
- Add the V3 design tokens, spacing scale, grid, focus treatment, and responsive primitives.
- Add a reusable responsive image component that honors mobile sources and focal points.
- Add accessible link and action primitives without introducing a generic component-library skin.

Exit gate:

- Header works at 1440, 1024, 768, 390, and 320px.
- Mobile menu supports keyboard, Escape, focus trap, and focus return.
- No horizontal overflow at 200 percent zoom.

## Phase 3. Homepage golden slice

- Implement hero spread with eager portrait and static-first composition.
- Implement proof ribbon.
- Implement Project Atlas with four distinct editorial variants.
- Implement a small Moments mosaic sample.
- Implement current-build note and closing contact block.
- Add the hero assembly only after the static layouts pass review.

Exit gate:

- Desktop, tablet, and mobile screenshots match the V3 direction.
- Five-second and 30-second comprehension checks pass.
- No content is obscured during hover, focus, or scroll.
- LCP candidate is eager and stable.

## Phase 4. Work index and flagship case studies

- Replace the work index with a visual archive and stable editorial ordering.
- Create the outcome-led flagship case-study template.
- Migrate PayGate first as the golden case.
- Migrate Fradium, Nova AI Wallet, and Quorum through the same content contract without making their compositions identical.
- Keep smaller published work visible in the archive without manufacturing full case studies.

Exit gate:

- Project reality, role, outcome, and external actions appear within two viewports.
- Each flagship case has no repeated narrative block.
- Each flagship case uses at least two authentic artifacts where available and no more than one explanatory diagram by default.
- Mobile reading order is coherent and all code/media blocks fit the viewport.

## Phase 5. Moments, About, and Contact

- Implement the full authored Moments mosaic.
- Repair dialog semantics, overlay, responsive sources, focal points, and contextual copy.
- Expand About into a human narrative with a compact facts rail and documentary image.
- Rebuild Contact with safe wrapping and clear action hierarchy.

Exit gate:

- Every moment opens, closes, and navigates with pointer and keyboard.
- Filters announce result changes.
- About and Contact pass mobile and zoom review.

## Phase 6. Motion and polish

- Add one bounded hero assembly with the existing Motion dependency only if the static composition benefits.
- Add CSS interaction transitions for links, controls, and media.
- Add reduced-motion equivalents.
- Audit all visible copy for repeated labels, false affordances, and template-like language.

Exit gate:

- Motion never blocks reading or navigation.
- No animation causes layout shift or a long task.
- Reduced-motion mode is calm and complete.

## Phase 7. Quality, release, and merge

- Run content validation, media audit, lint, typecheck, unit tests, build, E2E, accessibility, and link audit.
- Run browser checks on Chromium, Firefox, and WebKit at the locked viewport matrix.
- Capture homepage, work index, one flagship case, Moments, About, Contact, mobile menu, and lightbox screenshots.
- Run Lighthouse on the release candidate.
- Review diffs and screenshots against `DESIGN.md` and `QA_MATRIX.md`.
- Open a PR linked with `Closes #25` including screenshots, verification, and known constraints.
- Merge only if checks pass and no blocking review finding remains.
- Verify the public production URL and record rollback instructions.

Exit gate:

- Every blocker in `QA_MATRIX.md` passes.
- Public deployment is reachable without authentication.
- Main is green after merge.
- Production smoke test passes on desktop and mobile.

## Commit strategy

Use a small number of coherent commits:

1. `docs: lock portfolio v3 direction and quality gates`
2. `feat: rebuild portfolio shell and homepage`
3. `feat: rebuild work and project case studies`
4. `feat: rebuild moments about and contact`
5. `test: strengthen portfolio release verification`

The exact grouping may shrink if a smaller set creates a clearer review. No artificial commits are added.
