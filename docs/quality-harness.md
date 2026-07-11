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
24 LTS. `package.json`, `.nvmrc`, and CI pin the supported line.

npm install scripts are deny-by-default in this repository. `.npmrc` turns
unreviewed scripts into installation failures, while `package.json` approves
only the exact native/runtime packages reviewed during this toolchain change.

## First setup

```bash
nvm install
nvm use
npm ci
npx playwright install chromium
```

The Lighthouse lab uses an installed stable Google Chrome so its current
Lighthouse protocol support is not coupled to Playwright's independently pinned
browser revision. The report records the actual Chrome version. GitHub's runner
image provides stable Chrome; local machines must have it installed or set a
valid `CHROME_PATH` for Lighthouse.

On Linux CI, install the browser and operating-system dependencies together:

```bash
npx playwright install --with-deps chromium
```

## Commands

| Command | Contract |
|---|---|
| `npm run lint` | Official Next.js flat ESLint config, zero warnings allowed. |
| `npm run typecheck` | Generate Next route types, then run strict no-emit TypeScript. |
| `npm run test:run` | Run deterministic Vitest unit and content-adjacent tests once. |
| `npm run test:watch` | Run the same Vitest suite in local watch mode. |
| `npm run test:e2e` | Build and own a production server, then run desktop and mobile Chromium smoke tests. |
| `npm run test:a11y` | Build and own a production server, run axe, attach full findings, and reject new serious/critical regressions. |
| `npm run analyze:runtime` | Build the server-only fixture and report the pinned Next runtime floor. |
| `npm run analyze:bundle` | Build the app, probe every active-profile route sample in a cold browser, classify runtime/shared/route/lazy/pre-intent cost, report fonts/media/WebGL/non-build scripts, and reject unexpected request or page failures. |
| `npm run lighthouse` | Build and own a production server, collect three cold mobile Lighthouse runs, enforce medians, and always stop the server. |

The Lighthouse runner is pinned to `13.4.0` in
`tools/lighthouse/package-lock.json` and installed with scripts disabled before
each run. Its advisory-heavy observability dependency tree stays outside the
application lockfile, while the isolated lock preserves exact transitive
versions and integrity hashes. It collects three valid samples, permits at most
two recorded retries for the known `NO_FCP` lab-capture condition, and never
retries other runtime errors.

Playwright uses deterministic port 3100. Lighthouse uses port 3101, and the
bundle probe uses port 3102. Their server owners require both the spawned
process's readiness marker and a successful local response, then terminate the
owned process group after success, failure, or an interrupt. Generated
diagnostics live under `.quality-reports`,
`playwright-report`, and `test-results`; all are ignored locally and uploaded by
CI where useful.

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

- homepage initial JavaScript at most 170,000 gzip bytes;
- homepage route-owned JavaScript at most 18,000 gzip bytes;
- case-study initial JavaScript at most 165,000 gzip bytes;
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
case study. The pinned server-only fixture measured a 145,141-byte total initial
floor before any portfolio route code. On 11 July 2026 those totals were
therefore revised to 170,000 and 165,000 bytes. The stricter 18,000 and 12,000
route-owned ceilings remain unchanged. This preserves a meaningful reduction
from the measured 555,535-byte V5 cold pre-intent baseline without defining an
impossible framework budget. The same V5 build declared 219,444 bytes through
the initial Next manifests; the larger number deliberately includes its scene
chunks because they load automatically within the fixed three-second window.

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
