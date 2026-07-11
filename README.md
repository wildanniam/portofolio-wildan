# Wildan Syukri Niam - Portfolio

An evidence-first portfolio for Wildan's work across software engineering, AI
agents, and Web3 systems.

The current V5 website remains intact while **The Open Proving Ground V1** is
developed through a controlled, issue-driven migration. The approved V1 source
of truth lives in [`docs/portfolio-v1`](./docs/portfolio-v1/README.md).

## Local development

Prerequisites:

- Node.js 20.x
- npm 10.x

The current baseline was verified with Node.js 20.20.2 and npm 10.8.2.

```bash
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

The legacy `/api/contact` endpoint requires `RESEND_API_KEY` when called.
`RESEND_FROM` and `CONTACT_TO` are optional overrides. V1 uses direct contact
links and does not depend on this endpoint.

## Current verification

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

The exact preservation state and observed results are recorded in the
[V5 preservation baseline](./docs/portfolio-v1/baseline/README.md).

Standalone test, content validation, browser QA, accessibility, and bundle
checks are specified in the V1 development plan and will be added by the
corresponding implementation issues.

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
