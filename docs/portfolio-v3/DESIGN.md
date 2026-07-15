# Portfolio V3 Design Lock

> [!WARNING]
> Historical presentation direction. It has been superseded by
> [Portfolio V4 — Research / Build Atlas](../portfolio-v4/README.md).
> Preserve this document only as implementation history.

Status: locked for implementation on Issue #25  
Owner: Wildan Syukri Niam  
Implementation branch: `codex/25-portfolio-v3-integration`

## Product promise

The portfolio must make Wildan legible as a strong student software engineer who can lead ambitious builds, work across the stack, and explain what was actually made. It is a living showcase, not a resume page, a trophy wall, or a fictional product company.

The first visit must answer four questions quickly:

1. Who is Wildan?
2. What kind of systems does he build?
3. What proof makes the claim credible?
4. Where can I inspect a project in more depth?

## Locked creative direction

The direction is a contemporary builder journal with the confidence of an independent technology publication. The experience combines oversized editorial typography, documentary photography, precise product media, and a restrained cobalt navigation system.

It must feel authored, energetic, and human. It must not feel like a generic SaaS landing page, a brutalist wireframe, a bento template, or a card collection generated from one reusable pattern.

### Visual character

- Light editorial canvas as an intentional brand choice.
- Deep graphite text with one cobalt interface accent.
- High-contrast display serif used only for major statements and project titles.
- Crisp grotesk sans used for navigation, facts, body text, and controls.
- Documentary photography carries warmth. Interface chrome remains restrained.
- Composition uses scale, overlap, cropping, and negative space without hiding content.
- Rules and metadata clarify hierarchy. They are not decorative filler.

### Typography

- Display: Bodoni Moda, 500 and 600.
- Text and interface: Archivo, 400 through 700.
- Technical metadata: Geist Mono, 500 and 600.
- Display type is reserved for the hero, route openings, and project titles.
- Body measure is 58 to 72 characters.
- Paragraph text never masquerades as a heading.

### Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F2F0E8` | Main canvas |
| `paper-raised` | `#FBFAF5` | Dialog and focused reading surfaces |
| `ink` | `#11120F` | Primary text and strong rules |
| `ink-soft` | `#55564F` | Supporting copy |
| `line` | `rgba(17, 18, 15, 0.18)` | Structural rules |
| `cobalt` | `#3047FF` | Links, focus, selected controls |
| `cobalt-soft` | `#DDE2FF` | Selected-state fill only |

Project and event colors may appear inside authentic media. They do not become additional interface accents.

### Geometry

- Desktop content width: up to 1480px.
- Desktop grid: 12 columns, 24px gaps, 48 to 64px gutters.
- Tablet grid: 8 columns, 20px gaps, 28 to 36px gutters.
- Mobile grid: 4 columns, 14px gaps, 18 to 22px gutters.
- Navigation height: 72px desktop, 64px mobile.
- Controls: minimum 44px target on touch devices.
- Corners are mostly square. A 999px radius is reserved for pills and compact status labels.
- Media cropping is intentional and driven by the content focal-point contract.

## Homepage narrative

### 1. Header

- Wordmark at left, three primary destinations, contact action at right.
- Current route is exposed with `aria-current`.
- Mobile uses an accessible dialog-based menu with Work, Moments, About, and Contact.
- No hidden navigation at tablet or mobile sizes.

### 2. Hero spread

- One viewport-height editorial composition.
- Compact identity line: Wildan Syukri Niam and Software Engineer.
- Primary statement: `I build systems you can inspect.`
- Supporting thesis names AI, Web3, full-stack product work, and visible evidence.
- Documentary portrait interlocks with the type but never covers it.
- Primary action reaches Selected Work. Secondary action reaches GitHub.
- The hero portrait is the LCP candidate and loads eagerly.
- Initial state is complete without JavaScript.

### 3. Proof ribbon

- Four compact proof statements, each linked to its project or moment context.
- The ribbon includes the WCHL team win, PayGate Stellar Instaward, Nova recognition, and Refactory second place.
- It is a scan aid, not a second project section.

### 4. Project Atlas

- Four flagship projects appear in the locked editorial order: Fradium, Nova AI Wallet, PayGate, Quorum.
- The atlas is an asymmetric two-row composition, not four cloned cards.
- Each project shows title, one-line premise, role, one outcome, media, and a clear detail link.
- Fradium and Quorum use wider landscape treatments. Nova and PayGate use tighter column treatments.
- Images remain inside their layout cells. No pointer-following preview and no pinned overlay.
- At mobile sizes every item becomes a self-contained editorial plate in the same reading order.

### 5. Moments mosaic

- Documentary moments show the journey around the systems.
- Editorial order is explicit. It never depends on file names or CSS `nth-child` behavior.
- Lead, landscape, portrait, and evidence variants create rhythm.
- Each frame opens an accessible lightbox with title, context, reflection, event, date, place, and navigation.
- Responsive derivatives and focal points are honored.

### 6. Current build note

- PayGate appears as a compact current-build dispatch after the broader portfolio story.
- It includes state, one-sentence focus, and a link. It does not dominate the homepage.

### 7. About and contact close

- A concise human statement explains Wildan's working principles and current direction.
- Contact remains visible, legible, and unbroken on narrow screens.
- Footer repeats only durable navigation and copyright.

## Work index

- The page is a visual archive, not a second homepage.
- Flagship projects appear first in homepage order, followed by the remaining published work in stable editorial order.
- Each row or plate includes a bounded thumbnail, role, lifecycle, year, and premise.
- There is no hover media that blocks the viewport.
- Keyboard and touch users receive the same information and destination.

## Case-study template

The opening two viewports must contain:

- Project title and one-line premise.
- Role, lifecycle, period, collaboration context, and technology summary.
- Primary outcome or externally verified proof.
- Live and source actions when public.
- One authentic product image.

The reading sequence is:

1. Outcome and project reality.
2. Problem and intended users.
3. Wildan's contribution and team boundary.
4. Two or three consequential decisions.
5. System flow or implementation explanation.
6. Evidence and reflection.

Rules:

- 700 to 1100 visible words for a flagship case study.
- Five to seven chapters.
- Maximum three primary evidence assets.
- At least two authentic product or documentary artifacts where available.
- Maximum one portfolio-authored diagram by default.
- Structured YAML owns facts and opening metadata.
- MDX owns only unique narrative that is not already rendered from YAML.
- Limits are stated once in context, not repeated defensively.

## Moments route

- Opening explains the gallery as documentary evidence of learning and collaboration.
- Category filters are optional scan aids and have visible selected states.
- Grid uses explicit mode classes from content.
- Dialog overlay is opaque enough to isolate the image.
- Escape, close, previous, and next controls work with correct focus handling.
- Dialog title and description are always present.

## About route

- Approximately 400 to 500 words.
- Covers how Wildan works, how he makes systems inspectable, how teams fit into the work, and what he is exploring now.
- Uses one documentary portrait and a compact facts rail.
- Does not reproduce the CV or organization history.

## Contact route

- Compact, direct, and human.
- Email is the primary action and wraps safely.
- GitHub is secondary.
- Copy names the kind of conversations Wildan is open to without inventing availability.

## Motion lock

- One hero assembly sequence, 650 to 850ms total, starts after the static composition is complete.
- Interface transitions use CSS and stay between 160 and 240ms.
- Project media may use small scale and crop changes on hover only when pointer precision is available.
- No smooth-scroll hijacking, pinned sections, pointer followers, floating previews, blanket fade-ups, or scroll-jacking.
- `prefers-reduced-motion` removes all nonessential movement.

## Accessibility and responsive lock

- WCAG 2.2 AA contrast target.
- Visible focus states on every interactive element.
- Semantic heading order and landmark structure.
- Unique accessible names for repeated project links.
- 200 percent browser zoom and 320px width remain usable without horizontal scrolling.
- Tablet is a designed state, not a squeezed desktop layout.
- Mobile source and focal-point metadata are honored for real images.
- All dialog and menu interactions support keyboard use and focus return.

## Performance lock

- Server components remain the default.
- Client JavaScript is limited to navigation, lightbox, and the optional hero sequence.
- No WebGL or Three.js in V3.
- Hero image is eager and correctly sized.
- Images below the first viewport remain lazy.
- Layout shifts from media are prevented with known aspect ratios.
- Mobile Lighthouse targets: Performance 90 or higher, Accessibility 95 or higher, Best Practices 95 or higher, SEO 95 or higher on the release candidate.

## Explicit exclusions

- No generic bento grid.
- No repeated card topology for all sections.
- No glassmorphism, blobs, glowing orbs, fake dashboards, or custom cursor.
- No section-number decoration.
- No locale strip, scroll cue, or decorative status dots.
- No inaccessible hover-only information.
- No full-screen media preview during project-list scrolling.
- No content claim changes unless separately approved.
- No production merge without visual evidence and the quality gates in `QA_MATRIX.md`.
