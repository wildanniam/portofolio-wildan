# Typography source and license record

Date verified: 11 July 2026
Applies to: Portfolio V1 (`The Open Proving Ground`)

## Production families

Portfolio V1 uses the variable `Geist` and `Geist Mono` families through
`next/font/google`, limited to the Latin subset. Next.js downloads the font
assets during the production build and serves them from the application; the
browser does not request font files from Google at runtime.

| Family | Google Fonts binary version | Google Fonts upstream source |
|---|---:|---|
| Geist | 1.800 | `vercel/geist-font@a6d260e6cbc07eafdfad438f33601fe3c38b1e6f` |
| Geist Mono | 1.701 | `vercel/geist-font@77f0563c03009d6c15c6342183fa53b352255b22` |

The versions above identify the Google Fonts binaries inspected for this
implementation. The Geist upstream project also published release `v1.7.2` on
1 June 2026; release numbering and individual font-binary version fields are
separate identifiers.

Official records:

- [Geist Google Fonts metadata](https://github.com/google/fonts/blob/main/ofl/geist/METADATA.pb)
- [Geist Mono Google Fonts metadata](https://github.com/google/fonts/blob/main/ofl/geistmono/METADATA.pb)
- [Geist upstream repository](https://github.com/vercel/geist-font)
- [Geist upstream releases](https://github.com/vercel/geist-font/releases)

## License

Both families are licensed under the SIL Open Font License, Version 1.1. The
copyright notice is:

> Copyright 2024 The Geist Project Authors
> (https://github.com/vercel/geist-font.git)

The retained license text is tracked at
[licenses/Geist-OFL-1.1.txt](./licenses/Geist-OFL-1.1.txt). No font files are
modified by this project.

## Implementation constraints

- Load only the weights and subsets used by the editorial system.
- Keep the `next/font` CSS variables `--font-geist-sans` and
  `--font-geist-mono` at the neutral root layout so the legacy and V1 shells
  share one self-hosted font load.
- Do not add a third family without a new license, payload, and visual review.
- Re-verify this record when the selected Google Fonts binaries or source
  commits change.
