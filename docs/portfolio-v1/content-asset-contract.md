# Content, Asset, and Component Contract

Date: 11 July 2026
Applies to: homepage, `/work`, four flagship case studies, moments, and future project additions.

## Contract goal

Adding a future project should require content records and a standardized media package. It should not require a new homepage component, a new layout, or edits to a project-specific GSAP timeline.

Content is authored in English. Claims are linked to evidence. Missing private or unpublished assets are represented in development data, but missing placeholders are never rendered in production.

## Repository model

Recommended structure:

```text
content/
├── projects/
│   ├── fradium/
│   │   ├── project.yaml
│   │   └── case-study.mdx
│   ├── nova-ai/
│   ├── paygate/
│   └── quorum/
├── moments/
│   └── {moment-id}.yaml
└── site/
    ├── profile.yaml
    ├── navigation.yaml
    ├── homepage.yaml              # ordered project slug references only
    └── currently-building.yaml

public/media/
├── projects/{slug}/               # optimized public derivatives only
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

`/work` is derived from every `ProjectRecord`; there is no second archive metadata source to drift out of sync. Non-flagship records can omit full case-study MDX. Homepage curation stores ordered slug references, never duplicated project facts.

Original photographs and sensitive captures must live **outside this workspace and repository** in a private archive. The repository accepts only derivatives that pass this pipeline: crop -> redact -> strip EXIF -> optimize -> approve -> publish. `.gitignore` is not treated as a privacy boundary.

## Core domain types

The following is a design contract, not final implementation code:

```ts
type PublicationState = "draft" | "preview" | "published";
type CaseStudyState = "brief" | "full";

type ProjectLifecycle =
  | "active"
  | "beta"
  | "prototype"
  | "research"
  | "dormant"
  | "archived";

type ProjectOrigin =
  | "independent"
  | "hackathon"
  | "grant"
  | "employment"
  | "collaboration";

type ValidationKind =
  | "award"
  | "grant"
  | "live-deployment"
  | "testnet"
  | "users"
  | "tests"
  | "transaction";

type EvidenceType =
  | "product"
  | "architecture"
  | "prototype"
  | "agent-trace"
  | "transaction"
  | "test-result"
  | "deployment"
  | "source"
  | "document"
  | "moment";

type PlannedAssetStatus =
  | "needs-capture"
  | "needs-redaction"
  | "private"
  | "missing";

type LinkState =
  | { status: "public"; url: string; lastVerifiedAt: string }
  | { status: "private" | "offline" | "unavailable" | "not-applicable"; note?: string };

type ClaimSource =
  | { kind: "url"; url: string; label: string; verifiedAt: string }
  | { kind: "evidence"; evidenceId: string; label: string }
  | { kind: "official-document"; documentId: string; label: string }
  | { kind: "collaborator-confirmation"; collaboratorId: string; confirmedAt: string; note: string }
  | { kind: "owner-attestation"; confirmedAt: string; note: string };

type VerifiedClaim = {
  id: string;
  text: string;
  sources: [ClaimSource, ...ClaimSource[]];
  scope?: string;
};

type MediaKind = "image" | "video" | "svg" | "document";

type AssetProvenance =
  | {
      kind: "owned";
      creator: string;
      rightsNote: string;
      capturedAt?: string;
    }
  | {
      kind: "third-party";
      creator: string;
      source: string;
      license: string;
      attribution?: string;
    }
  | {
      kind: "documentary-photo";
      source: string;
      credit: string;
      rights: "owned" | "licensed" | "permission-confirmed";
      consent: "confirmed" | "not-required";
      capturedAt?: string;
    };

type CropPolicy =
  | { mode: "intrinsic" }
  | {
      mode: "focal";
      aspectRatio:
        | "16:10"
        | "3:2"
        | "4:3"
        | "1:1"
        | "4:5"
        | "9:16"
        | `${number}:${number}`;
      focalPoint: { x: number; y: number };
    };

type ReadyAssetBase = {
  id: string;
  status: "ready";
  evidenceType: EvidenceType;
  src: string;
  mobileSrc?: string;
  width: number;
  height: number;
  crop: CropPolicy;
  caption: string;
  provenance: AssetProvenance;
  claimIds?: string[];
};

type ReadyImageAsset = ReadyAssetBase & {
  mediaKind: "image" | "svg";
  alt: string; // use an explicit empty string only when intentionally decorative
  longDescription?: string;
};

type ReadyVideoAsset = ReadyAssetBase & {
  mediaKind: "video";
  poster: string;
  posterAlt: string;
  transcriptOrSteps: [string, ...string[]];
  durationSeconds: number;
  controls: "visible" | "explicit-intent";
};

type ReadyDocumentAsset = ReadyAssetBase & {
  mediaKind: "document";
  title: string;
  textAlternative: string;
  pageCount?: number;
};

type ReadyAsset = ReadyImageAsset | ReadyVideoAsset | ReadyDocumentAsset;

type PlannedAsset = {
  id: string;
  status: PlannedAssetStatus;
  intendedEvidenceType: EvidenceType;
  intendedMediaKind?: MediaKind;
  slot: string;
  acquisitionNotes?: string;
  redactionNotes?: string;
};

type MediaAsset = ReadyAsset | PlannedAsset;

type ProjectRecord = {
  slug: string;
  title: string;
  publication: PublicationState;
  caseStudyState: CaseStudyState;
  lifecycle: ProjectLifecycle;
  origin: ProjectOrigin[];
  validationKinds: ValidationKind[];
  startedAt: string;
  endedAt?: string;
  lastUpdatedAt: string;
  lastVerifiedAt: string;
  oneLiner: string;
  problem: string;
  intendedUsers: string[];
  role: {
    label: string;
    scope: string[];
    claimIds: string[];
    evidenceIds: string[];
  };
  collaborators?: Array<{ id: string; name: string; role?: string; url?: string }>;
  constraints: string[];
  decisions: Array<{
    title: string;
    rationale: string;
    consequence: string;
    evidenceIds: string[];
  }>;
  systemFlow: string[];
  technologies: string[];
  claims: VerifiedClaim[];
  evidence: MediaAsset[];
  limitations: string[];
  next: string[];
  links: {
    live: LinkState;
    source: LinkState;
    docs?: LinkState;
    demo?: LinkState;
  };
};

type MomentRecord = {
  id: string;
  title: string;
  event: string;
  date: string;
  place: string;
  context:
    | { kind: "project"; projectSlugs: [string, ...string[]] }
    | { kind: "journey"; label: string };
  people?: string[];
  result?: string;
  caption: string;
  reflection?: string;
  claimIds: string[];
  assets: MediaAsset[];
  publication: PublicationState;
};

type CurrentlyBuildingRecord = {
  id: string;
  projectSlug?: string;
  title: string;
  summary: string;
  startedAt: string;
  expiresAt?: string;
  link: LinkState;
};
```

### Publication semantics

- `draft` is authoring-only and never appears in public queries, routes, navigation, metadata, or sitemap.
- `preview` is available only when `PORTFOLIO_V1_PREVIEW=1`, always carries `noindex`, and is excluded from production navigation and sitemap.
- `published` is publicly routable and may be curated into `/`, `/work`, and sitemap.
- V1 release requires Fradium, Nova AI Wallet, PayGate, and Quorum to be `published + full`.
- Non-flagship archive projects may be `published + brief`.
- A `published + brief` record receives a server-rendered `/work/{slug}` page from YAML facts and ready media; it participates in params/metadata/sitemap but requires no MDX or empty full-case-study chapters.
- A published project or moment may reference only `ReadyAsset`; `PlannedAsset` is valid only for draft/preview authoring or internal backlog planning.

## Claim discipline

Every external result or high-value statement resolves to a `VerifiedClaim` with at least one structured source or is clearly presented as Wildan's interpretation. Role labels reference claim and evidence IDs rather than becoming untraceable copy.

Wildan is the primary source for his own role, leadership, responsibilities, and private or coordination work. An `owner-attestation` is valid provenance for those statements; absence from a public repository does not cancel work that repositories cannot record. Repository history, collaborator confirmation, and public artifacts strengthen the surrounding story but are not mandatory permission to use a truthful self-described role.

Required source treatment:

- Awards and grants: official result, program page, public announcement, certificate, or verifiable event material. PayGate's $5,000 Instaward uses the Stellar Indonesia announcement plus SCF Instawards rules.
- Shipped behavior: repository code, live product, release, demo, test, trace, or transaction evidence.
- Role and ownership: owner attestation, optionally strengthened by public team material, authored architecture, deployment ownership, commit history, or collaborator confirmation.
- Performance numbers: measured report with date and environment; never estimated marketing copy.
- Current lifecycle: verified again before publishing and shown with `lastVerifiedAt`.

If an external outcome cannot be verified, it is omitted or presented as a personal recollection. This restriction applies to third-party outcomes and metrics, not to Wildan's good-faith account of his own responsibilities.

### Locked PayGate claim

```ts
{
  id: "paygate-instaward-2026",
  text: "PayGate was awarded a $5,000 SCF Instaward.",
  sources: [
    {
      kind: "url",
      url: "https://x.com/Indo_Stellar/status/2075550378553421994",
      label: "Stellar Indonesia announcement",
      verifiedAt: "2026-07-11"
    },
    {
      kind: "url",
      url: "https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules",
      label: "Official SCF Instawards rules",
      verifiedAt: "2026-07-11"
    },
    {
      kind: "owner-attestation",
      confirmedAt: "2026-07-11",
      note: "Wildan confirms PayGate received the award."
    }
  ],
  scope: "Awarded funding; not a claim of partnership, mainnet launch, revenue, or sprint completion."
}
```

## Per-flagship media package

| Slot | Required | Contract |
|---|---:|---|
| Hero still | Product-reality gate | 16:10 or 3:2 is preferred; master >= 2400 px wide; desktop and intentional mobile crop. A different crop is allowed when the real media demands it. |
| Product screenshots | Product-reality gate | Only the captures needed to establish shipped behavior; no browser chrome unless context requires it. |
| Product loop | Preferred | Poster-first, silent MP4/WebM. Autoplay only when muted, `playsInline`, motion is allowed, and Save-Data is off; otherwise start by explicit intent. Visible pause/play is required for motion over five seconds, plus textual steps or transcript for important demos. |
| System reasoning | Reasoning gate | Architecture, protocol flow, state transition, transaction path, or another project-appropriate explanation. Editable source plus accessible export; labels remain readable on mobile. |
| Technical proof | Verification gate | A sanitized trace, test, transaction, deployment, source, or verification artifact. |
| Early artifact | Preferred | Sketch, prototype, whiteboard, early UI, or meaningful code evolution. |
| Human moment | Optional | Real project-related build, team, presentation, or competition photograph. |
| Social image | Yes | Thumbnail-safe Open Graph crop with project title and authentic product media. |

The page may publish without optional assets. The three required functions are product reality, system reasoning, and verification; they are not a quota of identical file types. It must not substitute generated fake proof for missing evidence.

## Photograph contract

Every photograph supplied later is ingested through the same checklist:

1. Preserve the untouched master in the private archive outside the workspace and repository.
2. Record event, date, place, related project or journey context, people, result, photographer/source, rights, and consent.
3. Crop intentionally and record the focal point rather than relying on arbitrary `object-fit: cover` behavior.
4. Redact private or sensitive details.
5. Strip EXIF and other unnecessary metadata.
6. Produce and optimize landscape, portrait, thumbnail, and social derivatives only when the composition supports them.
7. Approve the exact derivative before it enters `public/media`; only approved derivatives are published.
8. Write factual English alt text and a short caption; write a reflection only when it adds project context.
9. Use documentary color treatment consistently; do not force every image into black-and-white.
10. Avoid synthetic film borders, fake Polaroid frames, generated event backgrounds, and organization résumé captions.

### Photo showcase modes

The visual system supports four modes without bespoke components:

- `lead` — one high-impact, full-width documentary frame.
- `contact-sheet` — a contextual group of related build moments.
- `evidence` — a photograph tied to a project decision or outcome.
- `portrait` — a quieter about/contact image with an intentional crop.

The content decides the mode. The component does not infer importance from image orientation.

## Component contract

```text
SiteShell
├── SiteHeader
├── OpeningFrame
├── WorkEvidenceExplorer
│   ├── ProjectIndex
│   ├── EvidenceContactSheet
│   ├── EvidenceFrame
│   │   ├── MediaRenderer
│   │   └── EvidenceCaption
│   └── ProjectFacts
├── MomentsSection
│   └── MomentContactSheet
│       ├── MomentFigure
│       └── MomentCaption
├── CurrentlyBuilding
├── ArchiveList
├── AboutContact
└── SiteFooter

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
```

### Responsibilities

- `MediaRenderer`: renders `ReadyAsset` only and is the source of truth for image, video, diagram, and document behavior, dimensions, poster, text alternatives, controls, loading, and fallback. `PlannedAsset` is rejected before render.
- `EvidenceContactSheet`: accessible button group; each preview button exposes `aria-controls`, `aria-pressed`, and an explicit accessible name. It owns no animation beyond refs and selection state.
- `EvidenceFrame`: semantic selected evidence and caption, updated immediately when selection changes. It remains readable without JavaScript.
- `WorkEvidenceExplorer`: owns selected project/evidence state and coordinates the single signature timeline.
- `ProjectIndex`: renders data order and lifecycle; every item contains a normal case-study anchor plus a separate preview button. It never hard-codes flagship names.
- `MomentFigure`: handles approved crop, caption, credit, and photo mode.
- `NarrativeSection`: reusable MDX composition; not a generic card.

Do not create `FradiumSection`, `NovaSection`, `PayGateSection`, or `QuorumSection`. Project-specific code is allowed only for an optional bounded interactive proof that cannot be expressed through the standard evidence sequence.

## Animation ownership

One component owns each motion concern:

- `OpeningFrame`: server-rendered opening plus CSS-only decorative reveal; it owns no GSAP client timeline.
- `WorkEvidenceExplorer`: contact-sheet-to-frame and project-switch timelines.
- `MomentsSection`: photo focus sequence only after selected derivatives pass caption, rights/consent, redaction, metadata-removal, and crop approval.
- Ordinary links and controls: CSS transitions.

GSAP, Framer Motion, and Motion must not compete for the same page-level lifecycle. The implementation uses GSAP only for the lazily eligible explorer enhancement and removes or isolates redundant animation ownership.

## Validation gates

Content validation fails when:

- a featured project is missing publication state, case-study state, role, lifecycle, origin, update/verification dates, explicit source/live link states, limitations, or one of the three evidence functions;
- an external award, grant, metric, partnership, or third-party outcome has no structured non-owner source;
- any referenced claim, evidence, document, collaborator, moment, or project slug does not exist;
- a role has no provenance source; `owner-attestation` satisfies role provenance, while representative claim/evidence references illustrate the work;
- a `public` link has no valid URL or verification date, or a non-public link incorrectly supplies a public URL;
- a `ReadyAsset` lacks its media-kind-specific text alternative, dimensions, caption, crop policy, or valid provenance/rights; an intentionally decorative image must explicitly use `alt: ""`;
- a `PlannedAsset` reaches a production renderer;
- a published photograph lacks documentary provenance, rights, consent, credit, caption, or a valid crop policy; focal point is required when `crop.mode` is `focal`;
- a published moment lacks event, date, place, or either a non-empty project context or an explicit journey-context label;
- a duplicate evidence ID exists;
- homepage project slug references are duplicated or fail to resolve in their declared content order;
- homepage, navigation, moment, or current-building records reference an unknown project slug;
- a URL is malformed or a public link lacks verification metadata.

External reachability is a separate retrying QA report rather than a deterministic build blocker. A bot-protected or temporarily unavailable X/source URL must be reported for review without making the content build nondeterministic.

Media validation should report:

- oversized files;
- missing poster frames;
- autoplay loops without the required motion, Save-Data, controls, and text-alternative contract;
- invalid crop policies or focal crops without focal coordinates;
- focal coordinates outside the normalized `0..1` range;
- low source resolution;
- accidental EXIF or sensitive metadata where relevant;
- missing mobile crops for lead images;
- text in diagrams below the mobile readability threshold.

## Migration from the current repository

The current `src/data/portfolio.ts` combines copy, links, status, role, project order, and presentation accents in one TypeScript file. Migration should:

1. preserve truthful existing copy as source material, not blindly publish it;
2. move project data into validated records;
3. replace color-based project identity with evidence and typography hierarchy;
4. replace the six-project equal treatment with the four locked flagships plus archive data;
5. add Quorum as a full hackathon case study with the owner-attested `Full-Stack Product Builder` role, collaborator credit, and unfinished hosted-evidence/MoneyGram work placed under next iterations;
6. retain non-flagship projects in `/work` without giving them flagship interaction cost;
7. remove icon components from content data and resolve icons or visual treatment at the presentation layer.

## Normal publishing workflow

Publishing a new project should become:

1. Create `project.yaml` and `case-study.mdx`.
2. Add approved public derivatives.
3. Connect evidence IDs to claims and decisions.
4. Run schema, asset, link, and accessibility checks.
5. Preview the project and relevant homepage state.
6. Publish the permanent project route.
7. Curate it onto the homepage only when it deserves flagship or current-work emphasis.

No project addition should require modifying a GSAP timeline, homepage JSX, or a bespoke 3D scene.
