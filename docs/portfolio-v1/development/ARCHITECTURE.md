# Target Architecture - Portfolio V1

Date: 11 July 2026
Status: **approved target architecture; implementation in progress**

## 1. Architecture decision

V1 is a **controlled, server-first rewrite** inside the existing Next.js repository.

The current application foundation remains, but the current homepage composition, dark reactor design system, WebGL observatory, mixed project data, and redirect-only routes are not extended. New routes and components are built beside them, proven through a Fradium vertical slice, and then switched over deliberately.

Why:

- the current homepage is one large hydrated component;
- the current visual system directly contradicts the locked light editorial direction;
- project facts and presentation code are coupled;
- the current 3D stack is out of scope and dominates lazy JavaScript;
- polishing the existing abstractions would preserve the wrong boundaries.

## 2. Route architecture

```text
src/app/
├── layout.tsx                         # minimal shared document only
├── (legacy)/                          # temporary coexistence group
│   ├── layout.tsx
│   └── page.tsx                       # current root until approved cutover
├── (v1)/
│   ├── layout.tsx                     # scoped light editorial shell
│   ├── preview/open-proving-ground/page.tsx
│   ├── work/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   └── moments/page.tsx               # notFound until publication gate passes
├── sitemap.ts
├── robots.ts
└── not-found.tsx
```

| Route | Rendering and source |
|---|---|
| `/` | Static/server-composed homepage from curated project slug references and site records |
| `/work` | Static archive derived from all publishable `ProjectRecord` entries |
| `/work/[slug]` | Statically generated full/brief page; `notFound()` for unknown, draft, or preview-with-env-off records |
| `/contact` | Static direct-contact page; no public form in V1 |
| `/moments` | Publish-gated route; omitted from navigation and sitemap until the narrative gate passes |

During migration, `/preview/open-proving-ground` is available only when `PORTFOLIO_V1_PREVIEW=1`. It returns `notFound()` otherwise, carries `noindex`, is absent from navigation/sitemap, and is removed after the approved root switch. This permits small merged foundation/content PRs while Wildan reviews the complete new root composition on a branch-preview deployment.

The root layout stays visually neutral. The current dark providers/chrome/styles move into `(legacy)/layout.tsx`; V1 tokens/chrome stay scoped to `(v1)/layout.tsx`. This prevents early global-style or layout work from breaking the still-public legacy homepage. At cutover, the approved V1 composition becomes the root page; the unreachable legacy group is deleted in a later PR.

### Publication matrix

| State | Route/query behavior |
|---|---|
| `draft` | Authoring-only. Never appears in public queries, routes, navigation, metadata, or sitemap. |
| `preview` | Available only when `PORTFOLIO_V1_PREVIEW=1`, always `noindex`, and excluded from production navigation/sitemap. |
| `published` | Publicly routable and eligible for `/`, `/work`, metadata, and sitemap curation. |

V1 release requires all four flagships to be `published + full`. Selected non-flagship archive entries may be `published + brief`. A published record may reference only `ReadyAsset` items; `PlannedAsset` belongs only to draft/preview authoring or an internal backlog.

A `published + brief` project is included in `/work`, `generateStaticParams()`, metadata, and sitemap. `/work/{slug}` renders a server-only `ProjectBriefPage` from YAML: title, one-liner, role, origin/lifecycle, dates, one ready media item, concise context/outcome, and explicit live/source link states. It does not require MDX, empty case-study chapters, the flagship explorer, or a client motion island.

`generateStaticParams()` and `generateMetadata()` are required for case-study routes. Homepage and archive never duplicate project facts.

## 3. Repository-owned content

```text
content/
├── projects/
│   └── {slug}/
│       ├── project.yaml
│       └── case-study.mdx
├── moments/
│   └── {moment-id}.yaml
└── site/
    ├── profile.yaml
    ├── navigation.yaml
    ├── homepage.yaml
    └── currently-building.yaml

public/media/
├── projects/{slug}/
├── moments/{moment-id}/
├── profile/
└── og/

src/content/
├── schema.ts
├── parse.ts
├── types.ts
├── repository.server.ts
├── queries.server.ts
├── dto.ts
└── validate-content.ts
```

Rules:

- YAML holds structured facts, lifecycle, claims, links, evidence metadata, credits, publication state, and media references.
- MDX holds the case-study narrative and may render only an allow-listed component set.
- Zod validates records at build time and through `npm run validate:content`.
- Homepage curation stores ordered project slugs only.
- `/work` derives from every publishable project record.
- V1 includes reviewed brief records for the selected non-flagship archive projects; they require no full case study, but they do require a canonical slug, one-liner, role, origin, lifecycle, dates, link state, publication state, and one usable thumbnail/evidence item when publicly listed.
- A `PlannedAsset` can exist in development data but can never reach a production media renderer.
- Project order is content data, not component or timeline code.
- The RSC-compatible MDX compiler and YAML parser are selected in the foundation issue after compatibility is verified against the installed Next.js version. Arbitrary client-side MDX execution is rejected.

### MDX execution contract

MDX is prose composition, not an unrestricted application runtime.

Allowed native elements:

- `h2`, `h3`, `p`, `ol`, `ul`, `li`, `blockquote`, `strong`, `em`, `code`, `pre`, `a`, and semantic tables when the content genuinely requires one.

Allowed portfolio components:

- `NarrativeSection`
- `RoleAndCredits`
- `ConstraintBlock`
- `DecisionRecord`
- `SystemFlow`
- `EvidenceSequence`
- `EvidenceFigure`
- `OutcomeBlock`
- `ProjectStatus`
- `NextIteration`
- `SourceLink`

The renderer supplies this fixed map. Case-study files cannot import arbitrary components, scripts, browser APIs, or client modules.

For a `full` case study, project opening/facts come from YAML and the MDX narrative must represent: problem/stakes, role/team, constraint, at least one decision, system behavior, evidence sequence, outcome/validation, current status, and next iteration. A chapter may be concise, but it cannot be silently replaced with an empty frame. Optional video, code samples, quotes, and human moments are implemented only when a V1 flagship actually uses them.

If one evidence file type is unavailable, the project supplies another authentic artifact that fulfills the same functional gate. Product reality, system reasoning, and verification remain mandatory for a full case study; the UI never renders a placeholder chapter to preserve symmetry.

## 4. Content query boundary

```text
filesystem records
      ↓
Zod validation + referential checks
      ↓
server-only repository
      ↓
route-specific query
      ↓
Server Components / metadata / sitemap
      ↓
small serializable summaries for client islands
```

Pure parsers/validators contain no filesystem or framework dependency. `repository.server.ts` imports `server-only` and is the only layer allowed to read content files directly. UI components receive typed domain objects or serializable client DTOs, never raw YAML, filesystem paths, Zod schemas, or MDX compiler code.

Required queries:

- `getHomepage()`
- `getPublishedProjects()`
- `getProjectBySlug(slug)`
- `getProjectParams()`
- `getPublishedMoments()`
- `getContactProfile()`

Required validation:

- unique canonical slugs and IDs;
- homepage slug referential integrity;
- `publication` and `caseStudyState` rules;
- claim source presence and provenance;
- public-link URL plus `lastVerifiedAt`;
- evidence gate coverage: product reality, system reasoning, verification;
- public media path, dimensions, alt text, focal point, and asset state;
- no private or planned asset in a published record;
- `/moments` publication gate.

## 5. Server and client boundary

Server Components by default:

- page and route composition;
- opening copy and first media poster;
- work archive;
- all case-study chapters;
- evidence figures and captions;
- moments markup;
- About, contact, header, footer;
- route metadata, sitemap, and robots.

Bounded client islands only when behavior requires them:

- `WorkEvidenceExplorer` for selected evidence and the signature transition;
- mobile navigation only if a native/CSS disclosure is insufficient;
- optional moments selection only after approved derivatives pass caption, rights/consent, redaction, metadata-removal, and crop review, and the interaction materially improves the story.

The explorer receives serializable project summaries and ready media metadata only. It never imports MDX, filesystem utilities, or icon components from content.

Progressive-enhancement contract:

1. SSR/no-JavaScript markup exposes all four summaries, posters, and case-study links.
2. Hydration adds separate evidence-preview buttons.
3. A `data-enhanced` state enables visual overlay behavior.
4. Semantic selection changes immediately.
5. Visual motion follows and may be interrupted safely.

Explorer semantics are locked as a **button group**, not a partial tab pattern. Each project title remains a normal anchor. Its adjacent preview button uses `aria-pressed`, `aria-controls`, and an explicit accessible name; focus stays on that button, and a concise live region announces the selected preview.

## 6. Component boundaries

```text
SiteShell
├── SiteHeader
├── route content
└── SiteFooter

Homepage
├── OpeningFrame
├── WorkEvidenceExplorer
│   ├── ProjectIndex
│   ├── EvidenceContactSheet
│   ├── EvidenceFrame
│   └── ProjectFacts
├── MomentsSection
├── CurrentlyBuilding
└── AboutContact

ProjectCaseStudy
├── CaseStudyHeader
├── ProjectFacts
├── NarrativeSection
├── RoleAndCredits
├── ConstraintBlock
├── DecisionRecord
├── SystemFlow
├── EvidenceSequence
├── OutcomeBlock
├── ProjectStatus
├── NextIteration
└── NextProjectNavigation

ProjectBriefPage
└── YAML project facts, one ready figure, concise context/outcome, and direct links
```

Composition rules:

- foundational components know design tokens but not project names;
- evidence components know media/evidence types but not flagship order;
- case-study components are selected by narrative function, not by project;
- route files stay thin and query content through the server repository;
- ordinary links remain anchors, not click handlers on generic containers.

## 7. Motion architecture

Technology ownership:

| Concern | Owner |
|---|---|
| Opening decoration | CSS in the server-rendered `OpeningFrame`; no eager motion client chunk |
| Evidence selection and expansion | Lazily eligible GSAP + `@gsap/react` in `WorkEvidenceExplorer` |
| Optional bounded scroll progression | One parent ScrollTrigger after real-media prototype approval |
| Case-study figures | Server-rendered static/CSS/native behavior; no GSAP or sticky choreography in V1 |
| Hover, focus, active, disclosure | CSS/browser-native behavior |
| Route navigation | Next.js links and browser navigation |

Implementation rules:

- `useGSAP()` with a scoped container and automatic cleanup;
- load the GSAP/ScrollTrigger island only as the explorer approaches or receives explicit preview intent; it is not part of initial navigation JavaScript;
- keep one dynamically imported motion module as the only importer of `@gsap/react`, `gsap`, and `ScrollTrigger`; the server/static explorer shell must not statically import `useGSAP`;
- `contextSafe()` for post-setup callbacks;
- one owner per animation concern;
- transform and opacity only for the expansion overlay;
- source and target bounds read together before writes;
- `overwrite: "auto"` or explicit cancellation during rapid selection;
- `gsap.matchMedia()` creates desktop, mobile, and reduced-motion contexts;
- no nested ScrollTriggers, page-wide smoothing, or global pointer tracking.

## 8. Media pipeline

Private master outside repository:

```text
master
  → select
  → crop and record focal point
  → redact
  → strip EXIF
  → create responsive derivatives
  → optimize
  → approve exact derivative
  → add public media + content metadata
  → validate and publish
```

Product loops are poster-first and route-lazy. Autoplay is allowed only when muted, inline, visible, motion is permitted, and Save-Data is off. Important behavior also receives textual steps or a transcript.

## 9. Dependency policy

Keep as foundations when still consumed:

- Next.js App Router, React, TypeScript, Tailwind 4;
- Zod;
- `next/image` and `next/font`;
- GSAP;
- Vercel Speed Insights;
- Lucide for a small number of functional controls;
- selected Radix primitives only where native HTML cannot meet the behavior cleanly.

Add:

- `@gsap/react`;
- a build-compatible YAML parser and RSC MDX toolchain;
- development-only testing/a11y tooling selected in the QA issue.

Remove only after consumers are gone and the release candidate passes:

- React Three Fiber, Drei, Three.js, postprocessing;
- Framer Motion and `motion`;
- `next-themes`;
- React Bits;
- contact-form, email, toast, and Radix dependencies without remaining consumers.

The installed Next.js and `eslint-config-next` major versions must be aligned in a dedicated, verified toolchain change rather than hidden inside visual work.

## 10. SEO and document architecture

Every public route requires:

- unique title and description;
- canonical URL;
- Open Graph image derived from authentic project media;
- correct lifecycle/role wording from the content record;
- sitemap inclusion controlled by publication state;
- draft and preview case studies are never indexable;
- structured headings with one clear `h1`;
- source links near externally verifiable outcomes.

## 11. Architecture acceptance gate

Architecture is accepted when:

- a new project can be added without new project-specific UI code;
- a content validation failure blocks the production build;
- `/work/[slug]` is static and metadata-complete;
- no-JavaScript markup contains the critical four-project experience;
- client JavaScript is limited to bounded interaction leaves;
- no published record can reference a planned/private asset;
- the Fradium vertical slice proves the same schema and component tree can render the other three flagships.
