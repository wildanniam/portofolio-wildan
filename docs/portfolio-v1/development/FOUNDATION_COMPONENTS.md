# Editorial foundation component contracts

Date: 11 July 2026
Status: implemented checkpoint for GitHub Issue #5

These primitives define structure and semantics for Portfolio V1. They are not
a universal card library, and they must remain independent of Fradium, NovaAI,
PayGate, Quorum, or any other project record.

## Shell boundary

- The neutral root layout owns only document metadata, Geist font variables,
  global Tailwind entry, `<html>`, and `<body>`.
- `(legacy)` owns the preserved V5 providers and chrome.
- `(v1)` owns the light-only `[data-portfolio-v1][data-site-shell="v1"]`
  boundary and scoped editorial stylesheet.
- V1 styles must begin at `[data-portfolio-v1]`; route-loaded CSS is allowed to
  remain in the browser after navigation without changing V5.
- The private checkpoint is `/preview/open-proving-ground`. It exists only in a
  build created with `PORTFOLIO_V1_PREVIEW=1`, requires a valid 32+ character
  `PORTFOLIO_V1_PREVIEW_TOKEN` through HTTP Basic Authentication, emits
  `private, no-store` and `noindex, nofollow`, and is absent from V5 navigation.

## Primitive contracts

| Component | Semantic contract | Styling contract |
|---|---|---|
| `SiteContainer` | Structural `div`; accepts normal div props | One shared max-width and responsive gutter source |
| `EditorialGrid` | Structural `div`; accepts normal div props | 4/8/12 authored grid, `min-width: 0`, approved gaps |
| `SectionRule` | Decorative `hr`; optional index is hidden from assistive technology | Rule supports hierarchy but never becomes the only state cue |
| `ActionLink` | Native anchor with required meaningful `href`; arrow mark is decorative | 44px minimum target, 2px cobalt focus, restrained CSS transition |
| `MetadataLine` | Native `dl` with labelled `dt`/`dd` pairs | Compact mono labels, readable values, no badge grammar |
| `EvidenceFigure` | Native `figure`; caller supplies media and caption | Declared ratio and surface/matte treatment, square strong frame |
| `EvidenceCaption` | Native `figcaption`; label, copy, optional source | Outside media, stacked on mobile and two-column from tablet |

All primitives are Server Components. None may import GSAP, Motion, WebGL,
project data, or browser-only state. Additional classes are accepted for
composition, while their base class names and `data-foundation-component`
hooks remain stable for QA.

## Intentional decisions in this slice

1. The route-group split originally scheduled for the later shell issue was
   introduced at its minimum size because a nested V1 page could not otherwise
   avoid the V5 ThemeProvider, Navbar, Footer, Toaster, and Speed Insights. No
   V5 component or public route behavior was rewritten.
2. The typography contract keeps its four coarse `--leading-*` tokens and adds
   four documented style-specific variants for the remaining approved table
   values.
3. The QA surface imports the already-audited Fradium public-homepage capture
   as authentic product evidence. Its caption limits the claim to a rendered
   product surface and does not imply production security or adoption. Mobile
   uses an authored square crop of the same source so its headline and central
   product surfaces remain inspectable instead of shrinking the desktop frame.
4. Foundation screenshots are CI/review artifacts, not committed pixel
   baselines. They become strict regression references only after Wildan
   approves the composition.
5. No animation library is used in the foundation checkpoint. Motion remains
   deferred to the bounded evidence explorer after the static slice is
   approved.

## Verification surface

`npm run test:foundation` builds the preview with the gate enabled and checks:

- 1440×900, 768×1024, and 390×844 under light and dark OS preference;
- a 720×450 CSS viewport that reproduces the reflow conditions of a 1440×900
  viewport at 200% browser zoom;
- exact 12/8/4 grid and responsive gutter behavior;
- light document surfaces and no hidden horizontal overflow;
- semantic server-rendered content with JavaScript disabled;
- first-tab focus treatment and native fragment navigation;
- full-document axe results with no legacy accessibility allowance.
- zero console errors, page errors, request failures, and HTTP error responses.
