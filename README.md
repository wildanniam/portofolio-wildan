# Wildan Syukri Niam - Portfolio

An evidence-first portfolio for Wildan's work across software engineering, AI
agents, and Web3 systems.

The current V5 website remains intact while **The Open Proving Ground V1** is
developed through a controlled, issue-driven migration. The approved V1 source
of truth lives in [`docs/portfolio-v1`](./docs/portfolio-v1/README.md).

## Local development

Prerequisites:

- Node.js 24.18.0
- npm 11.16.0

Node 20 reached end of life in March 2026. The V1 implementation is pinned to
Node 24.18.0/npm 11.16.0 for local verification through `.nvmrc`,
`packageManager`, and CI. The engine range accepts Vercel's supported Node 24
minor, while `vercel.json` pins npm 11.16.0 for deployment installs.

```bash
nvm use
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the production build locally:

```bash
npm run build
npm run start
```

### Environment variables

No environment variables are required to build or browse the current website.
The private editorial checkpoint at `/preview/open-proving-ground` requires both
`PORTFOLIO_V1_PREVIEW=1` and a random `PORTFOLIO_V1_PREVIEW_TOKEN` of at least 32
characters. Sign in through HTTP Basic Authentication with username `preview`
and that token as the password. Authenticated responses remain `private,
no-store` and `noindex`; the public and default test builds force the gate off.

The legacy `/api/contact` endpoint is intentionally unavailable. V1 uses direct
contact links and does not depend on this endpoint.

## Current verification

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm run test:a11y
npm run test:foundation
npm run test:release
npm run audit:release-routes
npm run audit:links
npm run analyze:bundle
npm run lighthouse
```

The exact preservation state and observed results are recorded in the
[V5 preservation baseline](./docs/portfolio-v1/baseline/README.md).

The current quality commands, temporary legacy envelopes, V1 release targets,
and browser prerequisites are documented in the
[quality harness guide](./docs/quality-harness.md). Content validation is added
with the content repository rather than represented by a placeholder command.

## V1 source of truth

- [Canonical V1 index](./docs/portfolio-v1/README.md)
- [Blueprint summary](./docs/portfolio-v1/blueprint-summary.md)
- [Scope V1](./docs/portfolio-v1/scope-v1.md)
- [Content and asset contract](./docs/portfolio-v1/content-asset-contract.md)
- [Motion storyboard](./docs/portfolio-v1/motion-storyboard.md)
- [Development package](./docs/portfolio-v1/development/README.md)
- [QA matrix](./docs/portfolio-v1/development/QA_MATRIX.md)

The older reactor and 3D documents describe the preserved V5 direction. They
are historical context, not implementation guidance for V1.

## Development workflow

Meaningful work follows the repository's issue-driven workflow:

1. Create or reuse a GitHub issue.
2. Branch from the agreed integration head using
   `codex/<issue-number>-<short-topic>`.
3. Implement the smallest complete delivery slice.
4. Run the relevant verification commands.
5. Open a pull request containing summary, verification, risks or notes, and a
   link to the issue.
6. Do not merge without Wildan's explicit approval.

The safety branch is recovery evidence, not an implementation base.

## Publishing policy

V5 remains the public root until the V1 release candidate passes the tracked QA
matrix and receives explicit cutover approval. V1 preview routes remain
unlisted and `noindex` while unfinished.

Only optimized, redacted, rights-cleared derivatives may be committed for
documentary photos. Original photo masters remain outside the repository.
