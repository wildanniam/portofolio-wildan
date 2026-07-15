# Portfolio V4 Acceptance Hooks

- Status: pre-gate contract
- Scope: durable semantic hooks for automated acceptance and release evidence
- Rule: hooks identify owned regions and runtime states; they never substitute for measured geometry, accessibility semantics, or human visual approval

## Why these hooks exist

Portfolio V4 needs stable automation without coupling tests to visual class names,
exact marketing copy, or an unapproved composition. A hook may answer _what region
is this?_ or _which project owns it?_. It must not assert that a visual requirement
has passed merely by repeating the expected value in the DOM.

Native semantics remain the first selector choice. Tests should prefer `main`,
`article`, headings, figures, links, buttons, landmarks, accessible names, and
`aria-current` before using a `data-*` hook.

## Available foundation hooks

| Hook | Owner | Contract |
| --- | --- | --- |
| `[data-portfolio-v4="true"]` | `PortfolioShell` | One canonical V4 shell surrounds each public route and the custom 404. |
| `[data-artifact-id]` | `ArtifactFragment` | Identifies one authentic artifact by its validated content ID. |
| `[data-evidence-type]` | `ArtifactFragment` | Exposes the artifact's validated evidence category. |
| `[data-slot]` | `ArtifactFragment` | Exposes the validated content slot, not a CSS position. |
| `[data-brand-asset]` | `ProjectLogo` | Identifies the validated brand asset rendered at this location. |
| `[data-brand-surface]` | `ProjectLogo` | Records the intended light or dark brand surface when one is required. |
| `[data-fit]` | `ResponsiveMedia` | Allowed values are `contain` and `cover`. Atlas product artifacts must resolve to `contain`. |

`data-portfolio-v3` is a temporary migration marker and is not a V4 acceptance
hook. V4 tests must not depend on it, and it must disappear at the final
presentation cutover.

## Golden-slice hooks

These hooks are reserved for the static homepage implementation after Human
Visual Gate 1:

| Hook | Element and ownership |
| --- | --- |
| `[data-v4-hero]` | The single research/build hero section. |
| `[data-research-coordinates]` | The single relational research-coordinate section. |
| `[data-project-atlas]` | The Atlas collection boundary containing all four project stages. |
| `[data-atlas-stage="{slug}"]` | One project-owned `article`; `{slug}` is `fradium`, `nova-ai`, `paygate`, or `quorum`. |
| `[data-stage-variant]` | The validated content variant: `wide-left`, `narrow-right`, `narrow-left`, or `wide-right`. |
| `[data-stage-region]` | Allowed values are `header`, `figure`, and `footer`; these are the three direct semantic regions of a stage in that exact DOM order. |
| `[data-project-scene="{slug}"]` | One meaningful project scene with a concise accessible summary. |
| `[data-stage-action]` | The explicit project-owned case-study action. |

The stage boundary owns its logo, name, question, answer, role, outcome,
artifacts, scene, and action. A descendant artifact or brand hook must resolve to
the same project through its nearest `[data-atlas-stage]` ancestor.

### What hooks must not claim

Do not add or test attributes such as:

- `data-grid-span="7"`;
- `data-no-overlap="true"`;
- `data-crop-safe="true"`;
- `data-accessible="true"`;
- `data-motion-duration="850"`.

Those are self-reported outcomes. Acceptance must instead inspect computed grid
geometry, bounding boxes, real image fit and dimensions, the accessibility tree,
network requests, and measured timing.

The desktop `7/12 + 5/12` and `5/12 + 7/12` contract is verified from the
rendered Atlas width, its computed column gap, and each stage's bounding box.
Mobile order is verified from both DOM order and increasing rendered top
positions; tests must also reject negative computed `order` values.

## Motion hooks

These hooks are reserved for the progressive enhancement phase and must not be
introduced to pre-hide static content:

| Hook | Contract |
| --- | --- |
| `[data-atlas-motion-state]` | Allowed values are `static`, `loading`, `ready`, and `settled`. This is the observable enhancement lifecycle on the Atlas root; server HTML starts as a complete static composition. |
| `[data-atlas-motion-controller]` | Identifies the single scoped client controller when the enhancement is eligible and loaded. |

No JavaScript and reduced-motion experiences must expose the complete final
content without requiring a controller. Reduced-motion acceptance also verifies
that the lazy motion chunk was never requested; a `data-*` state alone is not
evidence of that requirement.

## Selector policy

Acceptance tests must not depend on:

- presentation class names;
- exact hero, section, or CTA copy when a semantic relationship is sufficient;
- generated React IDs;
- child indices outside the locked `header -> figure -> footer` stage contract;
- screenshot pixels captured before Human Visual Gate 2 approval;
- animation implementation details such as GSAP-generated inline styles.

Exact copy remains covered by the canonical content/schema tests. Visual
hierarchy and composition remain human gates until an approved rendered result
is promoted to a regression baseline.

## Gate ownership

### Before Human Visual Gate 1

- shell landmarks, navigation, skip link, dialog behavior, focus return, and
  responsive overflow may be tested;
- content-to-project and asset provenance contracts may be tested;
- no homepage layout screenshot becomes a golden baseline.

### Static Golden Slice / Human Visual Gate 2

- activate Atlas DOM ownership, stage order, geometry, containment, no-JavaScript,
  touch, and responsive tests;
- capture target-versus-render review sheets using intrinsic/contained images;
- promote rendered screenshots to regression baselines only after approval.

### Motion and release

- activate lazy-chunk, reduced-motion, final-state geometry, layout-shift,
  cleanup, focus, and duration tests;
- keep runtime instrumentation separate from the semantic content contract;
- human approval, cross-browser evidence, and P0/P1 clearance remain mandatory.
