# DESIGN — The Open Proving Ground

Date: 11 July 2026
Status: **ready-for-review design contract**
Applies to: V1 homepage, work archive, four flagship case studies, moments, about, and contact

## 1. Product and visual thesis

The portfolio is an **evidence-first editorial archive** for technical founders, recruiters, program evaluators, and other builders. It should feel authored, technically credible, and alive without resembling a dashboard, a résumé template, or a generic creative-developer showcase.

The work is the spectacle. Product screenshots, diagrams, traces, transactions, and documentary photographs carry the visual weight. Interface chrome stays quiet and precise.

The locked concept is **The Open Proving Ground**:

- light-only, cold editorial surface;
- large, direct typography;
- thin structural rules;
- one cobalt interaction accent;
- authentic project evidence;
- one signature contact-sheet-to-evidence-frame interaction;
- no permanent 3D/WebGL, decorative tech objects, glass cards, or fake telemetry.

Visual sources:

- [Editorial visual base](../references/visual-base-editorial.png)
- [Project-index and evidence interaction](../references/interaction-structure-evidence.png)

## 2. Brand register

| Axis | Target |
|---|---|
| Personality | Precise, ambitious, candid, curious, builder-led |
| Visual variance | 7/10 — distinctive composition without novelty for its own sake |
| Motion | 6/10 globally, 8/10 inside the one signature interaction |
| Density | 4/10 — generous rhythm, compact evidence where inspection benefits |
| Voice | Direct English, concrete verbs, short claims, visible provenance |
| Credibility | Owner attestation for Wildan's role; public sources for third-party outcomes |

The portfolio celebrates hackathon projects as real build artifacts. It does not apologize for their origin or imply production history they do not have.

## 3. Design principles

1. **Evidence before decoration.** Every prominent visual must prove product reality, system reasoning, verification, or a real human moment.
2. **Editorial hierarchy before card grids.** Use scale, alignment, whitespace, and rules to create structure.
3. **One memorable interaction.** Concentrate GSAP effort in the flagship evidence explorer; ordinary controls remain native and restrained.
4. **Server-visible by default.** Critical copy, media posters, claims, and links exist at first paint and without JavaScript.
5. **Specific over comprehensive.** Four flagship stories, a few strong moments, and one current signal are stronger than a wall of skills and projects.
6. **Motion explains state.** It may show selection, origin, expansion, and handoff; it must not be ambient filler.
7. **Mobile is authored.** Mobile uses a different composition, not a compressed desktop storyboard.

## 4. Color system

Project brand colors belong inside authentic media. They do not become portfolio UI accents.

| Token | Value | Use |
|---|---:|---|
| `--canvas` | `#F4F5F3` | Main cold editorial background |
| `--surface` | `#FFFFFF` | Figure and content surface |
| `--surface-subtle` | `#EAECED` | Selected metadata or quiet grouping |
| `--ink` | `#111315` | Display type and primary text |
| `--text` | `#2B3035` | Body copy |
| `--text-muted` | `#555C63` | Captions and secondary metadata |
| `--rule` | `#C9CED3` | Decorative hairline only; never the sole meaningful boundary/state cue |
| `--rule-strong` | `#20252A` | Important frame or divider |
| `--accent` | `#2448D8` | Selection, focus, and active link |
| `--accent-hover` | `#1836B6` | Hover and pressed state |
| `--accent-soft` | `#E8ECFF` | Selected-row surface when needed |
| `--media-matte` | `#101214` | Screenshot/video letterbox |

Contrast requirements:

- normal text: at least WCAG AA `4.5:1`;
- large text: at least `3:1`;
- controls, focus, and meaningful rules: at least `3:1` against adjacent surfaces;
- muted text is not allowed for essential instructions or links.

## 5. Typography

Use **Geist Sans** and **Geist Mono** through `next/font/google`; the production build self-hosts the resulting font files. Before implementation, record the exact upstream source/version and retain the verified license notice. V1 introduces no third typeface unless the opening typesetting checkpoint fails and a replacement passes a new license/performance review.

The verified source commits, binary versions, copyright notice, and retained
OFL 1.1 text are recorded in the
[typography source and license record](../typography-source.md).

| Style | Family and specification |
|---|---|
| Display XL | Geist Sans, `clamp(3.5rem, 9vw, 8.75rem) / 0.88`, weight 600, tracking `-0.055em` |
| Display L | Geist Sans, `clamp(2.75rem, 6vw, 6rem) / 0.94`, weight 600, tracking `-0.045em` |
| Heading L | Geist Sans, `clamp(2rem, 3.4vw, 3.75rem) / 1`, weight 600 |
| Heading M | Geist Sans, `clamp(1.5rem, 2.2vw, 2.5rem) / 1.08`, weight 600 |
| Body L | Geist Sans, `clamp(1.125rem, 1.3vw, 1.375rem) / 1.5`, weight 400 |
| Body | Geist Sans, `1rem / 1.6`, weight 400 |
| Small | Geist Sans, `0.875rem / 1.45`, weight 400 |
| Metadata | Geist Mono, `0.6875rem / 1.4`, weight 500, tracking no more than `0.08em` |

Rules:

- Wildan's full name is the dominant typographic object and may wrap to two authored lines.
- Body prose is capped at `68ch`; short theses at approximately `34ch`.
- Mono is reserved for dates, lifecycle, role metadata, evidence labels, source labels, and compact numbering.
- Avoid uppercase mono eyebrows above every section. Section hierarchy should vary by content.
- Do not hide semantic text for an entrance animation or split every heading into animated characters.

## 6. Grid and spacing

| Viewport | Grid | Gutter | Gap |
|---|---:|---:|---:|
| Desktop `>=1280px` | 12 columns, max content `1520px` | `clamp(32px, 4vw, 64px)` | `24px` |
| Tablet `768–1279px` | 8 columns | `clamp(24px, 4vw, 48px)` | `20px` |
| Mobile `<768px` | 4 columns | `16px` | `16px` |

Layout bands and enhancement eligibility are separate:

- `<768px`: mobile composition;
- `768–1023px`: tablet composition;
- `1024–1279px`: wide composition that may place index and evidence side by side, but does not automatically become sticky;
- `>=1280px`: wide composition plus the 12-column/max-container rule;
- sticky GSAP enhancement: independently guarded by at least `1120px` width, `760px` height, precise pointer, allowed motion, and successful real-media measurement.

Therefore a 1024px viewport may use a wide static composition while correctly declining the sticky enhancement.

Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160px`.

- Default section separation: `clamp(72px, 9vw, 144px)`.
- Use one `SiteContainer` rather than independent max-width values.
- Major alignments must snap to the shared grid; media may deliberately bleed when the composition calls for it.
- Horizontal overflow is a defect, not something to hide with `overflow-x: hidden` on the page shell.

## 7. Shape and material

- Editorial sections and media frames use square corners.
- Interactive controls may use `2px` radius.
- Pills are reserved for a true status and should remain rare.
- Default divider: `1px solid var(--rule)`. Because this light rule is decorative, it cannot be the only boundary or state cue for meaningful UI.
- Strong evidence frame: `1px solid var(--rule-strong)`.
- Active selection: a `2px` cobalt edge, rule, or outline; do not combine all three.
- No glass blur, neon glow, moving grain, scanline, card halo, ambient blob, or decorative shadow stack.
- The only allowed elevation is an actively expanding media overlay: `0 12px 40px rgb(17 19 21 / 0.10)`.

## 8. Media system

| Content | Default treatment |
|---|---|
| Product/evidence | `16:10`, preserve readable UI detail |
| Documentary/architecture | `3:2` when the source supports it |
| Portrait/moment | `4:5` or an authored intrinsic crop |
| Thumbnail | `1:1` or an explicitly declared project-specific crop |
| Video | Poster-first; silent and user-controllable |

Rules:

- Captions sit outside the image rather than becoming overlays.
- Every published image declares dimensions, alt text, crop policy, and provenance. Focal point is mandatory when the crop policy is focal and omitted for intrinsic media.
- Use `object-position` from content metadata, not arbitrary centered cropping.
- Dark product screenshots may use `--media-matte`; do not recolor them to match the interface.
- Technical proof may keep an intrinsic ratio when cropping would destroy legibility.
- Generated diagrams must be labeled as explanatory diagrams and may not impersonate screenshots, transactions, awards, people, or real outcomes.
- Photo masters remain outside the repository. Only approved, redacted, EXIF-stripped, optimized derivatives enter `public/media`.

## 9. Component vocabulary

The site should not have a universal `Card`, `DeckPanel`, or `Badge` grammar.

### Foundations

- `SiteShell`
- `SiteHeader`
- `SiteFooter`
- `SiteContainer`
- `EditorialGrid`
- `SectionRule`
- `ActionLink`
- `MetadataLine`
- `OpeningFrame`
- `CurrentlyBuilding`
- `ArchiveList`
- `AboutContact`

### Evidence and work

- `WorkEvidenceExplorer`
- `ProjectIndex`
- `ProjectIndexRow`
- `EvidencePreviewButton`
- `EvidenceContactSheet`
- `EvidenceFrame`
- `MediaRenderer`
- `EvidenceFigure`
- `EvidenceCaption`
- `ProjectFacts`
- `SourceLink`

### Case study

- `ProjectBriefPage`
- `CaseStudyHeader`
- `NarrativeSection`
- `RoleAndCredits`
- `ConstraintBlock`
- `DecisionRecord`
- `SystemFlow`
- `EvidenceSequence`
- `OutcomeBlock`
- `ProjectStatus`
- `NextIteration`
- `NextProjectNavigation`

### Moments

- `MomentsSection`
- `MomentContactSheet`
- `MomentFigure`
- `MomentCaption`

Components are generic to content function. There must be no `FradiumSection`, `NovaSection`, `PayGateSection`, or `QuorumSection`.

## 10. Interaction and motion tokens

| Interaction | Duration |
|---|---:|
| Immediate semantic state | `0–100ms` |
| Hover/focus | `140ms` |
| Ordinary state change | `220ms` |
| Mobile evidence swap | `250–400ms` |
| Signature expansion | `650–850ms` |

Standard easing: `cubic-bezier(0.16, 1, 0.3, 1)` in CSS and `power3.inOut` for the signature GSAP transition.

- Ordinary links, hover, focus, and pressed states use CSS.
- Opening decoration is CSS-only, never hides primary copy, and adds no eager motion client chunk.
- The explorer owns one project-switch timeline and at most one bounded parent ScrollTrigger.
- The semantic selected project changes immediately. The visual overlay may follow without blocking assistive technology.
- Any overlay is `aria-hidden`, inert, unfocusable, and contains no duplicate IDs or captions.
- Reduced motion removes travel, pinning, scrub, parallax, and expansion. It does not merely accelerate them.
- Focus style: `2px solid var(--accent)` with a `3px` canvas-colored offset.

### Implementation token namespace

Use semantic variables instead of scattering numeric values through components:

| Category | Required token names |
|---|---|
| Fonts | `--font-sans`, `--font-mono` |
| Type sizes | `--type-display-xl`, `--type-display-l`, `--type-heading-l`, `--type-heading-m`, `--type-body-l`, `--type-body`, `--type-small`, `--type-meta` |
| Line heights | `--leading-display`, `--leading-heading`, `--leading-body`, `--leading-meta` |
| Spacing | `--space-1` through `--space-11`, mapped in order to the approved scale |
| Layout | `--site-gutter`, `--site-max`, `--grid-gap`, `--section-space`, `--prose-max` |
| Motion | `--duration-hover`, `--duration-state`, `--duration-preview`, `--duration-signature`, `--ease-standard` |
| Layering | `--layer-base: 0`, `--layer-sticky: 20`, `--layer-header: 30`, `--layer-motion-overlay: 40`, `--layer-modal: 50` |

Tailwind utilities may reference these variables, but the variables remain the documented source of truth. Components must not invent new z-index scales or motion durations without updating this contract.

The four required line-height tokens are the coarse semantic defaults. The
foundation may define `--leading-display-l`, `--leading-heading-m`,
`--leading-body-l`, and `--leading-small` to encode the other exact values in
the typography table; these are documented variants, not component-local
inventions.

## 11. Responsive composition

### Wide composition, >=1024px

- Large opening type and one dominant Fradium frame.
- Project index and selected evidence can coexist.
- Sticky evidence enhancement remains disabled until real-media testing passes at `min-width: 1120px`, `min-height: 760px`, precise pointer, and no reduced-motion preference.
- Scroll distance comes from measured content, not a fixed decorative `vh` value.

### Tablet

- Use an authored eight-column layout.
- Project index precedes the evidence frame in normal flow.
- No long pin or horizontal-scroll illusion.
- Evidence may crossfade/scale in place instead of travelling across the layout.

### Mobile

- Content order: project link, preview control, role/outcome, evidence frame, thumbnails, case-study link.
- No sticky sequence.
- One lead gallery image may be followed by a two-column contact sheet only when crop legibility survives; otherwise use one column.
- Use intentional mobile product crops; never shrink an entire desktop UI until it becomes unreadable.
- Viewport-sensitive composition uses `100dvh`, with content-safe fallbacks.

## 12. Required state matrix

Every interactive component must be designed and checked for:

| State | Required behavior |
|---|---|
| Default | Semantic content and route links are present |
| Hover | Optional visual emphasis; no hidden-only action |
| Focus-visible | Equal or stronger emphasis than hover |
| Active/pressed | Immediate feedback without layout shift |
| Selected | Cobalt state plus a non-color cue |
| Loading | Reserved dimensions; no fake progress theatre |
| Error | Plain-language recovery and stable layout |
| Empty/unavailable | Honest lifecycle/link state; no production placeholder frame |
| Reduced motion | Direct final state, no travel or scrub |
| No JavaScript | All four project summaries, posters, and route links remain usable |

## 13. Explicitly rejected patterns

- dark reactor or mission-control theme;
- WebGL hero or decorative 3D assets in V1;
- generic rounded card wall;
- skill-chip cloud or icon-tile technology grid;
- pointer-follow glow, custom cursor, floating particles, or ambient rotation;
- blanket fade-up on every section;
- fake terminal typing, text scramble, counters, or loading gate;
- autoplay carousel and page-wide smooth scrolling;
- fabricated dashboards, proof, award photography, or telemetry;
- project-specific component forks and hard-coded project order in motion code.

## 14. Design acceptance gate

The foundation is approved before feature development when:

- tokens are implemented once and documented;
- typography and grid match this contract at desktop, tablet, and mobile;
- focus and contrast pass automated and manual checks;
- the exact Geist source/version and license notice are recorded;
- the shell works with JavaScript disabled;
- sample product media remains readable without decorative compensation;
- the output is visibly aligned with both locked reference images;
- a reviewer can identify project evidence as the visual focus, not the UI system.
- the Geist-only opening typesetting is explicitly approved at 1440×900 and 390×844; if it reads as generic, type direction is corrected here before feature replication, with any new font requiring a license and performance decision.
