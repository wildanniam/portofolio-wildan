# Portfolio V4 — Asset Register

- Status: canonical source freeze for the Research / Build Atlas
- Scope: project identity assets and Atlas product fragments only
- Generator: [`scripts/prepare-v4-atlas-assets.mjs`](../../scripts/prepare-v4-atlas-assets.mjs)
- Public root: `public/media/projects`

This register prevents the V4 layout from repeating the V3 failure of treating unrelated screenshots as interchangeable cover images. Every Atlas asset below has one project association, one intended role, and a documented transformation. Runtime code must read only the copied public assets; it must never reach into the four source repositories.

## Source freeze

Regeneration is valid only when each local source repository is at the pinned revision. The generator fails closed when a `HEAD` differs, so a source update requires a deliberate provenance review and a register update.

| Project | Local source root | Repository | Frozen revision |
| --- | --- | --- | --- |
| Fradium | `/Users/wildanniam/Development/project/fradium` | `https://github.com/fradiumofficial/fradium.git` | `370cd9724f501d440fc9618cf9c9f4b6b9c6cc9e` |
| Nova AI | `/Users/wildanniam/Development/project/nova-wallet` | `https://github.com/OfficialNovaAI/nova-wallet.git` | `38b03a80c9c4d85c767013188df2b77f0eda20b8` |
| PayGate | `/Users/wildanniam/Development/project/paygate` | `https://github.com/wildanniam/paygate-stellar.git` | `69fe93085c5816e3943cb4e16846ab231c50f1da` |
| Quorum | `/Users/wildanniam/Development/project/Quorum` | `https://github.com/wildanniam/Quorum.git` | `f434ac7dc385f5617c073b71fe3eaef8f8d799f0` |

## Brand assets

Dimensions and byte sizes below were measured from the frozen inputs and generated outputs. Paths in the source column are relative to the corresponding source root.

| Project / role | Source path · source facts | Portfolio destination · output facts | Transformation and intended use |
| --- | --- | --- | --- |
| Fradium mark | `src/frontend/public/logo.svg` · SVG · 36×36 · 2,041 B | `public/media/projects/fradium/brand/mark.svg` · SVG · 36×36 · 2,041 B | Exact copy. Project marker in the Atlas node and adjacent project UI. |
| Fradium wordmark | `src/frontend/public/assets/logo-fradium.svg` · SVG · 124×36 · 4,062 B | `public/media/projects/fradium/brand/wordmark.svg` · SVG · 124×36 · 4,062 B | Exact copy. Optional branded label where the project name is not already dominant. |
| Nova AI mark | `public/navbar/navbar-icon.png` · PNG · 64×64 · 7,974 B | `public/media/projects/nova-ai/brand/mark.png` · PNG · 64×64 · 7,974 B | Exact copy. Render at or below intrinsic size; do not upscale. |
| Nova AI wordmark | `public/nova-logo.webp` · WebP · 738×326 · 53,016 B | `public/media/projects/nova-ai/brand/wordmark.webp` · WebP · 320×141 · 10,874 B | Proportional resize to 320 px width, WebP quality 78, no crop. Accent only; prefer ≤160 CSS px and never exceed 240 CSS px on desktop. |
| PayGate mark | `frontend/public/brand/paygate-mark.svg` · SVG · 512×512 · 2,386 B | `public/media/projects/paygate/brand/mark.svg` · SVG · 512×512 · 2,386 B | Exact copy. Project marker in the Atlas node and adjacent project UI. |
| Quorum mark | `public/figma/landing/quorum-mark.svg` · SVG · 58×58 · 819 B | `public/media/projects/quorum/brand/mark.svg` · SVG · 58×58 · 819 B | Exact copy. White artwork: use on a dark project surface only. |
| Quorum wordmark | `public/figma/landing/quorum-logo.svg` · SVG · 161×40 · 7,382 B | `public/media/projects/quorum/brand/wordmark.svg` · SVG · 161×40 · 7,382 B | Exact copy. White artwork: use on a dark project surface only. |

When the visible project name sits next to a mark or wordmark, the asset is decorative and must use empty alt text or `aria-hidden="true"`. The visual geometry and project colours may not be redrawn to make the four identities look artificially uniform.

## Atlas product fragments

These are not generic thumbnails. They are evidence fragments placed inside each project's own scene. UI screenshots must remain readable and use intrinsic containment; `object-fit: cover` is prohibited.

| Project / role | Source path · source facts | Portfolio destination · output facts | Crop / derivative rationale |
| --- | --- | --- | --- |
| Fradium primary — wallet result | `docs/images/extension-analyze-result.png` · PNG · 512×878 · 180,113 B | `public/media/projects/fradium/atlas/wallet-result.webp` · WebP · 420×720 · 22,342 B | Proportional resize to 420 px, quality 82, no crop. Preserves the complete unsafe-address analysis as the scene's primary evidence. |
| Fradium primary — mobile | same source | `public/media/projects/fradium/atlas/wallet-result-mobile.webp` · WebP · 320×549 · 15,894 B | Proportional 320 px derivative for narrow viewports; no information is removed. |
| Fradium support — send verdict | `docs/images/analyze-address.png` · PNG · 5200×3120 · 2,961,151 B | `public/media/projects/fradium/atlas/send-verdict.webp` · WebP · 480×723 · 22,142 B | Extract `{ left: 1840, top: 270, width: 1660, height: 2500 }`, then resize to 480 px, quality 82. Isolates the transaction verdict and Confirm/Cancel decision; removes unrelated screenshot chrome. |
| Nova AI primary — workspace | `public/landing-page/let-nova-handle-the-complexity.png` · PNG · 771×528 · 211,018 B | `public/media/projects/nova-ai/atlas/workspace.webp` · WebP · 720×493 · 58,346 B | Proportional resize to 720 px, quality 82, no crop. Shows the project workspace as one intact composition. |
| Nova AI primary — mobile | same source | `public/media/projects/nova-ai/atlas/workspace-mobile.webp` · WebP · 350×240 · 15,854 B | Proportional 350 px derivative; no crop. |
| Nova AI support — intent | `public/card-assets/one-intent-multiple-actions.png` · PNG · 354×279 · 105,126 B | `public/media/projects/nova-ai/atlas/intent.webp` · WebP · 354×279 · 4,134 B | Format/compression derivative at quality 82, no crop or enlargement. Supports the intent-to-actions story without becoming another full-page screenshot. |
| PayGate primary — request receipt | `output/scf-report/assets/03-product-request-receipt-final.png` · JPEG bitstream despite `.png` suffix · 1440×900 · 96,656 B | `public/media/projects/paygate/atlas/request-receipt.webp` · WebP · 720×502 · 22,182 B | Extract `{ left: 520, top: 150, width: 860, height: 600 }`, then resize to 720 px, quality 82. Retains the request → 402 → MPP → 200 receipt sequence and removes unused canvas. |
| PayGate primary — mobile | same source and crop | `public/media/projects/paygate/atlas/request-receipt-mobile.webp` · WebP · 350×244 · 7,920 B | 350 px derivative of the exact approved crop. |
| PayGate support — transform flow | `output/scf-report/assets/02-product-transform-flow-final.png` · JPEG bitstream despite `.png` suffix · 1440×900 · 112,265 B | `public/media/projects/paygate/atlas/transform-flow.webp` · WebP · 720×450 · 24,428 B | Proportional resize to 720 px, quality 82, no crop. Provides the wider system flow behind the receipt. |
| Quorum decoration — settlement rail | `public/figma/landing/feature-split-rail.svg` · SVG · 588×271 · 19,189 B | `public/media/projects/quorum/atlas/settlement-rail.svg` · SVG · 588×271 · 19,189 B | Exact copy. Decorative connector inside Quorum's dark scene; never presented as standalone evidence. |
| Quorum primary — pass receipt | `output/playwright/product-ui-audit-current/pass-receipt-desktop.png` · PNG · 1280×1996 · 769,977 B | `public/media/projects/quorum/atlas/pass-receipt.webp` · WebP · 390×1150 · 27,492 B | Extract `{ left: 31, top: 180, width: 390, height: 1150 }`, retain at 390 px, quality 82. Isolates the signed pass/QR receipt from the tall browser capture. |
| Quorum primary — mobile | same source and crop | `public/media/projects/quorum/atlas/pass-receipt-mobile.webp` · WebP · 320×944 · 24,704 B | 320 px derivative of the exact approved crop. |
| Quorum support — settlement flow | `output/playwright/product-ui-audit-current/collaborator-ledger-desktop.png` · PNG · 1280×3283 · 444,721 B | `public/media/projects/quorum/atlas/settlement-flow.webp` · WebP · 720×569 · 23,446 B | Extract `{ left: 20, top: 110, width: 1240, height: 980 }`, then resize to 720 px, quality 82. Captures the collaborator settlement ledger while removing unrelated page length. |

Generated on-disk totals are 66,481 B for Fradium, 97,182 B for Nova AI, 56,916 B for PayGate, and 103,032 B for Quorum. Totals include both desktop and mobile derivatives, so they are not the bytes loaded in one scene.

## Permitted use and ownership boundary

- Fradium and Nova AI assets are first-party collaborative project identity and product fragments. They may identify and demonstrate those projects in Wildan's portfolio, with team and collaborator credit preserved. Their presence must not imply that Wildan solely owns every visual, product decision, or contribution.
- PayGate and Quorum assets are first-party project identity and product fragments under Wildan's project repositories. They may be used as portfolio identity and product proof.
- Transformations are limited to deterministic copy, crop, resize, format conversion, and compression documented above. No derivative may fabricate a state, redesign another team's interface, remove attribution, or combine identities.
- No asset in this register grants permission to reuse third-party event, sponsor, or partner logos. Such material requires its own provenance record before inclusion.
- SVGs must remain self-contained: no external URLs and no embedded raster payloads. Quorum's white brand artwork remains on dark surfaces unless implemented as a CSS mask that preserves its geometry.

This is an implementation provenance boundary, not a substitute for a legal licence audit if the site is later commercialised or syndicated.

## Rendering contract

### Semantic role

- Brand marks and wordmarks beside visible project names: decorative (`alt=""` or `aria-hidden`).
- Primary and supporting product fragments: semantic `<img>`/framework image with the approved project-specific alt text and caption in content data.
- Quorum settlement rail: decorative and excluded from the accessibility tree.
- Reserve the known intrinsic aspect ratio before loading to prevent layout shift.

### Responsive rule

- Use `<picture>` or the framework's equivalent and select the `*-mobile.webp` derivative at `max-width: 639px` for Fradium wallet result, Nova workspace, PayGate request receipt, and Quorum pass receipt.
- Fradium send verdict, Nova intent, PayGate transform flow, Quorum settlement flow, and Quorum settlement rail reuse their intrinsic asset on mobile with containment. A decorative support fragment may be omitted if space is constrained; a unique primary proof may not be hidden.
- Never raster-upscale, never crop product UI at runtime, and never use `object-fit: cover` for an Atlas fragment.
- Lazy-load off-screen support fragments. The active scene's primary fragment may load eagerly only when it is part of the initial above-the-fold view.

## QC budgets and blockers

| Check | Budget / rule | Release consequence |
| --- | --- | --- |
| Brand mark or wordmark | ≤12 KB per file | Block if exceeded without a recorded exception. |
| Decorative Atlas SVG | ≤24 KB, no external URL, no embedded raster | Block. |
| Desktop Atlas raster | ≤90 KB per file | Block. |
| Mobile Atlas raster | ≤60 KB per file | Block. |
| One active desktop project stage | ≤180 KB transferred | Block. |
| One active mobile project stage | ≤110 KB transferred | Block. |
| Existing largest initial image allowance | ≤180 KB desktop / ≤120 KB mobile | Block unless the visual gate explicitly approves an evidence-backed exception. |
| UI treatment | `object-fit: contain`, known dimensions, no runtime crop | Block. |
| Accessibility | Meaningful fragments have project-specific alt; decorative assets are silent | Block. |
| Provenance | Destination is registered and source revision is pinned | Block. |
| Runtime boundary | No cross-repository path or remote asset dependency | Block. |

All current registered outputs pass the per-file budgets. Before asset changes are accepted, run:

```bash
node scripts/prepare-v4-atlas-assets.mjs
npm run validate:content
npm run audit:media
```

The generator is intentionally not an automatic source updater. If a pinned source repository has advanced, review the new material, update this register and content provenance together, then regenerate.
