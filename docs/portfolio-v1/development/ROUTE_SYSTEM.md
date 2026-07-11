# Portfolio V1 Route System

Date: 11 July 2026
Implementation: GitHub Issue #9

This document records the server-first route checkpoint that sits between the
validated content repository and the later Fradium and motion work.

## Coexistence map

| Public path | Current behavior |
| --- | --- |
| `/` | Preserved legacy homepage and legacy metadata. No V1 cutover yet. |
| `/work` | Real V1 archive route. It shows an honest preparation state while every record remains `preview`. |
| `/work/[slug]` | Shared full/brief template. The public query returns only `published` records, so current preview slugs return the V1 404. |
| `/contact` | V1 direct-contact route using email and links whose content state is `public`; no form or public API. |
| `/moments` | V1 route withheld until at least two distinct moments are `published`. |
| `/preview/open-proving-ground/site` | Credential-protected, noindex, motion-free homepage composition with the four approved flagships. |
| `/preview/open-proving-ground/content/[slug]` | Credential-protected full/brief shared case-study proof. |

The existing foundation checkpoint remains at
`/preview/open-proving-ground`. Preview authentication, no-store headers, and
the runtime env-off gate continue to be owned by `src/proxy.ts`.

## Layout boundaries

The root layout owns only the document, fonts, and canonical `metadataBase`.
Legacy metadata and `LegacyShell` live in `(legacy)`. V1 metadata and scoped
foundation/route styles live in `(v1)`.

The nested `(v1)/(site)` layout composes one server-rendered shell:

```text
SkipLink
SiteHeader
main#main-content
SiteFooter
```

It has no client provider, menu state, or hydration dependency. The private
foundation and compatibility routes remain outside this nested layout when they
need bespoke preview chrome.

## Query and publication gates

- `getSiteShell()` returns profile plus navigation filtered against publicly
  routable projects by default.
- `getWorkProjectSummaries()` sorts visible records by `lastUpdatedAt`
  descending, then slug ascending.
- `getProjectBySlug()` and `getProjectParams()` never include preview records
  unless the caller explicitly requests preview and the preview environment is
  enabled.
- `getMomentsNarrative()` returns nothing until two published moments with
  distinct event/date/place narrative points exist. The same gate controls the
  route and sitemap.
- Public routes, metadata, and sitemap never pass `{ preview: true }`.

The project route keeps `generateStaticParams()` for published records while
allowing the closest V1 not-found boundary to handle unknown slugs. With an
empty published params set, Next 16's strict no-fallback path bypassed the
nested not-found UI and logged `NoFallbackError`; the content query remains the
fail-closed publication authority instead.

## Shared presentation

`ProjectPage` and `ProjectBriefPage` share `ProjectOpening`, project facts,
semantic link states, and the same editorial grammar. Full records render only
validated repository MDX through the fixed component map. Brief records render
their authored context, outcome, role scope, and collaborator credit directly
from YAML.

The motion-free homepage and archive use an editorial project ledger rather
than cards. Preview project URLs are injected by the route, so a preview record
never points at a public `/work/[slug]` route. No current route renders planned,
private, or missing media as a placeholder.

## Contact and discovery

The former unauthenticated `/api/contact` route is removed. V1 exposes a
`mailto:` path and verified public profile links only. Form/email dependencies
and unreachable legacy form components remain for the later cleanup issue.

Metadata defaults are isolated by route group. Public case-study metadata is
derived from the visible project record and uses ready image media only when an
approved asset exists. `sitemap.xml` includes static public routes, published
projects, and `/moments` only after its narrative gate. `robots.txt` disallows
the private preview namespace.

## Verification contract

The checkpoint is covered by:

- selector and server-wrapper unit tests for visibility, ordering, adjacency,
  site navigation, and the moments gate;
- desktop/mobile public route, 404, sitemap, robots, and removed-API smoke tests;
- JavaScript-disabled public and private navigation tests;
- full/brief preview template and four-flagship composition tests;
- axe checks for `/work` and `/contact`;
- content validation, TypeScript, lint, production build, runtime preview gate,
  and output-file tracing;
- visual inspection at 1440×900 and 390×844 with zero horizontal overflow,
  one `h1`, one `main`, and no figure/canvas placeholders.

## Gates carried into the Fradium and moments slices

- The first `published` flagship must add a positive public-route check for its
  static param, canonical/OG/Twitter metadata, ready social image, public MDX
  import, and sitemap entry. Preview integration already proves the shared
  full/brief presentation, but it is not a substitute for that publication test.
- The second published moment must add a positive route/sitemap integration
  check alongside the existing positive selector test.
- The server-only shell intentionally has no route-aware active-nav island yet.
  Route identity is provided by the page `h1`; an `aria-current` treatment is a
  cutover decision and must not silently add a global client dependency.
