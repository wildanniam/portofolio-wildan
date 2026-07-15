# Portfolio content

This directory is the canonical, repository-owned content source for Portfolio V4.
Project facts live in YAML, while long-form narratives live beside each record in
`case-study.mdx`. Presentation code must query these records rather than duplicate
facts, roles, outcomes, branding, or Atlas composition in components.

## Authoring rules

- Content is written in English.
- `preview` records are visible only in an explicitly enabled preview and are
  never indexed or added to the production sitemap.
- Claims use a typed `kind` and structured sources. Wildan's own account is valid
  provenance for his role and responsibilities; external awards, grants, metrics,
  partnerships, and third-party outcomes require a non-owner source.
- Evidence is planned until an approved public derivative exists. Planned evidence
  is authoring data and must never render as an empty or synthetic placeholder.
- Each full case study plans evidence for product reality, system reasoning, and
  verification. One item may satisfy more than one function when that is honest.
- Original photographs and private captures stay outside this repository. Only
  cropped, redacted, EXIF-stripped, optimized, rights-cleared derivatives may later
  become ready evidence.
- `site/profile.yaml` owns Wildan's public identity, hero copy, discipline,
  research direction, and operating rhythm.
- `site/research.yaml` owns the four research territories and their project
  relationships.
- `site/homepage.yaml` owns exactly four typed Atlas stages and four curated
  documentary Moment references. Each Atlas stage references a published project,
  a project-owned outcome claim, and ready project-owned artifact IDs. Each Moment
  entry references one published Moment-owned asset and declares exactly one lead
  plus three supporting roles; neither contract duplicates claim or asset payloads.
- Flagship `project.yaml` records own their palette, official marks/wordmarks,
  repository revision provenance, project role, claims, and Atlas derivatives.
- Every imported Atlas derivative records its source repository, 40-character
  revision, source path, creator, and rights boundary.
- `socialImageAssetId` is an optional project-local pointer while authoring, but
  every published full case study must resolve it to ready raster image evidence.
- A full project may reference one documentary story through
  `caseStudyMomentId`. The Moment remains canonical and must be published, include
  that project in its context, and own a ready documentary photograph. Project
  evidence must not duplicate a Moment photograph.
- Moments are intentionally withheld until their caption, date, place, credit,
  rights, consent, crop, and public derivative are approved.

## Current publication state

Fradium, Nova AI Wallet, PayGate, and Quorum are the four published full case
studies and homepage Atlas stages. AgentPay, SpecHeal, and Crucible remain lighter
preview archive records so the migration does not discard earlier work. Research,
homepage, branding, evidence, and publication references are all rejected at build
time when they are missing, cross-owned, unready, or unprovenanced.

The frozen V4 asset inventory and derivative rules live in
`docs/portfolio-v4/ASSET_REGISTER.md`.
