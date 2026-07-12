# Design Specification — Personal Field Notes

Status: **candidate implementation contract**

Register: **brand UI with content-heavy editorial routes**

## 1. Audience and primary path

Primary audiences:

- technical recruiters and engineering leads;
- hackathon, grant, and accelerator reviewers;
- potential collaborators;
- other developers exploring Wildan's work.

Primary path:

1. identify Wildan within five seconds;
2. scan the four flagship projects;
3. choose a project and open its case study;
4. inspect role, decisions, working artifacts, outcome, and sources;
5. optionally explore Moments, GitHub, or contact links.

Homepage success is not “the visitor read everything.” It is “the visitor knows
which project to inspect next.”

## 2. Visual principles

### Structured before expressive

Expression comes from typography, crop, sequence, scale, and editorial pacing.
It does not come from random decoration, excessive rotation, sticker packs,
paper tape, visual noise, or motion that competes with reading.

### Real artifacts lead

Use authentic project surfaces, diagrams, award records, team photographs, and
build moments. Never use generated stand-ins when a real asset exists.

### General first, detail after intent

Homepage project entries contain only:

- project number and title;
- one-sentence premise;
- role and context;
- one correct thumbnail;
- case-study link.

They must not contain architecture diagrams, long technical explanations,
multiple evidence panels, or award deep-dives.

### Warm, not nostalgic

Paper tone and editorial serif create warmth. The interface must still feel
current, precise, and technical. Avoid fake aging, heavy grain, torn paper, or
retro skeuomorphism.

## 3. Color contract

Proposed implementation tokens, subject to contrast verification in rendered
context:

```css
--pfn-paper: #f3ebdd;
--pfn-paper-raised: #faf6ee;
--pfn-ink: #151515;
--pfn-text: #262522;
--pfn-muted: #625f58;
--pfn-rule: #aaa397;
--pfn-rule-strong: #242321;
--pfn-cobalt: #3155e7;
--pfn-cobalt-dark: #1f3fbf;
--pfn-vermilion: #e94a35;
--pfn-yellow: #f4c84c;
--pfn-night: #121417;
--pfn-focus: #1749ff;
```

Rules:

- paper and ink occupy most of every route;
- one accent is dominant within a local composition;
- accent colors communicate category or interaction state;
- project screenshots preserve their authentic color;
- body copy never relies on yellow or vermilion at small sizes;
- color is never the sole carrier of category or selected state.

## 4. Typography contract

Primary pairing:

- **Instrument Serif**: display statements, project titles, pull quotes;
- **Instrument Sans**: navigation, body, metadata, controls;
- system `ui-monospace`: folios and compact technical labels only.

Self-host WOFF2 files and retain the OFL license. Load only required styles and
Latin subsets. Do not introduce a third downloaded family.

Implementation preference: use `next/font/google` when both approved families
are available in the installed Next.js version, so files are self-hosted at
build time with no runtime font request. Otherwise vendor the official WOFF2
files and their licenses locally before the foundation preview is approved.

Proposed scale:

```css
--pfn-display-hero: clamp(4.5rem, 9.6vw, 10.5rem);
--pfn-display-route: clamp(3.75rem, 7.4vw, 8rem);
--pfn-display-project: clamp(2.75rem, 5.2vw, 5.75rem);
--pfn-heading-l: clamp(2rem, 3.2vw, 3.5rem);
--pfn-heading-m: clamp(1.5rem, 2vw, 2.25rem);
--pfn-body-l: clamp(1.0625rem, 1.25vw, 1.3125rem);
--pfn-body: 1rem;
--pfn-small: 0.875rem;
--pfn-meta: 0.75rem;
```

Limits:

- body line length: 45–68 characters;
- hero display line-height: 0.82–0.9 after visual verification;
- body line-height: 1.5–1.65;
- uppercase labels remain short and at least 12px rendered;
- mobile body remains at least 15px, normally 16px.

## 5. Grid and spacing

Breakpoints:

| Range | Grid | Gutter | Gap |
| --- | ---: | ---: | ---: |
| 0–639px | 4 columns | 20–24px | 12–16px |
| 640–1023px | 8 columns | 32px | 16–20px |
| >=1024px | 12 columns | 40–56px | 20–24px |

Maximum content width: 1520px. Long-form case-study prose remains independently
limited to 68ch.

Spacing scale:

```text
4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160
```

Section rhythm may vary, but values must come from the scale. Project overview
items use equal content contracts and equal perceived area.

## 6. Homepage structure

Required order:

1. `EditorialHeader`
2. `FieldNotesHero`
3. `SelectedWorkOverview`
4. `AchievementSummary`
5. `MomentsTeaser`
6. `CurrentlyBuilding`
7. `AboutContactClose`
8. `EditorialFooter`

### Hero

- name and navigation remain visually compact;
- headline is “BUILDING IS HOW I LEARN.”;
- one approved portrait is used;
- positioning copy is concrete and no longer than two short paragraphs;
- current status is visible but secondary;
- no metrics, skill pills, terminal, 3D object, or decorative dashboard.

### Selected work

Desktop uses a balanced 2x2 editorial grid. Mobile uses four stacked entries.
All entries share the same semantic structure and content budget. Project order
is fixed in content, not hard-coded in components.

### Achievement summary

Use three or four verified summaries with equal weight. It is a proof index, not
a trophy wall. Each item has label, outcome, context/year, and optional source.

### Moments teaser

Show five to seven approved images from distinct moments. It must include more
than award photos. Categories are explicit in text and color.

## 7. Case-study template

Required sequence:

1. back navigation and project folio;
2. title, premise, role, context, period/status;
3. authentic product hero;
4. problem and intended users;
5. Wildan's responsibility and decisions;
6. system flow or implementation explanation;
7. selected evidence and outcome;
8. limitations, reflection, and current state;
9. live/source links where public;
10. next project.

PayGate is the golden template slice. Fradium, Nova AI, and Quorum must use the
same component vocabulary without project-specific React page forks.

## 8. Moments system

Categories:

- `build`: collaboration and active work;
- `win`: competitions, awards, and milestones;
- `learn`: conferences, visits, research, and learning in public;
- `give`: teaching, mentoring, community, and social contribution.

Homepage uses a filmstrip/sequence teaser. `/moments` uses an editorial grid.
Native scroll snap is preferred for the teaser. A dependency may be introduced
only if native behavior fails the keyboard, touch, and momentum requirements.

Each public moment requires:

- title, event, date, place, category, caption, and alt text;
- real source dimensions and crop policy;
- credit and consent/release state;
- optional related project;
- focal point when a crop is not intrinsic.

## 9. Component vocabulary

Foundations:

- `PortfolioShell`
- `SiteContainer`
- `EditorialGrid`
- `SectionMarker`
- `EditorialRule`
- `ActionLink`
- `MetadataRow`
- `MediaFrame`
- `FieldNote`
- `CategoryMark`

Homepage:

- `EditorialHeader`
- `FieldNotesHero`
- `ProjectOverviewGrid`
- `ProjectOverviewItem`
- `AchievementSummary`
- `MomentsFilmstrip`
- `CurrentlyBuilding`
- `AboutContactClose`

Case study:

- `ProjectOpening`
- `ProjectFacts`
- `ProjectNarrative`
- `ProjectFlow`
- `EvidenceFigure`
- `OutcomeClipping`
- `ProjectReflection`
- `NextProjectLink`

Moments:

- `MomentCategoryFilter`
- `MomentGrid`
- `MomentFigure`
- `MomentCaption`
- `MomentLightbox`

Do not create project-specific primitives. A project-specific composition is
allowed only through structured content choices or documented layout variants.

## 10. Interaction state matrix

Every interactive component defines:

- default;
- hover where pointer exists;
- visible focus;
- active/pressed;
- visited where useful;
- disabled only when a disabled state is meaningful;
- loading only for genuinely asynchronous behavior;
- reduced-motion state;
- no-JavaScript fallback.

Project links must remain ordinary links. Gallery controls are semantic buttons.
The category filter must not remove access to content when JavaScript is absent.

## 11. Motion contract

Motion level: **bounded brand motion**, not cinematic scrolling.

Signature sequence:

1. cover assembly, 700–900ms total;
2. project row hover/focus, 180–300ms;
3. optional route transition, 350–600ms progressive enhancement.

Rules:

- transform and opacity only for primary motion;
- no scroll hijack, long pinning, parallax field, pointer follower, bounce, or
  blanket fade-up sections;
- content exists in its final readable state before enhancement;
- `prefers-reduced-motion` presents the settled state immediately;
- Save-Data and coarse-pointer environments receive reduced enhancement;
- GSAP is used only where sequencing or interruption handling justifies it;
- CSS handles ordinary hover, focus, underline, and arrow transitions.

## 12. Explicit anti-patterns

- sticky selected-work explorer;
- image overlay that covers content;
- dashboard/evidence-ledger visual language on the homepage;
- repeated card walls;
- glassmorphism, neon gradient, decorative glow, orb, or 3D object;
- generated or mismatched project thumbnail;
- autoplay gallery;
- organization timeline presented as the main story;
- all achievements presented as product traction;
- desktop layout merely scaled down on mobile;
- hidden content that only becomes visible after JavaScript animation.

## 13. Design acceptance

The design contract passes only if:

- identity is clear within five seconds;
- all four flagship projects are visible with equal hierarchy;
- no media obscures content at any supported viewport;
- mobile feels intentionally recomposed;
- all production media is real and correctly mapped;
- the static page is attractive before motion;
- keyboard, focus, contrast, no-JS, and reduced-motion states remain coherent;
- visual comparison matches the approved references in hierarchy, rhythm,
  typography, palette, and density rather than blindly copying generated text.
