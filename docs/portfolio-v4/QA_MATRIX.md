# Portfolio V4 Quality Matrix

Release rule: **P0 = 0 and P1 = 0 before merge.**
P2 cosmetic notes may be documented only when they do not affect hierarchy, association, crop, copy, motion, responsiveness, accessibility, or the primary user path.

## Human visual gates

| Gate | Level | Evidence |
| --- | --- | --- |
| High-fidelity hero, Research Coordinates, Atlas desktop/mobile, one interaction state, case opening, and Moments preview are approved before final layout implementation | P0 | Approved visual frames |
| Static rendered hero and four-project Atlas match the approved direction before motion is added | P0 | Browser screenshots at 1440, 1024, 768, 390, and 320 |
| Public release candidate is explicitly approved after desktop, tablet, mobile, normal-motion, and reduced-motion review | P0 | User sign-off on public preview |

## Identity and copy

| Gate | Level | Verification |
| --- | --- | --- |
| First viewport identifies Wildan as AI Researcher & Web3 Builder within five seconds | P0 | Five-second comprehension review |
| Software Engineering is presented as discipline, not a competing public identity | P0 | Hero and metadata review |
| Hero uses the approved research/build thesis and clear primary action | P0 | Screenshot and content diff |
| Project copy follows question → product answer → role → outcome | P0 | Atlas and case-study review |
| Fradium, Nova, PayGate, and Quorum roles use the approved labels | P0 | Content diff and rendered review |
| Landing copy avoids defensive scope repetition and generic `inspect/evidence/boundaries` language | P1 | Full-page copy review |
| No unsupported research, adoption, partnership, production, or security claim is introduced | P0 | Claim audit |
| Hackathon work is framed as legitimate build work, not demeaned | P1 | Copy review |

## Hero and research direction

| Gate | Level | Verification |
| --- | --- | --- |
| Name, identity, headline, support, primary action, and portrait are visible in the first desktop and mobile reading flow | P0 | Screenshot review |
| Portrait never covers or weakens headline legibility | P0 | Viewport matrix |
| Hero is complete with JavaScript disabled | P0 | JS-disabled browser check |
| Research Coordinates clarify four territories without four cloned feature cards | P1 | Visual review |
| Research CTA reaches the correct section without sticky-header obstruction | P1 | Interaction test |

## Project Atlas

| Gate | Level | Verification |
| --- | --- | --- |
| All four flagships are presented generally before a visitor chooses detail | P0 | Homepage review |
| Each stage contains its logo, project name, question, answer, role, outcome, visual flow, and unique case-study action | P0 | DOM and screenshot review |
| Logo, copy, artifact, role, and outcome belong to the same DOM and visual boundary | P0 | DOM/bounding-box test |
| No project layer intersects another project's stage, copy, or action | P0 | Bounding-box test and screenshot review |
| No project visual can be mistaken for a neighboring project | P0 | Five-second association review |
| No meaningful product UI is destructively cropped or rendered as an arbitrary cover | P0 | Asset and screenshot review |
| Hiding project titles still leaves four stages distinguishable through logo, flow, composition, and project-scoped color | P1 | Visual identity review |
| Hover/focus never obscures content or creates a touch two-tap trap | P0 | Pointer, keyboard, touch review |
| Role and outcome are available without hover | P0 | DOM review |
| Mobile preserves semantic project order and has no `order: -1` association change | P0 | DOM and mobile review |

## Motion

| Gate | Level | Verification |
| --- | --- | --- |
| One coherent `Signal → System` grammar is used instead of repeated fade-ups | P1 | Motion recording review |
| Every stage motion explains its real workflow and completes within 900ms | P0 | Timeline and recording review |
| No pinning, scroll hijack, horizontal fake scroll, long scrub, custom cursor, or infinite decorative loop exists | P0 | Source and interaction review |
| Static and settled animated states match | P0 | JS-disabled versus animated screenshot |
| Motion runtime is lazy and is not downloaded in reduced-motion mode | P0 | Network test |
| Reduced motion immediately shows complete final states | P0 | Emulated media review |
| Animation changes no copy/CTA bounding box and causes no layout shift | P0 | Automated geometry/CLS test |
| Motion cleanup leaves no stale transform after route back/forward | P0 | Navigation test |
| Focus remains visible and stable during and after motion | P0 | Keyboard review |

## Work index and case studies

| Gate | Level | Verification |
| --- | --- | --- |
| Work index uses bounded identity/artifact treatments rather than giant cropped screenshots | P0 | Route screenshots |
| Atlas → case study → back/next flow works with keyboard, touch, and browser history | P0 | E2E test |
| Back navigation returns to a useful Atlas position where supported | P1 | Browser review |
| First two case-study viewports show identity, question, product answer, role, state, period, outcome, authentic media, and public actions | P0 | Four case-opening screenshots |
| Case-study chapters use project-specific language and render human narrative where unique | P1 | Content review |
| Full screenshots preserve useful native ratios or contained frames | P0 | Media review |
| Unavailable actions are absent rather than dead | P0 | Link/DOM audit |
| Projects share a system but do not appear as four visual clones | P1 | Cross-project review |

## Moments, About, and Contact

| Gate | Level | Verification |
| --- | --- | --- |
| Homepage Moments preview is curated; full gallery retains the broader documentary story | P1 | Content and route review |
| Similar photos are grouped instead of repeated as separate homepage tiles | P1 | Visual review |
| Every selected photo has an intentional focal point and useful caption/context | P0 | Asset/contact-sheet review |
| Gallery exposes only filters with results, announces the result count, and retains an image-error fallback | P1 | State test |
| Lightbox supports title, description, previous, next, Escape, focus trap, and focus return | P0 | A11y/E2E review |
| About and Contact reinforce the identity without repeating the hero verbatim | P1 | Copy review |
| Contact actions wrap safely and remain usable at 320px and 200% zoom | P0 | Responsive review |

## Responsive and accessibility

| Gate | Level | Verification |
| --- | --- | --- |
| Desktop 1280/1440, tablet 768/1024, mobile 320/360/390/430, and 200% zoom are reviewed | P0 | Screenshot matrix |
| No horizontal overflow, clipped focus, or hidden primary content exists | P0 | Browser automation and manual review |
| Tablet is a deliberate composition rather than compressed desktop | P1 | Visual review |
| Mobile order is identity → content → visual → outcome/action | P0 | DOM and screenshot review |
| Touch targets are at least 44px for primary controls | P1 | Computed-style review |
| Semantic landmarks and heading order are coherent | P0 | Accessibility tree and Axe |
| Focus is visible across paper and every project-stage background | P0 | Keyboard review |
| Information does not depend on color, hover, or motion | P0 | A11y review |
| Logo beside textual project identity is decorative to assistive technology | P1 | Accessibility tree |
| Meaningful scenes have a concise accessible summary | P0 | DOM review |
| WCAG 2.2 AA contrast passes | P0 | Axe/token review |

## Content, media, and asset provenance

| Gate | Level | Verification |
| --- | --- | --- |
| Existing validated claims, collaborator credit, and role labels remain intact | P0 | Content diff/tests |
| Every logo and fragment records source repository, revision, path, creator, and rights | P0 | Asset manifest review |
| No raster is upscaled | P0 | Media audit |
| Nova's display logo is vector/high-resolution and matches the authentic source | P0 | Overlay comparison |
| SVGs contain no remote resource or oversized embedded raster | P0 | Media audit |
| Desktop/mobile media derivatives and intrinsic dimensions exist | P0 | Media audit and DOM review |
| Below-fold media remains lazy and has stable dimensions | P0 | HTML/performance trace |

## Engineering and performance

| Gate | Level | Command or verification |
| --- | --- | --- |
| Content validation passes | P0 | `npm run validate:content` |
| Media audit passes | P0 | `npm run audit:media` |
| V4 source avoids legacy imports, destructive artifact crops, prohibited motion, canvas/3D, custom cursors, negative order, and remote visuals | P0 | `npm run audit:v4:presentation` |
| Lint passes with zero warnings | P0 | `npm run lint` |
| Typecheck passes | P0 | `npm run typecheck` |
| Unit tests pass | P0 | `npm run test:run` |
| Production build passes | P0 | `npm run build` |
| E2E smoke passes | P0 | `npm run test:e2e` |
| Accessibility suite passes | P0 | `npm run test:a11y` |
| Strict link audit passes or an owner-approved exception is documented | P0 | `npm run audit:links` |
| Release-route audit passes | P0 | `npm run audit:release-routes` |
| Initial route-owned JS and lazy motion chunks remain within V4 budgets | P0 | `npm run analyze:bundle` |
| No WebGL/canvas payload is shipped | P0 | Bundle/source review |
| Mobile LCP ≤2.5s, CLS ≤0.05, INP ≤200ms | P0 | Performance trace |
| No motion-attributable long task >50ms | P0 | Performance trace |
| Mobile Lighthouse Performance ≥90 and other categories ≥95 | P0 | `npm run lighthouse` |
| No console error, React warning, hydration warning, or failed primary asset request exists | P0 | Cross-browser console/network capture |

## Browser matrix

| Browser | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Chromium | 1440×1000 and 1280×800 | 1024×768 | 430×932, 390×844, 320×800 |
| Firefox | 1440×1000 | 768×1024 | 390×844 |
| WebKit | 1440×1000 | 768×1024 | 390×844 |

Required routes:

- `/`
- `/work`
- `/work/fradium`
- `/work/nova-ai`
- `/work/paygate`
- `/work/quorum`
- `/moments`
- `/about`
- `/contact`
- an unknown route for the custom 404

## Required release evidence

- full-page desktop, tablet, and mobile screenshots;
- close-up of all four Atlas stages;
- opening screenshot for all four flagship case studies;
- Moments default, filtered state, image-error fallback, and lightbox;
- short normal-motion and reduced-motion recordings;
- keyboard walkthrough recording or trace;
- five-second and thirty-second comprehension notes;
- Axe, Lighthouse, bundle, and media reports;
- Chromium, Firefox, and WebKit matrix;
- changed-copy and claim diff;
- rollback target and production smoke-test record.

## Stop conditions

Do not merge when:

- any P0 or P1 remains;
- visual approval is missing;
- static composition needs animation to feel complete;
- project ownership or media association is ambiguous;
- any important screenshot is destructively cropped;
- any primary route is broken, empty, overlapping, or inaccessible;
- the preview is private or unavailable;
- browser/motion evidence is incomplete;
- automated checks are green but the visual target is not met.
