# Portfolio V2 — Personal Field Notes

Date: 12 July 2026

Status: **visual direction approved; implementation not started**

This directory is the source of truth for the next portfolio redesign. It
supersedes the visual and interaction direction in `docs/portfolio-v1`, while
preserving V1's content validation, route model, evidence records, media audit,
accessibility tests, performance harness, and release discipline.

## Approved thesis

**Personal Field Notes — a living editorial archive of a student builder.**

The site is an English-language portfolio for Wildan Syukri Niam. It should let
visitors quickly understand who Wildan is, scan four flagship projects with
equal prominence, inspect project details only after following a case-study
link, and experience the human journey through documentary photography.

The guiding line is:

> Building is how I learn.

The visual ratio is deliberately constrained:

- 70% structured editorial system;
- 30% expressive field-note composition.

## Approved references

These images define composition and atmosphere, not factual content. Generated
copy, project-to-image pairings, dates, screenshots, awards, and people must be
replaced by validated repository content and approved real assets.

- [Homepage desktop](./references/home-desktop-approved.png)
- [Homepage mobile](./references/home-mobile-approved.png)
- [Case study desktop](./references/case-study-desktop-approved.png)
- [Moments desktop](./references/moments-desktop-approved.png)
- [Moments mobile](./references/moments-mobile-approved.png)
- [Motion storyboard](./references/motion-storyboard-approved.png)

## Locked product decisions

1. The homepage is a general index, not a single-project case study.
2. PayGate, Fradium, Nova AI, and Quorum receive equal homepage weight.
3. Project detail, architecture, evidence, and long-form narrative live on
   `/work/[slug]`.
4. Documentary photography is organized as `Build`, `Win`, `Learn`, and `Give`.
5. The homepage shows a curated Moments teaser; `/moments` carries the archive.
6. PayGate is the current-building signal, not a visually dominant homepage
   project.
7. There is no WebGL, Three.js, sticky evidence explorer, page-wide smooth
   scrolling, floating preview, or content-obscuring overlay.
8. Static composition and semantics are approved before motion is added.
9. Mobile is recomposed, not scaled down from desktop.
10. V1 stays reversible until V2 passes the release gate.

## Public roles

| Project | Public role |
| --- | --- |
| Fradium | Leader & Full-Stack Developer |
| Nova AI | Full-Stack & AI Builder |
| PayGate | Founder & Full-Stack Developer |
| Quorum | Full-Stack Product Builder |

Owner attestation is valid provenance for Wildan's roles. Third-party outcomes,
awards, grants, and metrics still require their existing structured sources.

## Documents

- [Design specification](./DESIGN_SPEC.md)
- [Development plan](./DEVELOPMENT_PLAN.md)
- [Migration map](./MIGRATION_MAP.md)
- [QA and acceptance matrix](./QA_MATRIX.md)
- [Decision log](./DECISION_LOG.md)

## Hard implementation boundary

No implementation branch may begin until Checkpoint A in the development plan
is approved. No root cutover may occur until Checkpoint F passes. Generated
mockups are never accepted as evidence or production media.
