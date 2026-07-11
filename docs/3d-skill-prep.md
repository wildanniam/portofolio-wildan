# 3D Skill Preparation

> [!WARNING]
> **Historical V5 implementation experiment, superseded on 11 July 2026.**
> Do not use this reactor or WebGL direction for new implementation. The
> canonical V1 contract is [The Open Proving Ground](./portfolio-v1/README.md).
> This document is retained only to explain the legacy implementation being
> migrated.

## Installed Codex Skills

The following Claude design skills were adapted into permanent Codex skills under `/Users/wildanniam/.codex/skills`:

- `react-three-fiber`
- `threejs-webgl`
- `gsap-scrolltrigger`
- `web3d-integration-patterns`

Source repository:

- `https://github.com/freshtechbro/claudedesignskills`

## Intended Use For Portfolio V5

Use these skills before continuing 3D implementation work:

- Use `$web3d-integration-patterns` when deciding the architecture between React UI, R3F scene, hover state, evidence overlays, lazy loading, and performance gates.
- Use `$react-three-fiber` when editing the R3F canvas, scene components, hooks, pointer events, render loop, and reusable 3D components.
- Use `$threejs-webgl` when improving raw Three.js geometry, lighting, materials, camera, bloom, render quality, and performance.
- Use `$gsap-scrolltrigger` later for scroll-driven section transitions, not for the current hero core pass unless the phase explicitly includes scroll choreography.

## Phase 2 Prep Decision

The current procedural core direction should not be extended by adding more primitives.

Before coding Phase 2 again:

1. Re-read `docs/v5-phase-1-audit.md`.
2. Load `$web3d-integration-patterns`, `$react-three-fiber`, and `$threejs-webgl`.
3. Redefine the hero 3D scene as a simpler designed object:
   - fewer meshes
   - clearer silhouette
   - restrained idle color
   - better lighting/material hierarchy
   - evidence overlay separated from pointer targets
4. Do not add Spline or external 3D assets in this phase.
5. Keep mobile fallback and progressive desktop WebGL behavior.

## Manual Gate Reminder

Phase 2 is approved only when the reactor core feels like a designed autonomous artifact, not a procedural Three.js demo.
