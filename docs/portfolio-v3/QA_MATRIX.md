# Portfolio V3 Quality Matrix

Every item marked Blocker must pass before merge.

## Visual and UX

| Gate | Level | Verification |
| --- | --- | --- |
| Hero identifies Wildan, discipline, thesis, and one clear next action within the first viewport | Blocker | Screenshot and five-second review |
| Project Atlas shows four projects without cloned card composition | Blocker | Desktop, tablet, mobile screenshots |
| No media obscures copy, controls, or another project during scroll, hover, or focus | Blocker | Pointer and keyboard browser review |
| Tablet has a deliberate composition at 768 and 1024px | Blocker | Screenshot comparison |
| Mobile navigation is present and complete | Blocker | 390 and 320px interaction review |
| Every flagship case exposes role, state, outcome, media, and primary links within two viewports | Blocker | Case-study screenshots and DOM review |
| Moments uses explicit editorial variants and contextual lightbox content | Blocker | Route and dialog review |
| About and Contact feel complete and do not repeat homepage copy verbatim | Major | Content review |
| No generic bento, glass, glow, custom cursor, floating preview, or decorative numbering pattern is present | Blocker | Full-page visual review |
| Copy contains no template leftovers, fake metrics, or unapproved claims | Blocker | Content diff and page review |

## Responsive and accessibility

| Gate | Level | Verification |
| --- | --- | --- |
| No horizontal page overflow at 320px or 200 percent zoom | Blocker | Browser automation and manual review |
| Touch controls are at least 44px where space allows | Major | Computed layout review |
| Keyboard can reach and operate menu, filters, lightbox, project links, and contact actions | Blocker | Keyboard flow test |
| Focus is visible and returns correctly after dialog close | Blocker | Browser review |
| Heading and landmark structure is coherent | Blocker | Accessibility tree and axe |
| Images have appropriate alternative text and decorative images are hidden | Blocker | DOM and axe review |
| Repeated links have unique accessible names | Blocker | Accessibility tree review |
| Color contrast meets WCAG 2.2 AA | Blocker | Axe and token review |
| Reduced-motion mode removes nonessential movement | Blocker | Emulated media review |

## Content and media

| Gate | Level | Verification |
| --- | --- | --- |
| Existing role labels and validated claims remain unchanged | Blocker | Content tests and diff |
| Mobile image derivatives and focal points are used | Blocker | DOM source and screenshot review |
| Hero image is eager and correctly sized | Blocker | HTML and performance trace |
| Below-fold images remain lazy unless a route-specific LCP candidate | Major | HTML review |
| At least two authentic artifacts appear in each flagship case where available | Blocker | Case-study review |
| Portfolio-authored diagrams do not dominate the case study | Blocker | Visual review |
| Moments order is explicit and stable | Blocker | Unit test |

## Engineering

| Gate | Level | Command or verification |
| --- | --- | --- |
| Content schema and validation pass | Blocker | `npm run validate:content` |
| Media audit passes | Blocker | `npm run audit:media` |
| Lint passes with zero warnings | Blocker | `npm run lint` |
| Typecheck passes | Blocker | `npm run typecheck` |
| Unit tests pass | Blocker | `npm run test:run` |
| Production build passes | Blocker | `npm run build` |
| E2E smoke suite passes | Blocker | `npm run test:e2e` |
| Accessibility suite passes | Blocker | `npm run test:a11y` |
| Strict external-link audit passes or an owner-approved exception is documented | Blocker | `npm run audit:links` |
| Client boundaries are limited and justified | Major | Bundle and source review |
| No console error or React warning appears in release routes | Blocker | Browser console capture |

## Browser matrix

| Browser | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Chromium | 1440x1000 | 1024x768 | 390x844 and 320x800 |
| Firefox | 1440x1000 | 768x1024 | 390x844 |
| WebKit | 1440x1000 | 768x1024 | 390x844 |

Required routes:

- `/`
- `/work`
- `/work/paygate`
- `/work/fradium`
- `/work/nova-ai`
- `/work/quorum`
- `/moments`
- `/about`
- `/contact`

## Performance and release

| Gate | Level | Verification |
| --- | --- | --- |
| Mobile Lighthouse Performance is 90 or higher | Blocker | Release-candidate Lighthouse |
| Accessibility, Best Practices, and SEO are 95 or higher | Blocker | Release-candidate Lighthouse |
| No unexpected layout shift occurs in the hero or project atlas | Blocker | Trace and screenshot review |
| Public production URL is reachable without login | Blocker | Incognito HTTP and browser smoke test |
| PR contains representative desktop and mobile screenshots | Blocker | PR review |
| Rollback target and command are documented | Blocker | PR release notes |

## Stop conditions

Do not merge when any of the following is true:

- A Blocker gate fails.
- The live preview is private or unavailable.
- Visual review reveals a new generic template pattern.
- Any primary route has an empty, broken, or overlapping state.
- Content accuracy changes without Wildan's approval.
- Cross-browser behavior has not been checked.

