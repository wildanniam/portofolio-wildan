# Portfolio content

This directory is the canonical, repository-owned content source for Portfolio V1.
Project facts live in YAML, while the long-form narrative lives beside each record
in `case-study.mdx`. Presentation code must query these records rather than copy
project facts into components.

## Authoring rules

- Content is written in English.
- `preview` records are visible only in the explicitly enabled V1 preview and are
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
- `site/homepage.yaml` stores project slug order only. Project facts remain in the
  corresponding `project.yaml` record.
- Moments are intentionally withheld until their caption, date, place, credit,
  rights, consent, crop, and public derivative are approved.

## Current publication state

Fradium, Nova AI Wallet, PayGate, and Quorum are seeded as full preview records.
AgentPay, SpecHeal, and Crucible are retained as lighter preview archive records,
so the V1 migration does not discard existing project content. Their narrative
and sourced claims are ready for development, but their media is still represented
as planned evidence. Promotion to `published` happens only after the publication
gates in `docs/portfolio-v1/content-asset-contract.md` pass.
