# Development Package

Date: 11 July 2026
Status: **approved; implementation active**

[Back to the Portfolio V1 source of truth](../README.md)

This package turns the approved portfolio concept, scope, content contract, media rules, and motion storyboard into an implementable development system.

## Documents

1. [DESIGN.md](./DESIGN.md) — visual tokens, typography, grid, media, component vocabulary, states, motion, and responsive rules.
2. [FOUNDATION_COMPONENTS.md](./FOUNDATION_COMPONENTS.md) — implemented shell boundary, primitive semantics, deliberate deviations, and QA hooks.
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — route, content, Server Component, client island, media, dependency, and SEO boundaries.
4. [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) — controlled-rewrite strategy, phased delivery, approval gates, budgets, risks, and definition of done.
5. [MIGRATION_MAP.md](./MIGRATION_MAP.md) — exact keep/rewrite/retire map for current routes, components, data, dependencies, assets, and documentation.
6. [ISSUE_BREAKDOWN.md](./ISSUE_BREAKDOWN.md) — twelve proposed high-signal GitHub issues with dependencies, acceptance criteria, and verification.
7. [QA_MATRIX.md](./QA_MATRIX.md) — browser, viewport, no-JavaScript, reduced-motion, accessibility, performance, visual, content, and release checks.

## Locked implementation decisions

- Controlled rewrite inside the current Next.js repository.
- React Server Components by default; bounded client islands only for behavior.
- Repository-owned validated YAML/MDX content.
- Geist Sans + Geist Mono; light-only editorial tokens.
- GSAP + `@gsap/react` for the lazily eligible evidence transition; CSS for opening decoration and ordinary interaction.
- No WebGL/Three.js in V1.
- Fradium is the golden vertical slice before the shared system receives Nova, PayGate, and Quorum.
- Real routes for `/work`, four case studies, and `/contact`.
- Documentary photo derivatives only; masters remain outside the repository.
- Replacement first, legacy deletion last.

## Implementation entry gate

The pre-implementation gate has been satisfied:

1. Wildan approved the visual direction, scope, flagship roles, and development plan.
2. The two existing user-modified legacy files are preserved on
   `origin/codex/1-v5-safety-snapshot`.
3. These contracts are tracked under `docs/portfolio-v1`.
4. [GitHub Issue #1](https://github.com/wildanniam/portofolio-wildan/issues/1)
   opened the issue-driven implementation sequence.
5. Implementation starts with source-of-truth, tooling, and foundation work,
   followed by the Fradium golden vertical slice.

The runtime and executable quality gates are implemented through
[GitHub Issue #3](https://github.com/wildanniam/portofolio-wildan/issues/3) and
documented in the [quality harness guide](../../quality-harness.md).

Production UI remains unchanged in Issue #1. The tracked baseline and migration
map define how later issues can replace it safely.
