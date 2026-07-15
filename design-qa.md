# Portfolio V4 Design QA

- Review date: 15 July 2026
- Scope: static homepage golden slice before motion enhancement
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

## Open findings

- P0: 0
- P1: 0
- P2: 0

**Final result: passed**
