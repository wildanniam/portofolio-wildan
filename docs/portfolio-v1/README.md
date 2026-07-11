# Portfolio V1 Source of Truth - The Open Proving Ground

Date: 11 July 2026
Decision status: **approved**
Implementation status: **active through GitHub issues and reviewed pull requests**

This directory is the canonical contract for Portfolio V1. It replaces the
older dark reactor and WebGL direction while preserving those documents as
historical migration context.

Implementation started with
[GitHub Issue #1](https://github.com/wildanniam/portofolio-wildan/issues/1) on
`codex/1-portfolio-contracts`. The clean V1 base and the pushed recovery branch
for pre-existing user work are recorded in the
[V5 preservation baseline](./baseline/README.md).

## Start here

- [Approved blueprint and flagship dossier](./blueprint-summary.md)
- [V1 scope and route lock](./scope-v1.md)
- [Design contract](./development/DESIGN.md)
- [Foundation component contracts](./development/FOUNDATION_COMPONENTS.md)
- [Typography source and license record](./typography-source.md)
- [Target architecture](./development/ARCHITECTURE.md)
- [Development plan](./development/DEVELOPMENT_PLAN.md)

## Content and assets

- [Content and asset contract](./content-asset-contract.md)
- [Asset readiness](./asset-readiness.md)
- [Gallery photo intake](./gallery-photo-intake.md)

Photo masters stay outside the repository. Only approved, redacted, optimized
derivatives may enter production.

## Evidence

- [Flagship evidence audit](./flagship-evidence-audit/evidence-audit-report.md)
- [Live capture manifest](./flagship-evidence-audit/live-capture-manifest.md)
- [Raw evidence records](./flagship-evidence-audit/results/)

The raw records, field schema, outline, and generator are tracked so claims can
be reviewed and the report can be regenerated.

## Experience direction

- [Motion storyboard](./motion-storyboard.md)
- [Editorial visual base](./references/visual-base-editorial.png)
- [Evidence interaction structure](./references/interaction-structure-evidence.png)

V1 is a light, editorial, evidence-led experience. GSAP is reserved for the
bounded flagship evidence transition. WebGL and Three.js are outside V1.

## Delivery contracts

- [Development package index](./development/README.md)
- [Migration map](./development/MIGRATION_MAP.md)
- [Issue breakdown](./development/ISSUE_BREAKDOWN.md)
- [QA matrix](./development/QA_MATRIX.md)
- [Implemented quality harness](../quality-harness.md)
- [V5 preservation baseline](./baseline/README.md)

The quality foundation is tracked in
[GitHub Issue #3](https://github.com/wildanniam/portofolio-wildan/issues/3) on
`codex/3-quality-foundation`.

The light editorial foundation checkpoint is tracked in
[GitHub Issue #5](https://github.com/wildanniam/portofolio-wildan/issues/5) on
`codex/5-editorial-foundations`.

The implementation uses replacement-first migration. V5 remains available
until the V1 release candidate passes its gates and Wildan approves cutover.
