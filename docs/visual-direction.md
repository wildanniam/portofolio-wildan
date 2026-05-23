# Portfolio Visual Direction

## Working Gates

- [V5 Phase 1 - Global Audit and Acceptance Gate](./v5-phase-1-audit.md)

## Core Brief

- **Positioning:** Wildan Syukri Niam, AI Researcher & Web3 Builder.
- **Feeling:** Standing inside a living autonomous system.
- **Audience:** AI researchers or AI/Web3 founders skeptical of student portfolios.
- **Anti-audience:** People looking for a polite student CV, or people who do not value innovation, research, and product planning as serious work.
- **Hero object:** Autonomous reactor core.
- **Job:** Convince.
- **Three-second memory:** There was a living reactor core with projects orbiting it, and the whole page felt like proof that this student builds real autonomous systems.

## Cut List

- Polite-CV sections.
- Generic skill grids.
- Equal-weight project cards.
- Decorative dashboard panels.
- Noisy chips.
- Long timelines.
- Administrative source-note clutter.
- Oversized personal-photo hero focus.
- Any 3D that does not carry narrative interaction.

## Style Logics

- **Color:** Near-black technical space; cyan/mint is the system signal; warm amber is proof/energy; project colors appear only when the reactor activates around a selected project.
- **Type:** Large human conviction in the headline, tiny mono evidence for system labels, and no medium-weight filler. Copy either persuades like a thesis or labels like instrumentation.
- **Spatial:** The reactor owns the spatial field; copy and proof live on the left edge, while projects orbit the core and expand into evidence panels only when selected.

## Reference Logic

- **Feeling:** Apple Vision Pro product films, NASA mission control seriousness, The Expanse orbital diagrams, Tron: Legacy machine-world atmosphere.
- **Structure:** Apple product pages for object-first hero pacing, Stripe for dense technical credibility, Linear for restrained hierarchy, Textura for cinematic identity pacing.
- **Detail:** Apple weighted object reveal, Stripe hover states, Bruno Simon interaction energy, Ammar Ridho cinematic developer pacing, Textura atmospheric motion.

## Hero V5 Rules

- The hero is a stage, not a split card layout.
- The right side must not contain a permanent dashboard card or protocol panel.
- The autonomous reactor core is the primary visual object.
- Project satellites are instrument modules, not colored balls.
- Hover previews a project; click pins the evidence state.
- Evidence appears only through interaction.
- Motion must be damped and physical, not instant active/idle switching.
- Loading fallback must feel like an atmospheric pre-scene, not a broken or flat copy of the final 3D.
- Mobile and reduced-motion devices use a premium non-WebGL fallback.

## Hero Interaction States

- **Idle:** Core breathes slowly, shell rotates, project modules stay quiet.
- **Hover:** Active satellite brightens, other satellites dim, connection line warms, energy packet travels into the core, compact evidence panel appears.
- **Pinned:** Evidence panel stays open until another project is clicked or the stage is cleared.
- **Clearing:** Hover leaves the stage but the system fades out with a short grace delay instead of snapping off.
- **Mobile:** No WebGL. Use atmospheric fallback and keep text readable.

## Implementation Checks

- Desktop WebGL loads progressively.
- Mobile canvas count stays `0`.
- `document.documentElement.scrollWidth - document.documentElement.clientWidth` stays `0`.
- Lint and production build pass.
- Save visual QA screenshots after hero changes.
