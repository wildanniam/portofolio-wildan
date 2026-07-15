# Portfolio Quality Harness

Date: 11 July 2026

This harness makes the V1 migration measurable before the visual rewrite. It
keeps current V5 regressions visible while storing stricter V1 release targets
alongside them.

## Supported runtime

- Node.js 24.18.0 LTS
- npm 11.16.0
- Next.js 16.2.10
- ESLint and `eslint-config-next` 16.2.10-compatible tooling

The original V5 baseline used Node 20.20.2. Node 20 reached end of life on 24
March 2026, so Issue #3 deliberately moved the implementation runtime to Node
24 LTS. `.nvmrc`, `packageManager`, and CI pin the exact verification runtime.
The root engine contract accepts supported Node 24/npm 11 minors because Vercel
guarantees the runtime major rather than a specific patch. `vercel.json` still
installs the pinned npm 11.16.0 before the clean deployment install, so the same
strict install-script policy applies there.

npm install scripts are deny-by-default in this repository. `.npmrc` turns
unreviewed scripts into installation failures, while `package.json` approves
only the exact native/runtime packages reviewed during this toolchain change.

## First setup

```bash
nvm install
nvm use
npm ci
npx playwright install chromium firefox webkit
```

The Lighthouse lab uses an installed stable Google Chrome so its current
Lighthouse protocol support is not coupled to Playwright's independently pinned
browser revision. The report records the actual Chrome version. GitHub's runner
image provides stable Chrome; local machines must have it installed or set a
valid `CHROME_PATH` for Lighthouse.

On Linux CI, install the browser and operating-system dependencies together:

```bash
npx playwright install --with-deps chromium firefox webkit
```

## Commands

| Command                           | Contract                                                                                                                                                                                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                    | Official Next.js flat ESLint config, zero warnings allowed.                                                                                                                                                                                                           |
| `npm run typecheck`               | Generate Next route types, then run strict no-emit TypeScript.                                                                                                                                                                                                        |
| `npm run test:run`                | Run deterministic Vitest unit and content-adjacent tests once.                                                                                                                                                                                                        |
| `npm run test:watch`              | Run the same Vitest suite in local watch mode.                                                                                                                                                                                                                        |
| `npm run test:e2e`                | Build and own a production server, then run every non-`@a11y` browser test across the configured desktop/mobile Chromium, Firefox, and WebKit projects.                                                                                                               |
| `npm run test:a11y`               | Build and own a production server, run the `@a11y` matrix, attach full findings, and reject new serious/critical regressions.                                                                                                                                        |
| `npm run test:foundation`         | Compatibility alias for the non-`@a11y` browser matrix; CI does not rerun it after the canonical release matrix.                                                                                                                                                      |
| `npm run test:content:e2e`        | Compatibility alias for the non-`@a11y` browser matrix; content-specific unit and runtime contracts remain in `test:content` and `test:content:runtime-gate`.                                                                                                         |
| `npm run test:release`            | Build and own one production server, then run the complete smoke and accessibility suite once across Chromium, Firefox, and WebKit. This is the canonical CI browser gate.                                                                                            |
| `npm run audit:release-routes`    | Build and own a preview-enabled production server, then enforce route, metadata, Open Graph image response, direct internal-link, exact sitemap, robots, cache, and indexing contracts.                                                                               |
| `npm run audit:links`             | Retry every unique external URL referenced by YAML/MDX content, fail real link errors, and isolate known bot-protected sources for explicit manual review.                                                                                                            |
| `npm run review:release`          | Compose the latest generated homepage, flagship, and Moments first-fold screenshots into desktop and mobile approval sheets without publishing them.                                                                                                                  |
| `npm run generate:social-image`   | Regenerate the deterministic 1200×630 V1 editorial social card committed under `public/media/site`.                                                                                                                                                                   |
| `npm run analyze:runtime`         | Build the server-only fixture and report the pinned Next runtime floor.                                                                                                                                                                                               |
| `npm run analyze:bundle`          | Build the app, probe every active-profile route sample in a cold browser, classify runtime/shared/route/lazy/pre-intent cost, report fonts/media/WebGL/non-build scripts, and reject unexpected request or page failures. A targeted explorer trigger remains opt-in. |
| `npm run analyze:bundle:explorer` | Build the protected V1 preview with an ephemeral process-only credential, then enforce both real `near` and `intent` explorer enhancement probes, including chunk bytes, final state, and post-trigger failures.                                                      |
| `npm run lighthouse`              | Build and own a production server, collect three cold mobile Lighthouse runs, enforce medians, and always stop the server.                                                                                                                                            |

The Lighthouse runner is pinned to `13.4.0` in
`tools/lighthouse/package-lock.json` and installed with scripts disabled before
each run. Its advisory-heavy observability dependency tree stays outside the
application lockfile, while the isolated lock preserves exact transitive
versions and integrity hashes. It collects three valid samples, permits at most
two recorded retries for the known `NO_FCP` lab-capture condition, and never
retries other runtime errors.

Legacy Playwright uses deterministic port 3100. Lighthouse uses port 3101, the
bundle probe uses port 3102, the isolated foundation matrix uses port 3104, the
owned route/metadata audit uses port 3105, and the cross-browser release smoke
uses port 3107.
For a protected Lighthouse checkpoint only, port 3101 is the loopback proxy and
the owned Next.js upstream defaults to port 3106. Their server owners require both the spawned
process's readiness marker and a successful local response, then terminate the
owned process group after success, failure, or an interrupt. Generated
diagnostics live under `.quality-reports`,
`playwright-report`, and `test-results`; all are ignored locally and uploaded by
CI where useful.

The foundation matrix treats the browser's exact `csp` rejection of local
`/_next/static/chunks/*.js` requests as an intentional no-JavaScript condition
only in its two `javaScriptEnabled: false` projects. Every other failed request,
HTTP error response, console error, and page error remains blocking.

The release smoke intentionally does not repeat the full content matrix. It
checks the protected homepage, Fradium, and Moments document contracts once per
browser engine, then exercises primary navigation, explorer selection, and the
1120×760-to-390×844 responsive boundary. Content provenance, every project
record, detailed motion interruption, no-JavaScript, and the larger viewport
matrix remain owned by their existing focused suites.

The route audit defaults to the `pre-cutover` profile. It deliberately treats
the preserved V5 root as an internal-link reachability target rather than a V1
metadata surface; its missing canonical and two legacy `#` social links are
recorded as deferred replacement debt. After the approved root switch,
`npm run audit:release-routes -- --profile post-cutover` makes `/`, all four
flagship routes, and `/moments` public requirements while requiring the preview
namespace to return 404. The post-cutover profile has no legacy exception.

External link probing is a release-time network check rather than a per-commit
CI dependency. Its JSON report keeps source file/line references and distinguishes
reachable, manual-review, and failed URLs; strict mode fails only the last class.

### Protected V1 preview probes

The bundle and Lighthouse runners can inspect the Basic-auth-protected V1
checkpoint without weakening the preview gate. Both enforce a minimum
32-character token. The bundle probe scopes Playwright HTTP credentials to its
runner-owned origin. The Lighthouse runner keeps the credential out of the
Lighthouse process, command arguments, and reports: a loopback-only proxy on
port 3101 injects Basic auth only while forwarding to the runner-owned Next.js
upstream on port 3106. Cross-origin browser requests never receive it.

```bash
export PORTFOLIO_V1_PREVIEW=1
export PORTFOLIO_V1_PREVIEW_TOKEN="local-preview-token-with-at-least-32-characters"

npm run build
node scripts/analyze-bundle.mjs \
  --profile v1 \
  --route /preview/open-proving-ground/site \
  --budget-route / \
  --viewport desktop \
  --output .quality-reports/bundle-v1-preview-desktop.json

LIGHTHOUSE_PROFILE=v1-preview \
LIGHTHOUSE_URL=http://127.0.0.1:3101/preview/open-proving-ground/site \
npm run lighthouse
```

`--budget-route` applies the canonical public route ceiling while the preview
path remains private. The measured manifest entry and network path remain the
actual preview route in the report. `v1-preview` is an implementation diagnostic:
it omits the SEO minimum because the protected checkpoint is intentionally
`noindex`, and allows up to 3.5 seconds lab LCP while the preview is being
assembled. It does not relax release approval. The unchanged `v1` profile must
pass against the public root, including SEO 1.0 and LCP at most 2.5 seconds,
before cutover.

### Explorer enhancement bundle probe

The default bundle command remains a cold-navigation probe and performs no
synthetic user action. The committed local/CI gate builds the protected preview
with an ephemeral process-only credential and measures both real triggers after
the unchanged 3,000 ms pre-intent window:

```bash
npm run analyze:bundle:explorer
```

Use `node scripts/analyze-bundle.mjs --enhancement-trigger near|intent ...`
only to debug one trigger against an existing preview-enabled build; that raw
form requires `PORTFOLIO_V1_PREVIEW=1` and a valid
`PORTFOLIO_V1_PREVIEW_TOKEN` in the environment.

`near` scrolls the stable `[data-project-explorer]` target into view. `intent`
focuses the first non-active `[data-explorer-preview]` button and requests
`preventScroll`, falling back to native focus if that option is unavailable.
Neither trigger clicks a project or replaces the product interaction with a
test-only hook.

After the action, the runner observes a separate bounded 3,000 ms settle window.
Only local Next build JavaScript absent from the cold set contributes to
`postTriggerAdditionalJavaScriptGzipBytes`; the report lists each chunk path,
gzip bytes, and SHA-256 digest. It also records that the cold and additional
sets use an explicit `observed post-trigger minus cold navigation` partition,
including any already-cold repeat requests; the resulting additional set is
disjoint by construction. Intersections and subset status against the manifest
initial set and the route's dynamic lazy manifest are reported independently.
When that dynamic manifest does not exist, the relationship is unavailable
instead of guessed. Report provenance includes both the HEAD commit and whether
the source tree was dirty, so measurements from an uncommitted build cannot
masquerade as that commit's result.

An opt-in trigger adds a dedicated budget check for the measured post-trigger
bytes. The runner prefers a future `lazyExplorerJavaScriptGzipBytes` route limit
and currently falls back to the committed `lazyJavaScriptGzipBytes` 60,000-byte
limit; `budget.enhancementTrigger.sourceLimitMetric` records which key supplied
the ceiling. It also requires zero post-trigger transport failures, HTTP errors,
page errors, and final-state mismatches. Without `--enhancement-trigger`, report
fields, timing, actions, and budget enforcement remain the cold-navigation
behavior. CI runs both triggers through `npm run analyze:bundle:explorer`.

## Temporary V5 envelopes

V5 is still the public root while V1 is built. Its known costs are not hidden:

- bundle limits in `quality/budgets.json` are a narrow provisional regression
  envelope above the measured V5 values;
- the preserved V5 locally requests Vercel Speed Insights and receives the
  expected `ERR_ABORTED` at `/_vercel/speed-insights/script.js`; that exact path
  plus `script` resource type and `net::ERR_ABORTED` error is the only temporary
  failed-request allowance, while every other request failure and every uncaught
  page error fails the gate; subresource HTTP responses at 400 or above also
  fail, while redirects remain valid;
- `quality/a11y-legacy-baseline.json` permits only the measured legacy
  `color-contrast` ceiling of five nodes on desktop and mobile Chromium, while
  any other serious or critical axe rule fails immediately;
- Lighthouse uses a separate provisional profile and publishes every raw run
  plus the median summary.

The final stable-Chrome V5 mobile median is 0.93 performance, 0.96
accessibility, 0.96 best practices, 1.0 SEO, 3,168.21 ms LCP, 0 CLS, and 47 ms
TBT. The provisional envelope allows normal lab variance but fails material
regression.

A lower finding count passes. A new rule or a count above the recorded ceiling
fails. These exceptions are deleted, not carried forward, when V1 replaces the
root.

## Locked V1 targets

The inactive `v1` profiles preserve the approved release budgets:

- homepage initial JavaScript at most 175,000 gzip bytes;
- homepage route-owned JavaScript at most 18,000 gzip bytes;
- case-study initial JavaScript at most 170,000 gzip bytes;
- case-study route-owned JavaScript at most 12,000 gzip bytes;
- lazy explorer JavaScript at most 60,000 gzip bytes;
- pre-intent enhancement JavaScript exactly 0 bytes;
- successful JavaScript outside the local Next build graph exactly 0 bytes;
- initial CSS at most 30,000 gzip bytes;
- initial media at most 750,000 bytes desktop and 500,000 bytes mobile;
- largest image at most 200,000 bytes desktop and 140,000 bytes mobile;
- WebGL context requests exactly 0;
- unexpected failed requests, HTTP error responses, and uncaught page errors
  exactly 0;
- mobile lab LCP at most 2.5 seconds;
- mobile lab CLS at most 0.1;
- mobile lab TBT at most 200 milliseconds;
- Lighthouse accessibility score 1 and zero serious/critical axe findings.

The active profile changes only in the release-candidate issue, after real V1
routes exist. When active, every route sample runs at 1440x900 desktop and
390x844 touch/mobile viewports so the stricter mobile media overrides are
enforced. Shared Next runtime cost and font transfers are reported separately so
a framework floor cannot be hidden inside route-owned numbers.

The original plan proposed 150,000 bytes for the homepage and 145,000 for a
case study. The pinned server-only fixture first measured a 145,141-byte total
initial floor before portfolio route code. Issue #11 then calibrated the real
production V1 route and measured a 169,637-byte shared-runtime floor. The
Issue #13 semantic explorer enhancer raised the measured homepage cold total to
171,719 bytes while preserving zero pre-intent enhancement bytes. The homepage
ceiling is therefore rebaselined narrowly to 175,000 bytes; the server-only case
study ceiling remains 170,000 bytes. The stricter 18,000- and 12,000-byte
route-owned ceilings remain unchanged and are enforced as separate
measurements. This preserves a meaningful reduction from the measured
555,535-byte V5 cold pre-intent baseline without hiding the production
framework floor or disguising the enhancer as inline code. The same V5 build
declared 219,444 bytes through the initial Next manifests; the larger number
deliberately includes its scene chunks because they load automatically within
the fixed three-second window.

## Audit note

`npm audit --omit=dev` currently reports the upstream PostCSS advisory inherited
through supported Next.js 16.2.10. The application does not accept or stringify
user-supplied CSS. No canary, downgrade, or unverified dependency override is
used to manufacture a green result. CI audits the complete application graph,
the production graph, and the separately locked Lighthouse tool graph; high or
critical findings fail. Moderate upstream findings stay visible until supported
stable patches resolve them.

## Primary references

- [Node.js release status](https://nodejs.org/en/about/previous-releases)
- [Node.js 24.18.0 LTS](https://nodejs.org/en/blog/release/v24.18.0)
- [Next.js support policy](https://nextjs.org/support-policy)
- [Next.js ESLint configuration](https://nextjs.org/docs/app/api-reference/config/eslint)
- [Next.js testing guides](https://nextjs.org/docs/app/guides/testing)
- [Playwright managed web server](https://playwright.dev/docs/test-webserver)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Lighthouse configuration](https://github.com/GoogleChrome/lighthouse/blob/main/docs/configuration.md)
