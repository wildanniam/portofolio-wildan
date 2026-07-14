# Portfolio V3 Release Report

Release candidate: `codex/25-portfolio-v3-integration`

Issue: #25

Reviewed: 15 July 2026 (WIB)

## Decision

Portfolio V3 is an authored editorial rebuild, not a reskin of V2. It keeps the validated content and media layer while replacing the presentation layer with the locked builder-journal direction: paper, graphite, cobalt, expressive editorial typography, asymmetric project compositions, documentary photography, and evidence-led case studies.

The implementation intentionally excludes generic bento grids, glass surfaces, glow effects, a custom cursor, floating project previews, pinned scroll sequences, and WebGL. Motion is bounded to CSS transforms and has a reduced-motion equivalent.

## Representative evidence

- [Homepage desktop](./release/home-desktop.webp)
- [Homepage mobile](./release/home-mobile.webp)
- [PayGate case study](./release/paygate-case.webp)
- [Moments contextual lightbox](./release/moments-lightbox.webp)

## Quality result

| Gate | Result |
| --- | --- |
| Content validation | Pass: 7 projects, 7 moments, 0 warnings |
| Media audit | Pass: 37 files |
| Lint | Pass, zero warnings |
| Typecheck | Pass |
| Unit tests | Pass: 161 of 161 |
| Production build | Pass: 14 static or SSG pages |
| Browser E2E | Pass: 39 tests, 5 intentional project skips |
| Accessibility | Pass: 36 Axe route/browser checks |
| Browser matrix | Pass: Chromium, Firefox, and WebKit |
| Responsive matrix | Pass: 320, 390, 768, 1024, and 1440px |
| Horizontal overflow | Pass: none across the locked matrix |
| Console | Pass: zero errors and zero warnings on the production build |
| External links | Pass: 41 reachable, 2 timeout-only manual reviews, 0 failures |
| Route audit | Pass: 9 routes, 66 internal links, 5 social images, 0 errors |
| Bundle budget | Pass: 150.59 KiB initial JS and 0 B pre-intent route loading on `/` |
| Moments mobile media budget | Pass: 162.29 KiB total and 63.40 KiB largest image |
| WebGL payload | Pass: 0 B |
| Lighthouse mobile median | Pass: Performance 94, Accessibility 100, Best Practices 100, SEO 100 |
| Core metrics | Pass: LCP 3020.5ms, CLS 0, TBT 13.5ms |

The two external-link manual reviews are Telkom-owned pages that timed out during the strict network audit. They did not return a failed HTTP status and are not primary conversion actions. All portfolio-owned, project, repository, and primary contact links passed.

The isolated Lighthouse tooling directory reports moderate-severity development-tool advisories, while `npm audit --audit-level=high` passes. The tool is excluded from the shipped application and does not affect the production dependency graph.

## UX acceptance

- The first viewport identifies Wildan, his discipline, his builder thesis, and the primary path to work.
- The homepage presents all four flagships before asking visitors to choose a detail route.
- Project media stays inside its editorial container and never covers project copy or controls.
- Each flagship case exposes outcome, role, state, evidence, and primary links near the opening.
- Moments presents contextual proof instead of an unexplained photo wall.
- Mobile navigation and the Moments lightbox trap focus, close with Escape, and restore focus to their trigger.
- All primary journeys work with keyboard, touch, reduced motion, and 200 percent zoom.

## Release and rollback

Merge only after the pull-request checks pass and its public preview is reachable without authentication. After merge, verify `/`, `/work`, `/work/paygate`, `/moments`, `/about`, and `/contact` on the production domain from a fresh browser context.

The pre-V3 rollback target is `c68cd0b` (`feat: implement Personal Field Notes portfolio V2`). If a production-only regression appears after merge, revert the V3 merge commit rather than rewriting history:

```sh
git switch main
git pull --ff-only
git revert -m 1 <v3-merge-commit>
git push origin main
```

If the hosting provider exposes an instant deployment rollback, the matching pre-V3 deployment may be restored while the Git revert is reviewed. Do not use `git reset --hard` on the shared branch.
