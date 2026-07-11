# Migration Map — Current Portfolio to V1

Date: 11 July 2026
Strategy: **controlled rewrite, replacement first, deletion last**

## 1. Safety constraints

Before Issue #1, the working tree contained user-owned modifications in:

- `src/components/portfolio/portfolio-home.tsx`
- `src/components/observatory/command-deck-scene.tsx`

These files are also eventual rewrite/removal targets. Their state is preserved
on `origin/codex/1-v5-safety-snapshot` at commit
`f67ddd5def42ee60b6ac884802c41935651fdafc`.

GitHub Issue #1 records the exact base branch and SHA, preserves the dirty work
on the pushed safety branch, and establishes clean `enhance-fe` commit
`8199e1e7172f646655d17488d2ee91011e6d4012` as the V1 starting base. No
implementation issue branches from the former dirty working tree.

The approved planning contracts are promoted to `docs/portfolio-v1` by Issue
#1. Older dark and 3D direction documents remain tracked only as superseded V5
history so future work follows the correct source of truth.

## 2. Keep, rewrite, retire

### Application and routes

| Current | Decision | Target |
|---|---|---|
| `src/app/page.tsx` | Keep as a thin route entry; change composition | Server-composed homepage |
| `src/app/layout.tsx` | Make neutral during coexistence | Minimal shared document; legacy and V1 chrome live in separate route-group layouts |
| `src/app/globals.css` | Reduce to neutral reset during coexistence | Legacy styles remain scoped to `(legacy)`; V1 tokens remain scoped to `(v1)` until cutover |
| `src/app/work/page.tsx` | Replace redirect | Static work archive |
| `src/app/contact/page.tsx` | Replace redirect | Direct-contact page |
| `src/app/api/contact/route.ts` | Remove/defer for V1 | No public form; separately scope a secure form if later needed |
| Missing `/work/[slug]` | Add | Shared static case-study route |
| Missing sitemap/robots/not-found | Add | Publication-aware document surfaces |
| Missing `/moments` | Add only after gate | `notFound()` or absent navigation until publishable |
| Missing preview surface | Add temporarily | Env-gated, `noindex` `/preview/open-proving-ground`; remove after root switch |

### Content

| Current | Decision | Target |
|---|---|---|
| `src/data/portfolio.ts` | Migrate, then retire | `content/projects`, `content/site`, and server queries |
| Project icons and colors stored with facts | Remove presentation concerns from domain records | Evidence/media metadata plus semantic types |
| Six old project entries | Reconcile | Four locked flagships plus future archive records |
| `nova-ai-wallet` | Canonical slug migration | `nova-ai` |
| `paygate-stellar` | Canonical slug migration | `paygate` |
| Missing Quorum | Add | `quorum` record and full case study |
| Wrong/old role labels | Replace | Approved owner-attested public roles |
| Hash navigation facts | Replace | Route-qualified navigation records |

Migration must preserve useful copy as source material, but no old role, award, lifecycle, or placeholder URL is copied without reconciling it against the evidence audit.

### Components

| Current | Decision | Replacement |
|---|---|---|
| `portfolio/portfolio-home.tsx` | Full rewrite after preservation | Server-composed `home/*` sections plus bounded explorer island |
| `navbar/index.tsx` | Rewrite | `shell/SiteHeader` with real routes and complete mobile semantics |
| `footer/index.tsx` | Rewrite | `shell/SiteFooter` with verified direct links |
| `theme-provider.tsx` | Remove after root migration | V1 is light-only |
| `observatory/*` | Retire after Fradium parity | Authentic Fradium media and evidence explorer |
| `MagicBento.tsx` | Remove | No universal animated card grammar |
| old `hero`, `about`, `skills`, `projects`, `contact` | Remove after route parity | New editorial sections by content function |
| `projects/contact-form.tsx` | Remove/defer | Direct-contact links |
| `ui/badge`, colored buttons, card | Do not carry forward by default | Tokens plus purpose-specific foundation primitives |
| Dialog/dropdown/sheet/tabs/form primitives | Audit consumer-by-consumer | Keep only if an approved V1 behavior needs them |
| `src/lib/utils.ts` | Keep | Shared class utility |

Approximately 19 current TS/TSX files are unreachable from the active route. Reachability is re-scanned after replacement so cleanup is based on actual imports, not filenames alone.

### Styling and visual behavior

| Current grammar | Migration |
|---|---|
| Dark-only `color-scheme`, forced dark theme | Light-only canvas and semantic color tokens |
| Cyan/mint/violet/amber signal palette | One cobalt interaction accent; brand colors stay inside evidence |
| Glass panels, glow, scanline, grid, radial blobs | Editorial whitespace, rules, typography, authentic media |
| Rounded cards as universal wrapper | Content-specific compositions with square media frames |
| Pointer-follow background | Remove |
| `main overflow-hidden` | Remove masking; fix overflow defects |
| Repeated opacity-zero fade-up | Server-visible content; selective decorative motion only |

### Motion

| Current | Decision | Target |
|---|---|---|
| Framer Motion throughout homepage | Remove after new route parity | CSS for ordinary states |
| R3F `useFrame` hero motion | Remove | No WebGL in V1 |
| GSAP used only by unreachable MagicBento | Re-own deliberately | Lazily eligible evidence explorer only; opening decoration stays CSS-only |
| No `@gsap/react` | Add | Scoped `useGSAP` and cleanup |
| Global pointer listener | Remove | No page-wide pointer effect |
| Partial reduced-motion handling | Rewrite | `gsap.matchMedia()` and static final states |

### Dependencies

| Package group | Action and timing |
|---|---|
| `next`, `eslint-config-next` | Align compatible major versions in a dedicated toolchain PR |
| `gsap` | Keep |
| `@gsap/react` | Add with the first client motion island |
| `zod` | Keep for content and publishing validation |
| `@react-three/*`, `three`, postprocessing | Remove after no V1 route imports observatory code |
| `framer-motion`, `motion` | Remove after the replacement route has no consumer |
| `next-themes` | Remove after light-only root shell lands |
| `react-bits` | Remove with MagicBento/legacy cleanup |
| React Hook Form, resolvers, Resend, React Email | Remove with deferred contact form/API |
| Sonner | Remove if no approved V1 state needs global toast UI |
| Radix packages | Keep only packages with a verified remaining consumer |
| Lucide | Keep sparsely for functional controls only |

Never mix dependency cleanup with the Fradium motion prototype. Cleanup receives a separate PR after behavior and visual parity so regressions remain attributable.

### Public assets

| Current | Decision |
|---|---|
| `public/wildan.png`, `public/wildan-2.png` | Audit quality, provenance, and whether an approved portrait supersedes them |
| `background-*.webp` | Remove if not referenced after migration |
| create-next-app SVG placeholders | Remove if not referenced |
| New project evidence | Add only approved, optimized derivatives under `public/media/projects/{slug}` |
| New photographs | Add only redacted, EXIF-stripped, rights-cleared derivatives under `public/media/moments/{id}` |
| Open Graph images | Generate from authentic media and store under `public/media/og` |

Run a source reference scan and production route smoke test before deleting any public file.

### Documentation

| Current | Decision |
|---|---|
| `docs/visual-direction.md` | Mark superseded or move to a historical section |
| `docs/v5-phase-1-audit.md` | Mark superseded or archive |
| `docs/3d-skill-prep.md` | Archive as an abandoned V5 experiment |
| Boilerplate `README.md` | Rewrite for project setup, content workflow, validation, QA, and publishing |
| Approved blueprint | Promote into tracked `docs/` before coding |
| Reusable architecture/design decisions | Keep tracked and update when implementation changes the contract |

## 3. Target source tree

During coexistence, the current root page/chrome lives under `(legacy)` and the new shell/routes live under `(v1)`. The temporary preview route is enabled only with `PORTFOLIO_V1_PREVIEW=1`, is `noindex`, and is absent from navigation/sitemap. The final tree below is reached only after the root switch and deletion of both the temporary preview route and legacy group.

```text
content/
├── projects/{slug}/{project.yaml,case-study.mdx}
├── moments/{id}.yaml
└── site/{profile,navigation,homepage,currently-building}.yaml

src/
├── app/
│   ├── page.tsx
│   ├── work/{page.tsx,[slug]/page.tsx}
│   ├── contact/page.tsx
│   ├── moments/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── not-found.tsx
├── components/
│   ├── shell/
│   ├── home/
│   ├── work/
│   ├── case-study/
│   ├── media/
│   ├── moments/
│   └── motion/
├── content/
│   ├── schema.ts
│   ├── parse.ts
│   ├── types.ts
│   ├── repository.server.ts
│   ├── queries.server.ts
│   ├── dto.ts
│   └── validate-content.ts
└── lib/

public/media/
├── projects/{slug}/
├── moments/{id}/
├── profile/
└── og/
```

Do not create a permanent `v2`, `v6`, `new`, or `redesign` component subtree. The approved system should become the canonical architecture.

## 4. Switch-over sequence

1. Preserve current user work and capture baseline evidence.
2. Track the approved design/content/architecture contracts.
3. Split a neutral root document from scoped `(legacy)` and `(v1)` layouts; verify the live legacy root has visual parity.
4. Add foundations, validated content, `/work`, `/work/[slug]`, `/contact`, and the env-gated noindex preview without changing the live root composition; draft project routes remain non-public until ready.
5. Build the new Fradium-first homepage composition in new canonical component folders.
6. Approve desktop/mobile static states and the signature interaction on a preview deployment.
7. Switch the approved V1 composition to root and remove the temporary preview route in a dedicated release-candidate PR.
8. Run complete route, visual, no-JavaScript, reduced-motion, accessibility, and performance checks.
9. Remove legacy source, assets, APIs, and dependencies in a dedicated cleanup PR.
10. Repeat clean-install build and preview verification before release approval.

## 5. Rollback model

- Each meaningful phase is an issue-linked PR.
- The root-route switch and legacy deletion are separate commits or PRs.
- The old system remains recoverable in Git history after deletion.
- Content migration is schema-validated and reviewed separately from motion.
- No production data migration or destructive external operation exists; rollback is a code deployment rollback.

## 6. Migration acceptance

Migration is complete when:

- no V1 route imports a legacy observatory, old homepage, old section, or abandoned UI primitive;
- no WebGL/Three, Framer Motion, dark-theme, contact-form, or dead asset payload remains in production output;
- all four canonical project routes and direct links work;
- the content repository is the only source of project facts;
- public assets are approved derivatives with valid metadata;
- a clean install passes the complete QA command set;
- preserved user work remains recoverable in history.
