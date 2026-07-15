# Human Visual Gate 1 Board

- Status: complete board assembled; Wildan approval pending
- Primary direction: **Research Instrument / Field Journal**
- Secondary reference: **Signal Cartography**, connector grammar only
- Implementation rule: no final homepage/Atlas layout and no motion before this board is approved

## Authoritative frames

| Frame | File | Use |
| --- | --- | --- |
| Desktop primary | `visual-targets/gate1-research-instrument-desktop.png` | Authoritative layout, typography, portrait, spacing, and paper/ink/cobalt balance |
| Mobile primary | `visual-targets/gate1-research-instrument-mobile.png` | Authoritative reading order and independently art-directed mobile composition |
| Desktop connector reference | `visual-targets/gate1-signal-cartography-desktop-reference.png` | Reference only for orthogonal signal path, rounded elbow, open nodes, and relational mapping |
| Mobile connector reference | `visual-targets/gate1-signal-cartography-mobile-reference.png` | Reference only for the visual continuity of the signal language |

The connector references are not alternate layouts. The primary Research Instrument frames own the composition.

## Authoritative companion frames

| Frame | File | Implementation authority |
| --- | --- | --- |
| Atlas desktop states | `visual-targets/gate1-atlas-desktop-states.png` | Art direction for the paired-stage rhythm, authentic artifacts, restrained focus state, and non-overlapping project narratives |
| Atlas mobile 390 validation | `visual-targets/gate1-atlas-mobile-390-validation.png` | Four viewport-stage captures of one 390px page; validates strict single-column project composition and readable artifacts |
| PayGate case opening | `visual-targets/gate1-case-opening-paygate-desktop.png` | Authoritative case-study opening hierarchy, product mark placement, artifact scale, metadata rail, and chapter transition |
| Moments desktop | `visual-targets/gate1-moments-desktop.png` | Authoritative asymmetric documentary contact-sheet rhythm using real event photography |
| Moments mobile 390 | `visual-targets/gate1-moments-mobile-390.png` | Authoritative mobile lead-photo plus compact editorial-row composition |
| PayGate `Signal → System` storyboard | `visual-targets/gate1-paygate-signal-system-storyboard.png` | Authoritative five-keyframe reveal sequence and its no-motion fallback |

These generated boards are visual art direction built from authentic source assets. They do not replace, redraw, or alter the real product screenshots, logos, receipts, and photographs. Source assets remain immutable; implementation composes them with intrinsic sizing and bounded masks.

Where an image-generation composition differs from a numeric rule below, the written implementation contract wins. In particular, the Atlas desktop board communicates rhythm and hierarchy, while production code must enforce `7/12 + 5/12` for Fradium/Nova and `5/12 + 7/12` for PayGate/Quorum. Newsreader remains restricted to authored phrases even where a generated board uses broader editorial italics.

## Locked visual foundation

- Canvas `#F2F0E8`
- Raised paper `#FAF8F1`
- Ink `#151713`
- Secondary ink `#5E615A`
- Cobalt `#2E4BFF`
- Structural radius: `0–2px`
- Archivo Variable for identity, display, body, and navigation
- Newsreader Variable Italic only for the authored phrase `lets them act.`
- Geist Mono for restrained metadata
- No Bodoni, glass, glow, generic bento cards, terminal cosplay, or 3D decoration

## Hero lock

Desktop uses a 1,344px content system inside a 1,440px viewport with 48px outer margins and 16px grid gaps. The headline remains the dominant element; the portrait is a bounded 4:5 documentary image to the lower right and never overlaps the copy.

The reading order is:

1. `AI Researcher & Web3 Builder`
2. `I research how AI agents reason.`
3. `I build software that lets them act.`
4. supporting thesis
5. `Explore the work`
6. `Read the research`
7. portrait and documentary metadata

Mobile keeps that exact semantic order, stacks the two actions at a minimum 48px height, and places the portrait after the actions. A dedicated mobile derivative must define the crop; arbitrary runtime cropping is not allowed.

## Connector lock

Borrow only these elements from Signal Cartography:

- one 8px cobalt origin square after `lets them act.`;
- one 1.25px orthogonal path with a 16px rounded elbow;
- 12px open-circle coordinate nodes;
- a semantic transition from research statement to Research Coordinates.

Desktop may render the hero and coordinate segments separately so they appear continuous without coupling layout measurements. Mobile stops the hero signal beside the authored phrase and starts a new vertical coordinate rail after the portrait.

Reject:

- highlighting the words `reason` and `act` in cobalt;
- a dual-dot bracket around both statements;
- a cobalt portrait border or drop shadow;
- a connector that continues through Atlas, Moments, or the footer;
- fake coordinates, scanner labels, or random technical numbers.

## Research Coordinates lock

The four territories form one relational field, not four cards:

- AI Agents → Nova, PayGate
- Trustworthy Autonomous Systems → Fradium, Nova
- On-chain Intelligence → Fradium, Quorum
- Agentic Payments → PayGate, Quorum

Desktop uses four unboxed nodes on one concept rail. Mobile uses one continuous vertical rail. Every node retains its title, concrete summary, and real related-project links without hover or motion.

## Static Atlas composition contract

The checked-in Atlas assets already define the authentic visual vocabulary. The golden slice must implement these bounded scenes before motion:

| Project | Stage | Static composition |
| --- | --- | --- |
| Fradium | 7/12, wide-left | 4:5 canvas; wallet result primary at left/top and send verdict support at right/bottom; maximum 10% edge overlap |
| Nova | 5/12, narrow-right | 5:4 canvas; workspace centered/top and intent fragment lower-right; no added glow; 64px mark remains at or below 32 CSS px |
| PayGate | 5/12, narrow-left | 6:5 canvas; request receipt top-left and transform flow lower-right with near-zero content overlap |
| Quorum | 7/12, wide-right | 7:5 canvas; tall pass left, settlement proof right, authentic settlement rail behind |

Shared stage DOM remains `header → figure → footer`. Every stage owns its logo, question, answer, role, flow, authentic artifacts, outcome, and case-study action. Product UI is intrinsic/contained, upright, and never rendered through a destructive `cover` crop.

The mobile validation board shows four scroll-position viewports from one 390px page. Production DOM order is always `Fradium → Nova → PayGate → Quorum`; stages never become a horizontal carousel and no project is hidden behind an interaction.

## Motion contract

The `Signal → System` sequence is a bounded enhancement inside the active project stage:

1. empty artifact slots and a quiet signal origin;
2. the signal rail resolves toward the primary artifact;
3. the primary artifact appears without scale pop or layout movement;
4. the support artifact appears with no more than 8px of transform travel;
5. the static final composition and case-study action remain available.

The sequence does not pin, scrub, loop, or intercept scrolling. The no-JavaScript and `prefers-reduced-motion: reduce` experience renders keyframe five immediately with zero layout shift and no missing content.

## Approval checklist

- [x] Research Instrument desktop and mobile direction
- [x] restrained Signal Cartography connector grammar
- [x] Atlas desktop idle/focus art direction
- [x] Atlas 390px single-column validation
- [x] PayGate flagship case-study opening
- [x] Moments desktop and 390px compositions
- [x] concise `Signal → System` keyframe storyboard
- [x] authentic source assets remain visible and undistorted
- [x] exact grid, type, crop, and reduced-motion rules documented
- [ ] Wildan approves the complete board

Gate 1 closes only after Wildan approves this complete board. Final homepage/Atlas layout and production motion remain gated until that approval.
