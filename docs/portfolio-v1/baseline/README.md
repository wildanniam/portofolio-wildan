# V5 Preservation Baseline

Captured: 11 July 2026, Asia/Jakarta

## Git provenance

| Record | Value |
|---|---|
| Clean V1 starting base | `enhance-fe` |
| Base SHA | `8199e1e7172f646655d17488d2ee91011e6d4012` |
| Remote state | Equal to `origin/enhance-fe` at capture time |
| Relation to `origin/main` | 6 commits ahead, 0 behind at capture time |
| Issue #1 branch | `codex/1-portfolio-contracts` |
| Safety branch | `origin/codex/1-v5-safety-snapshot` |
| Safety commit | `f67ddd5def42ee60b6ac884802c41935651fdafc` |
| Safety commit parent | `8199e1e7172f646655d17488d2ee91011e6d4012` |

Before Issue #1, two tracked user changes existed outside a commit:

| File | Preserved delta |
|---|---:|
| `src/components/observatory/command-deck-scene.tsx` | +10 / -0 |
| `src/components/portfolio/portfolio-home.tsx` | +116 / -63 |

They are preserved together in the pushed safety commit. Issue #1 started from
the clean base, so documentation promotion cannot silently absorb or overwrite
those changes.

The safety branch is for inspection and recovery only. Implementation branches
start from the agreed integration head, not from the safety branch.

## Baseline verification

Runtime:

- Node.js 20.20.2
- npm 10.8.2
- Next.js 16.2.6
- React 19.1.0
- TypeScript 5.9.3

### Lint

`npm run lint` completed with 0 errors and 1 warning: unused `previewSlug` at
`src/components/observatory/command-deck-scene.tsx:676`.

The warning is documented rather than hidden. It belongs to the following
toolchain and quality issue because that source file overlaps the saved user
work.

### TypeScript and production build

`npx tsc --noEmit --incremental false` and `npm run build` passed.

One local production build observed:

- compilation: 2.5 seconds;
- TypeScript phase: 3.0 seconds;
- static routes: `/`, `/contact`, and `/work`;
- dynamic route: `/api/contact`.

These timings are diagnostic observations, not performance budgets.

### Bundle observations

- Modern-browser initial homepage JavaScript: approximately 214.8 KiB gzip.
- Deferred 3D root chunk: approximately 329.0 KiB gzip.
- CSS: approximately 17.9 KiB gzip.
- Homepage HTML: approximately 85.1 KiB raw.

The repeatable measurement harness and route budgets belong to the following
quality-foundation issue.

## Visual evidence

- [Desktop first viewport, 1440 x 1000](./v5-home-desktop-1440x1000.jpg)
- [Mobile first viewport, 390 x 844](./v5-home-mobile-390x844.jpg)

These screenshots preserve the pre-V1 visual state for migration comparison.
They are not V1 reference designs. A previous full-page desktop capture was
excluded because compositor artifacts made it invalid evidence.

## Known baseline gaps

- `eslint-config-next@15.5.4` is not aligned with Next.js 16.2.6.
- Node and npm are observed but not yet pinned in repository metadata.
- No standalone test, content validation, E2E, accessibility, Lighthouse, CI,
  or bundle-budget command exists.
- No valid full-page baseline or reproducible axe, FPS/GPU, network waterfall,
  or real-user Core Web Vitals record exists yet.

These gaps are intentionally deferred to the quality-foundation issue and do
not block preservation of the starting state.
