# Portfolio V1 Release Candidate

Date: 12 July 2026
Status: **implementation candidate complete; not approved or public**

[Back to the development package](./README.md)

## 1. Release boundary

This packet covers the protected **The Open Proving Ground** composition, four
flagship case studies, and the documentary Moments system. It does not authorize
the public root switch, publication of unapproved personal-photo derivatives, or
legacy deletion.

The current release chain is intentionally stacked:

1. Fradium static case study;
2. Fradium lazy evidence motion;
3. Nova AI, PayGate, and Quorum case studies;
4. homepage Moments narrative and review-only photo intake;
5. motion, responsive, accessibility, and media hardening;
6. this release-candidate audit.

V5 remains the public root. V1 stays credential protected, `private, no-store`,
and `noindex` until Wildan explicitly approves the content/assets, visual result,
and root cutover.

## 2. Candidate content

The exact flagship role labels follow Wildan's owner attestations and direction:

| Project        | Presentation boundary                                                               | Role label                     |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| Fradium        | Award-winning collaborative beta; test-network execution boundaries remain explicit | Leader & Full-Stack Developer  |
| Nova AI Wallet | Award-recognized hackathon prototype, not a production wallet                       | Full-Stack & AI Builder        |
| PayGate        | Active independent testnet product with a documented SCF Instaward                  | Founder & Full-Stack Developer |
| Quorum         | Collaborative Stellar testnet prototype with credited infrastructure contributions  | Full-Stack Product Builder     |

The case studies make the work look strong by explaining the actual problem,
decisions, system flow, validation, result, and learning. They do not downgrade a
hackathon artifact for not being a mature company product, and they do not turn
testnet, team, or self-recorded evidence into unsupported production claims.

## 3. Automated verification ledger

| Gate                        | Current result                                              | Release meaning                                                                                                                       |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Static quality              | 21 files / 206 tests passed                                 | ESLint, strict TypeScript, unit/content tests                                                                                         |
| Content browser matrix      | 49/49 passed                                                | Seven viewports/modes, no-JavaScript, reduced motion, Save-Data, focus, resize, and route lifecycle                                   |
| Cross-browser release smoke | 12/12 passed                                                | Chromium, Firefox, and WebKit production route/interaction/reflow smoke                                                               |
| Route and metadata audit    | 13 routes, 38 internal links, 1 OG image, 0 errors/warnings | Pre-cutover status, metadata, image response, private boundaries, exact sitemap, robots, fragments, redirects, and placeholder checks |
| External links              | 41 reachable, 2 manual-review, 0 failed                     | Every unique YAML/MDX URL probed with retry and source tracing                                                                        |
| Media audit                 | 21/21 passed                                                | Dimensions, format, byte size, path, and digest contract                                                                              |
| Bundle gate                 | Passed                                                      | 167.69 KiB initial JS, 2.03 KiB route-owned, 26.08 KiB CSS, zero pre-intent JS and zero WebGL                                         |
| Lazy GSAP gate              | Passed                                                      | 45.17 KiB post-trigger enhancement, loaded only on eligible near/intent states                                                        |
| Mobile Lighthouse median    | Passed protected-preview profile                            | Performance 0.94, accessibility 1.00, best practices 1.00, LCP 3033 ms, CLS 0, TBT 23.5 ms                                            |
| Current integration CI      | Passed                                                      | Static/build, Chromium/a11y, Lighthouse, and Vercel checks are green on the hardening PR                                              |

Generated reports remain under ignored `.quality-reports` locally and are
uploaded by CI where configured. The reproducible commands are:

```bash
nvm use
npm ci
npm run quality:static
npm run test:content:e2e
npm run test:release
npm run audit:release-routes
npm run audit:links
npm run review:moments
npm run review:release
npm run analyze:bundle
npm run lighthouse
```

## 4. Manual or deferred checks

Automated checks do not silently stand in for human decisions:

| Check                               | State                          | Required action                                                                                                                                         |
| ----------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Flagship visual/content review      | Awaiting Wildan                | Approve or list revisions for the four implemented case studies and homepage explorer.                                                                  |
| Fradium final verdict media         | Awaiting owner asset/decision  | Supply an approved sanitized authenticated verdict still/video, or explicitly approve launch with the current public-beta surface and replace it later. |
| Moments crops and captions          | Awaiting Wildan                | Approve/revise the six proposed Moments derivatives/captions plus the separate About portrait, and confirm the supplied photos may be published.        |
| Photo credit                        | Awaiting Wildan where known    | Give photographer names when known; otherwise choose an accurate owner-supplied credit or no named credit rather than inventing one.                    |
| Nova group-frame mapping            | Awaiting Wildan                | Confirm the visible-person mapping if the selected Nova award frame is published.                                                                       |
| Physical assistive-technology smoke | Deferred to available hardware | VoiceOver/Safari and TalkBack/Chrome manual reading/order smoke; automated semantics, keyboard, focus, and axe gates already pass.                      |
| Public SEO/LCP                      | Blocked until cutover branch   | Post-cutover profile requires SEO 1.00, LCP at most 2.5 s, canonical public V1 routes, and no preview namespace.                                        |

The two automated manual-review URLs are Telkom University institutional pages
that timed out under the retrying Node probe. Their source references remain in
the content ledger for signed-out browser verification; they are not counted as
broken links.

Private, ignored approval artifacts are generated locally rather than committed:

- `.quality-reports/moments-review/moment-crop-review.webp` shows the six real
  proposed Moments crops and the separate About portrait, after the planned
  crop/color/redaction pipeline;
- `.quality-reports/release/approval-desktop.webp` and
  `.quality-reports/release/approval-mobile.webp` summarize the first folds of
  the homepage, four flagships, and clearly labeled project-derivative Moments
  layout fixture;
- individual full-page desktop/mobile screenshots remain under
  `.quality-reports/content/screenshots/` for detailed review.

## 5. Approval response

Wildan can answer in one compact message:

```text
Flagships: approve / revise: ...
Moments crops and captions: approve / revise: ...
Photo publication and credits: approved; known credits: ...
Fradium media: use current surface for V1 / I will supply final capture
Root cutover after the final preview: approve / hold
```

An `approve` response authorizes preparation of the separate high-risk root
switch PR; it does not authorize merging or deployment. The switch PR will still
run the complete public post-cutover matrix and wait for explicit merge/release
approval.

## 6. Cutover and rollback

The root switch remains isolated from destructive cleanup:

1. move the approved V1 composition to `/` and publish the four case studies and
   Moments records selected for launch;
2. remove the temporary preview namespace in the same reviewable switch diff;
3. run `audit:release-routes -- --profile post-cutover`, public Lighthouse, full
   browser/content/a11y/bundle/media checks, and screenshot comparison;
4. request explicit merge/deploy approval;
5. only after the live replacement is verified, open a separate legacy cleanup
   PR. Git history and the V5 recovery branch remain the rollback path.

If any public gate regresses, do not delete legacy code. Revert or withhold the
root-switch PR and keep the protected candidate available for correction.
