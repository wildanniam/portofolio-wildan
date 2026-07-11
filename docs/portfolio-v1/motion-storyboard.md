# Motion Storyboard — Fradium Golden Case Study

Date: 11 July 2026
Status: implemented preview checkpoint; pending Wildan visual approval and final Fradium verdict media
Motion intensity: **7/10, concentrated in the opening and evidence explorer**

## Implementation checkpoint — Issue #13

The golden prototype now exists on the protected V1 preview as a progressive
enhancement over complete server-rendered markup. Its measured implementation
uses one CSS-sticky index, one ScrollTrigger, one scoped GSAP timeline, and one
inert visual overlay whose geometry follows the live source frame before it
expands. No spacer, pin wrapper, duplicated caption, or animated layout property
is introduced.

- Guard: at least `1120×760`, precise pointer, motion allowed, and Save-Data off.
- Cold homepage JavaScript: 171,719 gzip bytes under the narrowly rebaselined
  175,000-byte ceiling; route-owned initial code is 2,082 bytes.
- Near/intent lazy enhancement: one 46,021-byte gzip chunk, zero pre-intent
  bytes, zero overlap with the cold build set, and zero WebGL requests.
- Browser coverage: cold loading, overlay invariants, immediate semantics,
  keyboard focus, history, rapid interruption, exact viewport boundaries,
  live Save-Data changes, lazy-load failure, reduced motion, mobile, CLS, axe,
  and no-JavaScript fallback.
- Remaining approval gate: Wildan reviews the motion checkpoint; the eventual
  sanitized login-protected Fradium verdict capture replaces the temporary
  public-beta lead evidence before Fradium is marked publishable.

## Visual sources

- [Editorial visual base](./references/visual-base-editorial.png)
- [Project-index and evidence interaction structure](./references/interaction-structure-evidence.png)

The final direction combines the cold light editorial surface and generous typography of the first source with the project index, selected evidence state, and context-to-proof logic of the second source.

## Motion thesis

The page is quiet at rest and sophisticated in use. Motion performs one job:

> Move the visitor from project context to inspectable evidence.

The portfolio does not animate every section to prove that it is interactive. The opening establishes authorship; the evidence explorer delivers the memorable sequence; the rest of the site uses restrained native interaction.

## Motion ownership

| Surface | Owner | Driver |
|---|---|---|
| Opening reveal | `OpeningFrame` | CSS-only decorative sequence; no eager client motion chunk. |
| Hero media drift | `OpeningFrame` | None in V1; media leaves with native document flow. |
| Evidence expansion | `WorkEvidenceExplorer` | One bounded desktop ScrollTrigger timeline. |
| Project switching | `WorkEvidenceExplorer` | Click/keyboard timeline using the same states as the scroll sequence. |
| Case-study figures | `EvidenceSequence` | Static server-rendered figures plus CSS/native focus states; no scroll choreography in V1. |
| Photo focus | `MomentsSection` | Enabled only after selected derivatives pass caption, rights/consent, redaction, metadata-removal, and crop approval. |
| Links, buttons, focus | CSS | Native hover/focus/active states. |

No global animation controller owns the entire page. No route depends on motion to become readable.

## Scene A — opening frame

The server-rendered first frame already contains the name, role, thesis, navigation, and Fradium poster. A CSS-only decorative sequence may enhance this visible state; it never begins from a blank loader or downloads GSAP for the opening.

| Frame | Time | Visitor sees | Motion | Implementation note |
|---|---:|---|---|---|
| A0 — first paint | 0 ms | Complete semantic copy, active navigation/contact links, and reserved Fradium media dimensions. | None required for readability or interaction. | Server-render content; avoid opacity-zero SSR markup and hydration-time `from()` on primary copy. |
| A1 — frame line | 0–300 ms | Header rule and small W/SN identity settle into place. | A decorative rule scales from the left; a visual-only metadata accent moves `y: 8` to `0`. | Transform only; the semantic metadata never depends on the tween. |
| A2 — authored name | 120–720 ms | `WILDAN SYUKRI NIAM` remains the dominant typographic object from first paint. | Optional decorative masks travel over already visible line groups; the name itself is not hidden before hydration. | No character split and no blank-name state. |
| A3 — thesis | 380–850 ms | Role and thesis remain readable beneath the name. | A nearby decorative rule/cover performs the handoff; primary copy stays in its final position. | No opacity-zero or blur filter on the semantic thesis. |
| A4 — Fradium reveal | 450–1050 ms | The real Fradium hero still opens beneath the thesis. | A dark cover translates away while the image scales from `1.025` to `1`. | Overflow-hidden cover and transform; avoid animated width/height and expensive clip paths. |
| A5 — emphasis complete | 900–1150 ms | Work, GitHub, Contact, and résumé retain the interactions they had at first paint. | Cobalt hover/focus rules remain CSS-driven; no bouncing CTA. | Links are active at A0; the decorative sequence never gates them. |

### Opening constraints

- Total entrance duration: approximately 1.1 seconds.
- The visitor can interact before the decorative sequence completes.
- No letter-by-letter scramble, fake loading percentage, terminal typing, or intro gate.
- Returning through browser navigation should not replay the full intro aggressively; a short state restore is enough.

## Scene B — opening-to-work handoff

The Fradium image bridges the hero and selected work instead of behaving like a disposable banner.

| Scroll interval | Visitor sees | Motion |
|---|---|---|
| Hero 0–60% visible | Name and media remain stable. | No scroll-driven motion. |
| Hero 30–0% visible | The image begins to feel like the first item in an archive. | The large name and media leave through native document flow. |
| Work explorer enters | Four-project index and Fradium contact sheet are already visible. | One cobalt rule draws to establish the active project; no blanket section fade-up. |

This handoff uses native page scroll. The hero is not pinned and there is no page-wide smooth-scroll replacement.

## Scene C — signature contact sheet to evidence frame

### Desktop structure

- One optional local CSS-sticky sequence, enabled only when viewport width and height, zoom/large-text testing, input mode, and motion preference make it comfortable.
- Scroll distance is derived from a prototype using real Fradium media and copy. No `vh` distance becomes a contract before measurement.
- One parent GSAP timeline with one ScrollTrigger.
- Scrub value is tuned in the same prototype and tested on low-end hardware.
- Direct project links remain visible before or beside the sequence. Critical text remains static and never depends on scrub progress.

### Storyboard states

| Frame | Timeline progress | Visitor sees | Motion and meaning |
|---|---:|---|---|
| C0 — context | 0.00 | Fradium selected in the four-project index. A contact sheet shows authentic product, architecture, technical proof, and moment items. | No active transformation. The visitor understands the available evidence before anything moves. |
| C1 — selection | 0.12 | The product thumbnail and its caption become active. | Cobalt rule reaches the selected thumbnail; thumbnail moves `y: -4` and scales no more than `1.015`; others reduce emphasis without disappearing. |
| C2 — detach | 0.28 | The selected thumbnail separates visually from the sheet. | A measured, visual-only overlay begins at the thumbnail's exact bounding box; source thumbnail remains reserved to prevent layout shift. The overlay is `aria-hidden="true"`, `inert`, and contains no IDs, links, buttons, or duplicate captions. |
| C3 — expand | 0.28–0.58 | The real Fradium screenshot grows into the large evidence frame. | Transform-only translation and scale interpolate to the target frame. Surrounding captions reorganize through short crossfades, not animated layout properties. |
| C4 — inspect | 0.58–0.76 | The full screenshot expands inside the evidence column while the selected-project index remains visible beside it. | Image settles from `scale: 1.01` to `1`; the local frame never becomes a viewport-wide modal or covers the project controls. |
| C5 — proof | 0.76–0.90 | Architecture or technical proof becomes the next clear action. | The expanded frame returns toward its reserved source and dissolves, revealing the secondary evidence, captions, and actions in normal flow. No automated carousel. |
| C6 — release | 0.90–1.00 | The complete selected-work composition is visible. | Sticky state releases into normal document flow; no snap and no surprise horizontal scroll. |

### Project switching

Every project has a normal case-study anchor. A separate preview button group controls the evidence panel. Each preview button uses `aria-controls`, `aria-pressed`, and an explicit accessible name; focus stays on the activating button, and a concise live status announces the selected preview. The explorer does not use partial tab semantics. Selecting the Nova AI, PayGate, or Quorum preview uses the same visual state model:

1. Current caption exits by 8–12 px and `autoAlpha`.
2. Current evidence frame returns to its contact-sheet position or resolves directly into the next frame when rapid selection makes a return visually noisy.
3. Semantic selected state and panel content update immediately; the visual overlay may trail for 650–850 ms without delaying assistive technology.
4. New thumbnail expands into the same stable frame.
5. Focus remains on the activating preview button; a concise status message announces the newly selected project.

Target visual duration: 650–850 ms with `power3.inOut`. Interruption must be safe: a new selection overwrites the active transition without leaving duplicated overlays or stale captions. With JavaScript disabled, four summaries, posters, and anchors remain present in normal flow.

## Scene D — case-study page

The Fradium case study uses evidence chapters, not a continuous cinematic scroll.

| Chapter | Motion behavior |
|---|---|
| Problem | Static editorial opening. |
| Role and constraint | No special effect; typography and source links carry credibility. |
| System behavior | A responsive static diagram and accompanying explanation remain visible together; optional native links/focus identify details. |
| Technical proof | Test, transaction, trace, or source artifact remains static and inspectable; never fabricate live telemetry or animated zoom. |
| Outcome | Verified result and source appear together; no number counter animation. |
| Where it stands | Completely static and easy to read. Current state and next iterations are contextual, not dramatized. |

Case-study figures remain in normal flow and no case-study sequence is sticky in V1. Scroll-owned figure choreography is deferred so the evidence explorer remains the one signature interaction.

## Scene E — moments in the build

This scene is asset-ready but remains publication-gated until the selected derivatives have approved captions, rights/consent, redactions, metadata removal, and focal crops.

When enabled:

1. Rights-cleared related photographs form a real contact sheet only when multiple images improve the story; one exceptional lead image can stand alone.
2. One selected photograph may expand to a lead frame.
3. Event, date, project, factual caption, and short reflection appear beside it.
4. The selected photo can change by click, keyboard, or swipe.
5. The sequence never manufactures depth with fake Polaroid stacks or synthetic event imagery.

Photo movement must respect crop focal points stored in content metadata. Portrait and landscape sources use authored layouts rather than being forced into one rectangle.

## Interaction states

| Interaction | Visual response | Accessibility equivalent |
|---|---|---|
| Hover project row | Text moves 6 px, cobalt rule grows, media preview gains contrast. | `:focus-visible` produces the same emphasis. |
| Preview project | Evidence transition runs and metadata updates. | A separate button exposes `aria-controls` and `aria-pressed`; status is announced while focus stays put. |
| Open project | Normal route navigation. | A persistent semantic anchor works with keyboard, pointer, touch, assistive technology, and no JavaScript. |
| Hover evidence thumbnail | Caption becomes clearer and image scales <= 1.015. | Keyboard focus and touch selected states. |
| Open case study | Underline/rule completes and route navigation begins. | Normal anchor semantics; no click-only div. |
| Reduced motion | No expansion travel or scrub. | Immediate state change with a short opacity handoff <= 150 ms. |

## Responsive storyboard

### Wide layout, >= 1024 px

- Full optional CSS opening reveal.
- Project index and evidence may coexist from 1024 px.
- One bounded CSS-sticky evidence sequence only when the prototype-defined guard passes: at least 1120 px width, 760 px height, precise pointer, motion allowed, and real-media measurement approved.
- A 1024–1119 px viewport uses the wide static layout without sticky enhancement.
- Project index and evidence frame can coexist.
- Click/keyboard switching uses the full measured transform.

### Tablet, 768–1023 px

- Shorter opening reveal.
- No long pin; evidence frame follows the project index in normal flow.
- Selected thumbnail may crossfade and scale in place rather than travel across a large distance.

### Mobile, < 768 px

- Content order: project link, preview control, role/outcome, hero media, evidence thumbnails, case-study link.
- No sticky sequence and no horizontal-scroll illusion.
- Tap changes the in-flow evidence frame with a 250–400 ms transform/opacity transition.
- Swipe is optional and never the only control.
- Fradium first paint uses a mobile crop or poster, not the entire desktop screenshot compressed into unreadability.

### Reduced motion

- Skip scroll-scrubbed travel, parallax, and thumbnail expansion.
- Render the selected evidence directly in its final frame.
- Preserve cobalt selection, captions, project switching, and all links.
- Use `gsap.matchMedia()` to create and automatically revert the correct motion context.

## GSAP implementation contract

- Load GSAP/ScrollTrigger only when the explorer approaches the viewport or receives explicit preview intent; it is measured as a separate enhancement chunk, not initial navigation JavaScript.
- `gsap.timeline()` with labels: `context`, `selection`, `expand`, `inspect`, `proof`, `release`.
- At most one ScrollTrigger on the parent evidence timeline; never nested ScrollTriggers on child tweens. CSS sticky establishes layout, while ScrollTrigger enhances the bounded visual progression.
- `useGSAP()` with a scoped container ref for React cleanup.
- `contextSafe()` for click/keyboard callbacks that create or control timelines after initial setup.
- Transform aliases and `autoAlpha`; avoid animated `width`, `height`, `top`, `left`, margin, or padding.
- Read source and target bounds together before writing transforms to avoid layout thrashing.
- `overwrite: "auto"` or explicit timeline cancellation for rapid project switching.
- `ScrollTrigger.refresh()` only after real media/layout changes and never continuously.
- `will-change` only while a measured overlay or media frame is active.
- Product loops are poster-first. Autoplay is allowed only when muted, `playsInline`, motion is permitted, and Save-Data is off; otherwise explicit intent starts playback. Any motion over five seconds has visible pause/play, and important demos include textual steps or a transcript.
- Pause product loops and inactive motion outside the viewport.

## Performance and QA gates

The storyboard is accepted for implementation only when:

- no animation blocks first content or interaction;
- no layout shift is introduced by overlays, images, video posters, or sticky release;
- the evidence transition stays smooth on a representative mid-range laptop and Android device;
- the page remains fully usable with JavaScript disabled except for enhanced selection behavior;
- the no-JavaScript document exposes all four summaries, evidence posters, and case-study anchors;
- keyboard, touch, and pointer can select every project and evidence item;
- reduced motion removes travel rather than merely speeding it up;
- mobile mounts no unnecessary desktop pin or WebGL code;
- off-screen timelines and ScrollTriggers are cleaned up;
- text never becomes unreadable during a scrubbed state;
- the same content is present before, during, and after animation.

## Explicitly rejected motion

- blanket fade-up for every section;
- perpetual particles, floating cards, or ambient object rotation;
- custom cursor effects that hide native affordances;
- magnetic buttons across the page;
- text scramble or fake terminal typing;
- award counters;
- autoplay carousel;
- full-page horizontal scroll;
- page-wide scroll smoothing or hijacking;
- 3D camera movement in V1;
- motion whose only purpose is to make a static layout look busier.

## Prototype gate

Before building the full homepage, implement only the Fradium evidence explorer with the smallest authentic set that proves product reality, system reasoning, and verification at desktop and mobile widths. Derive sticky eligibility and scroll distance from that real-media prototype. Approve readability, interruption behavior, no-JavaScript semantics, reduced-motion state, and performance before the same component is fed Nova AI, PayGate, and Quorum data.
