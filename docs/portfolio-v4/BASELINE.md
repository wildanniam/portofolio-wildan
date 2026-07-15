# Portfolio V4 Baseline

Captured: 15 July 2026 (WIB)

## Production rollback

- Production URL: <https://portofolio-wildan-zeta.vercel.app>
- Source commit: `3ce448055f9f98e778e7b4416a74c9d3ea060b45`
- Safety tag: `portfolio-v3-production-2026-07-15`
- Last production deployment before V4: `5445670399`
- Stable production returned HTTP 200 during Phase 0.
- Fresh Chromium inspection returned zero console errors and zero warnings.

V3 stays deployed until the V4 release candidate passes the public-preview gate and the post-merge smoke test. Rollback uses a revert or the tagged deployment source; history must not be reset.

## Existing visual evidence

- [V3 homepage desktop](../portfolio-v3/release/home-desktop.webp)
- [V3 homepage mobile](../portfolio-v3/release/home-mobile.webp)
- [V3 PayGate case study](../portfolio-v3/release/paygate-case.webp)
- [V3 Moments lightbox](../portfolio-v3/release/moments-lightbox.webp)

Fresh 1440 × 1000 and 390 × 844 browser captures were also taken during Phase 0. They confirm the production deployment still matches the V3 release presentation.

## Technical baseline

The V3 release report recorded:

| Measure | V3 result | V4 requirement |
| --- | --- | --- |
| Content | 7 projects, 7 moments, 0 warnings | Preserve or improve |
| Unit tests | 161 / 161 | Preserve and extend |
| Browser E2E | 39 pass, 5 intentional skips | Preserve and extend |
| Axe | 36 route/browser checks pass | Preserve and extend |
| Initial route JS | 150.59 KiB total, 18 KiB route-owned ceiling | Do not regress route-owned budget |
| Homepage WebGL | 0 B | Remain 0 B |
| Lighthouse mobile | 94 / 100 / 100 / 100 | At least 90 / 95 / 95 / 95 |
| LCP | 3020.5ms | At most 2500ms |
| CLS | 0 | At most 0.05 |
| TBT | 13.5ms | No motion-attributable long task over 50ms |

V3's LCP is specifically below the V4 release requirement even though its overall Lighthouse Performance score is high. The V4 hero and media strategy must correct this rather than merely preserve the score.

## Visual and UX failure patterns to remove

1. The browser title and first viewport identify Wildan primarily as `Software Engineer`, not `AI Researcher & Web3 Builder`.
2. The headline `I build systems you can inspect` communicates a generic system-quality thesis rather than Wildan's research/build identity.
3. The desktop hero uses a large amount of unproductive vertical space while the supporting research direction is visually secondary.
4. The blue proof ribbon consumes a long mobile reading segment before visitors reach the projects.
5. The Atlas introduction is oversized relative to the project information and delays actual work.
6. Project identity depends on large screenshots and text because authentic logos are absent.
7. Meaningful product UI is cropped into incompatible editorial ratios.
8. Layout ordering can weaken project/media association, especially around PayGate and Quorum.
9. The four project records share nearly identical information hierarchy and interaction, so the collection feels templated.
10. Motion is limited to a hero translate and small image scale; it does not explain any project workflow.
11. About, project, and proof copy repeatedly use `inspect`, `evidence`, and `boundaries`, making the voice defensive and administrative.
12. Automated checks verify that the interface works but do not prove visual identity, crop quality, association, or prestige.

These are migration requirements, not optional polish notes. A V4 release that reproduces any of them fails the relevant P0 or P1 gate.
