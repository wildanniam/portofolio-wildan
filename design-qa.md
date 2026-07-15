# Portfolio V4 Design QA

- Review date: 15 July 2026
- Scope: complete V4 public surface, bounded Signal → System motion, and route interactions
- Reference contract: `docs/portfolio-v4/GATE1_VISUAL_BOARD.md`
- Reference frames: Research Instrument desktop/mobile and Atlas desktop/mobile
- Runtime captures: `artifacts/design-qa/` (local, intentionally git-ignored)

## Comparison method

The authoritative reference and rendered page were opened together for direct
comparison. Runtime captures used 1440 × 1000 for desktop and 390 × 844 for
mobile. The generated boards communicate art direction; the written grid,
content, asset, and crop contracts win where their illustrative microcopy or
scale differs from production.

## Resolved findings

| Priority | Finding | Resolution |
| --- | --- | --- |
| P1 | The first mobile implementation made the headline too large and broke the authored phrase into an awkward `thatlets` line. | Reduced the mobile headline scale, added an intentional semantic line break, and kept the cobalt signal on the authored phrase. |
| P1 | Project marks disappeared at the 390px reference viewport. | Restored authentic project marks at 390px while retaining a bounded 36px identity slot. |
| P1 | The narrow Nova stage forced an oversized three-line project title. | Added a narrow-stage display scale without weakening the shared heading hierarchy. |
| P2 | Artifact captions competed with the compact Atlas scene. | Kept complete captions in the accessibility tree and visually hid them inside the scene; the stage retains one concise accessible summary. |
| P1 | The first mobile Moments pass allowed a generic card selector to split the featured record into two columns. | Gave the featured record an explicit full-width mobile contract and verified its image and copy both resolve to the 350px content width. |
| P1 | Legacy PFN presentation CSS and components remained reachable after the V4 route cutover. | Removed the V3 shell marker, PFN stylesheet import, unused PFN components, and moved the fixed MDX runtime map into the V4 project system. |

## Passed checks

- Hero hierarchy, portrait placement, warm paper/ink/cobalt balance, and CTA
  order match the approved Research Instrument direction.
- Mobile reading order is identity → thesis → actions → portrait → research rail.
- The live copy uses canonical content and omits illustrative timestamps and
  generated microcopy from the reference boards.
- Research Coordinates render as one relational field on desktop and one
  continuous vertical rail on mobile; they are not cards.
- Atlas DOM order is Fradium → Nova AI Wallet → PayGate → Quorum.
- Desktop geometry resolves to 7/12 + 5/12 followed by 5/12 + 7/12.
- Each stage owns header → figure → footer in that exact DOM order.
- All nine Atlas artifacts use intrinsic `contain` presentation and stay within
  their project scene. No screenshot uses destructive cover cropping.
- Project marks, questions, responses, roles, outcomes, flow labels, and actions
  remain project-owned and visible without hover or JavaScript.
- The 390px implementation is single-column, horizontally bounded, and preserves
  authentic marks and product surfaces.
- No glass, glow, generic bento treatment, 3D decoration, terminal cosplay, fake
  asset, or generated UI drawing was introduced.
- No console errors or warnings were observed in desktop or mobile inspection.
- The motion runtime is absent at the top of the page, loads only when the Atlas
  approaches the viewport, and settles after one pass through the four stages.
- GSAP changes only opacity and transforms by at most 8px; it introduces no pin,
  scrub, loop, overlap, horizontal overflow, or permanent inline presentation.
- All 27 animated targets return to `opacity: 1`, `transform: none`, and
  `visibility: visible`; stage dimensions and document-space positions remain
  unchanged before and after motion.
- The initial route ships only the 827-byte motion loader chunk. The 115.6KB
  GSAP/ScrollTrigger runtime remains a separate on-demand chunk.
- Reduced-motion and no-JavaScript paths retain the complete static Atlas and do
  not mount the motion controller.
- Work archive review passed at 1440×1000 and 390×844: four records remain in
  Fradium → Nova → PayGate → Quorum order, every mark is visible, product media
  uses `contain`, and no record intersects a neighbor.
- PayGate case-study review passed at desktop and mobile openings, long-form
  narrative, and the six-item evidence atlas. The question, answer, authorship,
  facts, authentic media, and public actions remain associated and bounded.
- Moments review passed at desktop and 390px: one Refactory lead record, six
  supporting documentary records, no overlap, no horizontal overflow, and one
  contextual lightbox with close focus, Escape behavior, body scroll lock, and
  trigger focus return.
- About and Contact review passed at 1440×1000 and 390×844. Their identity copy
  is distinct from the homepage, portrait and contact action remain legible, and
  the email address wraps without clipping.
- The custom 404 now uses the V4 route system and no public route depends on PFN
  presentation classes or the V3 shell marker.
- Mobile Moments derivatives were re-encoded from their approved main crops for
  thumbnail use; the lightbox requests the higher-fidelity main image only after
  intent. Cold mobile media fell from 353.84 KiB to 189.47 KiB while the largest
  image fell to 25.98 KiB and the visible 390px composition remained unchanged.
- `npm run quality:static` passes: zero lint warnings, successful typecheck, 191
  unit tests, and the V4 presentation policy audit across 33 source files.
- `npm run build` passes all content/media gates and statically generates all 14
  route outputs.

## Open findings

- P0: 0
- P1: 0
- P2: 0

**Final result: passed**
