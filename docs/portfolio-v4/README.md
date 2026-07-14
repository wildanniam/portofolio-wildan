# Portfolio V4 — Research / Build Atlas

- Status: canonical and locked for implementation
- Owner: Wildan Syukri Niam
- Implementation issue: [#29 — Research / Build Atlas](https://github.com/wildanniam/portofolio-wildan/issues/29)
- Implementation branch: `codex/29-research-build-atlas`
- Supersedes: Portfolio V3 presentation direction
- Preserves: validated content, claims, media provenance, routes, and quality harness

## Decision

Portfolio V4 positions Wildan as an **AI Researcher & Web3 Builder** whose medium is software engineering. The site must show a repeatable pattern:

> Research question → working system → real outcome.

The redesign replaces the current screenshot-led editorial layout with a more expressive, logo-led **Research / Build Atlas**. All four flagship projects remain visible as a collection before a visitor chooses a case study.

## Why V3 is being replaced

V3 is technically sound but visually unsuccessful:

- the hero communicates a generic inspectability thesis instead of Wildan's identity;
- the project index forces unrelated source images into incompatible aspect ratios;
- PayGate media can visually read as belonging to Quorum because layout order and association are weak;
- product screenshots are cropped as covers instead of art-directed as system stories;
- the visual language is too restrained and flat for a prestige portfolio;
- motion is limited to a basic hero translate and image hover scale;
- copy is repetitive, defensive, and too administrative on the landing page;
- automated quality gates prove that the site works, but not that it looks or feels right.

## Canonical documents

- [DESIGN.md](./DESIGN.md) — visual, narrative, component, responsive, and motion lock.
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) — ordered implementation and migration plan.
- [QA_MATRIX.md](./QA_MATRIX.md) — merge blockers and required visual evidence.

## Non-negotiable release rule

Implementation may not move past the golden slice, and may not merge, on automated checks alone. Three explicit human visual gates are required:

1. high-fidelity target approval before production layout work;
2. rendered golden-slice approval after the hero and Project Atlas are built statically;
3. release-candidate approval with desktop, tablet, mobile, normal-motion, and reduced-motion evidence.

The previous V3 release remains the rollback target until V4 passes every blocker.
