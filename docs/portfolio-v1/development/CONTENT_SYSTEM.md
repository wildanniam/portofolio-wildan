# Implemented Content System

Date: 11 July 2026
Status: **implemented on Issue #7; public publication remains gated**

This document records the executable content architecture behind Portfolio V1.
The content and asset contract remains the product-level source of truth; this
file explains how that contract is enforced in code.

## Current inventory

- Full preview case studies: Fradium, Nova AI Wallet, PayGate, and Quorum.
- Brief preview archive records: AgentPay, SpecHeal, and Crucible.
- Published projects: none until approved media clears the evidence gates.
- Published moments: none until documentary-photo intake is complete.
- Private photo masters: outside the repository.

Preview status is intentional. It lets the real copy, roles, sources, system
decisions, and routes be built now without turning missing media into fake proof.

## Source layout

```text
content/
├── projects/{slug}/
│   ├── project.yaml
│   └── case-study.mdx       # required by repository completeness for full records
├── moments/{moment-id}.yaml
└── site/
    ├── profile.yaml
    ├── navigation.yaml
    ├── homepage.yaml
    ├── currently-building.yaml
    └── asset-licenses.yaml

src/content/
├── schema.ts                # strict Zod domain schemas
├── parse.ts                 # JSON-safe parsing
├── validate.ts              # pure cross-record and publication gates
├── mdx-policy.ts            # parse-only restricted MDX policy
├── repository.node.ts       # only filesystem implementation
├── repository.server.ts     # server-only cached wrapper
├── queries.ts               # pure visibility and curation selectors
├── queries.server.ts        # env-gated route API
├── dto.ts                   # explicit browser-safe projections
└── validate-content.ts      # deterministic CLI entrypoint

src/proxy.ts                 # runtime preview namespace gate
```

The runtime flow is:

```text
YAML + MDX
  -> strict parse
  -> schema and cross-record validation
  -> server-only repository
  -> route-specific query
  -> Server Component or explicit client DTO
```

Presentation code does not read YAML, inspect directories, compile arbitrary
MDX, or copy project facts into component-local data.

## Publication and route semantics

| State | Query and route behavior |
| --- | --- |
| `draft` | Authoring and CLI only; never returned by route queries. |
| `preview` | Returned only when the caller explicitly requests preview **and** `PORTFOLIO_V1_PREVIEW=1`. The compatibility namespace also requires HTTP Basic Authentication backed by `PORTFOLIO_V1_PREVIEW_TOKEN`. Always `private, no-store` and `noindex, nofollow`. |
| `published` | Eligible for permanent routes, homepage curation, archive, metadata, and sitemap. |

The two-part preview check prevents a production page from exposing preview
records merely because an environment variable exists. The route must opt in as
well. Authoring access remains in the Node repository and CLI; it is not exported
from the route query surface.

The compatibility deployment also has a narrowly matched request proxy. It fails
closed unless a 32+ character preview token is configured and supplied through
HTTP Basic Authentication with username `preview`. Authenticated pages remain
private/no-store. A build created with preview content can therefore be disabled
at runtime and still return a semantic, no-store, noindex 404 before any static
page is served. Its temporary seven-slug access manifest is checked against the
canonical repository in tests; the proxy and manifest are deleted with the
compatibility namespace at cutover.

`brief` and `full` are separate record shapes:

- A brief record has concise context and outcome, and needs no MDX route body.
- A full record has problem, users, team boundary, constraints, decisions,
  system behavior, limitations, next work, and a restricted MDX narrative.
- A published brief needs at least one ready media item.
- A published full record needs ready evidence for product reality, system
  reasoning, and verification.

## Claim discipline without underselling Wildan

Wildan is a valid primary source for his own role, leadership, coordination, and
implementation responsibilities. An `owner-attestation` therefore satisfies role
provenance. This is why the records can state:

- Fradium — Leader & Full-Stack Developer;
- Nova AI Wallet — Full-Stack & AI Builder;
- PayGate — Founder & Full-Stack Developer;
- Quorum — Full-Stack Product Builder.

That rule does not turn a public repository into a timesheet, and it does not
require every private coordination task to leave a commit.

Awards, grants, metrics, partnerships, and third-party outcomes still need a
non-owner source. PayGate's `$5,000 SCF Instaward` claim is linked to the Stellar
Indonesia announcement, official SCF rules, and Wildan's confirmation. Its scope
explicitly avoids implying a partnership, mainnet release, revenue, or completed
program milestone.

Hackathon work is treated as legitimate product and engineering evidence. Honest
lifecycle and network boundaries are recorded to clarify the artifact, not to
apologize for it.

## YAML and referential validation

YAML is parsed with the core schema, strict mode, unique keys, and aliases
disabled during conversion. Syntax errors, duplicate keys, unsafe paths, unknown
fields, invalid dates, and malformed URLs fail deterministically.

Cross-record validation covers:

- globally unique project, claim, and evidence identifiers;
- homepage, moment, navigation, current-build, collaborator, claim, decision,
  evidence, document, portrait, and license references;
- role provenance and external-outcome source rules;
- public link verification metadata;
- project date order and verification freshness;
- published brief/full/moment gates;
- ready asset, mobile derivative, and video poster file presence;
- public third-party asset license entries;
- source metadata and canonical moment filenames.

Diagnostics are sorted by path, code, severity, and message so local and CI
output remains stable.

## Restricted MDX

Case-study MDX is prose composition, not an application runtime.

The policy parses an AST with `@mdx-js/mdx` but never evaluates, imports, runs, or
compiles author-provided JavaScript during validation. It rejects:

- imports and exports;
- JavaScript expressions and spread props;
- raw HTML and Markdown images;
- unknown JSX components;
- event handlers, inline style, and unsafe URL schemes;
- missing, duplicate, unexpected, reordered, or empty narrative chapters.

The nine required H2 chapters are:

1. Problem and stakes
2. My role and the team
3. Constraint
4. Decision
5. System behavior
6. Evidence sequence
7. Outcome and validation
8. Where it stands
9. What I'd improve next

Next's MDX runtime receives one fixed component map. An allow-listed `SourceLink`
is exercised in the Fradium source so the compatibility proof covers both AST
validation and actual Server Component rendering. The final case-study issue may
refine visual presentation without expanding the authoring runtime.

`EvidenceFigure` remains a target component in the architecture but is deliberately
not authorable yet. It will enter the runtime allowlist only when it can resolve a
declared `assetId` to ready evidence owned by the current project. This prevents an
accepted MDX tag from producing an empty figure or bypassing the media repository.

## Server and browser boundary

`repository.node.ts` is the single filesystem implementation. The Next wrapper
imports `server-only` and caches the validated bundle. Route files consume
`queries.server.ts`, not the raw loader.

Client-side evidence interaction receives `ProjectSummaryDto` only. The mapper:

- explicitly projects fields instead of spreading domain records;
- includes ready, rights-cleared evidence only;
- strips planned acquisition/redaction notes;
- strips role claim/evidence IDs and claim source details;
- never includes source filesystem metadata, Zod schemas, parser objects, MDX
  modules, or React component references;
- keeps public ready-asset provenance needed for visible credit and rights.

## Media and licensing

Ready media must live below `public/media`. Dimensions, crop data, text
alternatives, provenance, and file presence are build checked. A mobile derivative
and video poster are checked when declared.

Planned statuses (`needs-capture`, `needs-redaction`, `private`, and `missing`)
are valid in draft and preview records, but fail a published record and are
removed from browser DTOs. The UI must not replace them with blank frames or
generated product proof.

Third-party published assets require a matching `published-asset` license entry.
Figma Community files, templates, fonts, and visual references do not become
portfolio assets merely because they are accessible; license, attribution, and
usage must be recorded first.

## Compatibility decisions

- Next.js `16.2.10` uses first-party `@next/mdx` with `@mdx-js/loader` and
  `@mdx-js/react`.
- Dynamic case-study imports use a statically analyzable content alias after a
  canonical slug lookup.
- `yaml` `2.9.0` owns deterministic YAML parsing.
- Zod `4.1.11` remains the domain validator.
- `server-only` marks the filesystem boundary.
- `tsx` is used only as the TypeScript CLI loader. Because the MDX dependency
  chain is ESM-only, a small `.mjs` runner imports the TypeScript validator under
  `node --import tsx/esm`; this also keeps Node 24 Linux from classifying the
  TypeScript entry as CommonJS before the ESM loader runs.
- The repository requires Node 24 and is not an Edge Runtime module.

| Package | Pinned version | License | Purpose |
| --- | ---: | --- | --- |
| `@next/mdx` | 16.2.10 | MIT | Next and Turbopack MDX integration |
| `@mdx-js/loader`, `@mdx-js/react`, `@mdx-js/mdx` | 3.1.1 | MIT | Compile integration, fixed runtime map, and parse-only policy |
| `@types/mdx` | 2.0.14 | MIT | MDX component types |
| `yaml` | 2.9.0 | ISC | Strict repository YAML parsing |
| `server-only` | 0.0.1 | MIT | Server boundary marker |
| `tsx` | 4.23.0 | MIT | Node 24 TypeScript validation runner |

The build proof includes static params, static metadata, fixed MDX components,
server-only loading, env-off 404 behavior, missing/invalid credential rejection,
authenticated `private, no-store` and `noindex` responses, and readable
no-JavaScript narrative output.

## Commands

```bash
npm run validate:content
npm run test:content
npm run test:content:e2e
npm run analyze:content-tracing
npm run quality:static
PORTFOLIO_V1_PREVIEW=1 npm run build
```

`prebuild` runs `validate:content`, so an invalid repository cannot produce a
production bundle. The content browser command builds all seven preview paths,
checks full and brief output with and without JavaScript, and then restarts that
same artifact with preview disabled to prove the request-time gate. The tracing
command proves repository source files are absent from unrelated route bundles.

To review the production build, set `PORTFOLIO_V1_PREVIEW_TOKEN` to a random
32+ character secret, start the server with both preview variables, and use
username `preview` plus that secret in the browser's HTTP Basic Authentication
prompt. The token must be stored as a deployment secret, never committed.

External URL reachability is intentionally separate from deterministic build
validation. Syntax and `lastVerifiedAt` metadata are blocking; network checks are
retrying QA. A bot-protected X page or temporarily sleeping hackathon deployment
is reported and its link state can be updated without making every build depend
on the public internet.

## Authoring and promotion workflow

1. Add or update the YAML record.
2. For a full record, author the exact restricted MDX chapter sequence.
3. Keep unfinished media planned; never add a fake public path.
4. Produce derivatives from private masters through crop, redaction, EXIF removal,
   optimization, rights/consent review, and approval.
5. Add ready media and any required license entry.
6. Run content validation, unit tests, static quality, and production build.
7. Review the env-gated route with JavaScript on and off.
8. Promote to `published` only when its publication gate passes.

Adding a future project should change content records and approved media, not the
homepage JSX, project-specific card component, or GSAP timeline.
