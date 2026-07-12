# Gallery Photo Intake

Status: **all 13 photographs are technically processable candidates; publication eligibility still depends on rights/consent, and six moments plus one About portrait now have private review derivatives**
Source policy: **the files in `~/Downloads` are private masters; none should be copied into the repository or published directly**

This gallery should read as a student developer's build journey: learning in public, working with teams, presenting, winning, and contributing to communities. The categories below are editorial priorities, not judgments about whether an experience is “serious enough.” A photograph may add useful human texture without needing to prove a production product.

For project captions, use the agreed owner-attested roles when relevant: **Fradium — Leader & Full-Stack Developer** and **Nova — Full-Stack & AI Builder**. Credit the team visible in each result photograph as well. No supplied photograph needs to be forced into PayGate or Quorum if it belongs to another moment.

## Technical summary

- All files decoded successfully; no corrupt source was found.
- The seven HEIC masters contain GPS/device/date metadata and use Display P3. They require orientation normalization, conversion to sRGB, and full metadata removal.
- `FullSizeRender 5.JPG` also contains GPS/device/date metadata and uses Display P3.
- The other five JPG files are sRGB and no GPS was detected in the metadata inspection. They should still be stripped on export.
- Dimensions below are stored-pixel readings. Some HEIC files render as portrait through orientation metadata; the approved derivative must bake that orientation into the pixels.
- `PHOTO-2025-11-01-10-16-29 3.JPG` (960×1280) and `e3f3c699-30b6-4609-95ec-2156f2f3a6ce.JPG` (1280×960) should remain card/contact-sheet images rather than desktop full-bleed media. Do not upscale them.

## Intake inventory

`Lead` can carry a story alone, `supporting` strengthens a chapter, and `context` belongs in a contact sheet or quieter moment sequence.

| Master | Editorial use | Tier | Resolution / metadata | Sanitization and derivative note |
|---|---|---|---|---|
| `IMG_4446.HEIC` | Six-person blockchain workshop/classroom photograph; shows the learning-and-building community around the work. | Supporting | 4032×3024 stored, portrait render; GPS + P3 | Strip GPS/all EXIF, bake orientation, convert to sRGB. Check the visible lanyard badge at final crop; blur only if its personal text becomes readable. Portrait/card crop is stronger than a wide hero. |
| `IMG_0313 2.HEIC` | Wildan in front of Bank Indonesia; scholarship and learning-beyond-campus chapter. | Supporting | 5712×4284 stored, portrait render; GPS + P3 | Strip GPS/all EXIF, bake orientation, convert to sRGB. Crop or softly redact the hanging badge if readable. Keep the building name when it is intentional context. Suitable for a tall editorial frame. |
| `IMG_5499.HEIC` | Campus AI/self-healing research milestone with an academic document visible on the laptop. | Supporting | 4284×5712 portrait; GPS + P3 | Strip GPS/all EXIF and convert to sRGB. Inspect the laptop at export size: keep the research title if it is part of the story, but redact names, IDs, email, signatures, or unpublished detail. Strong 4:5 crop around both people and laptop. |
| `IMG_0459 2.HEIC` | Candid builder-event stage moment; useful as atmosphere between polished outcomes. | Context | 4032×3024 stored, portrait render; GPS + P3 | Strip GPS/all EXIF, bake orientation, convert to sRGB. Crop the partial people and foreground heads where practical. Blur/crop the foreground laptop screen and background QR code unless both are intentionally public and still safe. Use as a small contact-sheet tile. |
| `IMG_5100.HEIC` | Large student/outreach group outside SMA Negeri 11 Bandung; shows community participation and peer learning. | Context | 5712×4284 landscape; GPS + P3 | Strip GPS/all EXIF and convert to sRGB. Redact vehicle plates and any readable lanyard IDs. The school sign may remain as event context. Confirm that the group/organizer is comfortable with public use, especially if any participant is under 18. Landscape contact-sheet crop only. |
| `IMG_7463 2.HEIC` | Nova team holding the Lisk Builders Challenge award boards; the clearest external outcome for the **Full-Stack & AI Builder** chapter. | Lead | 5712×4284 landscape; GPS + P3 | Strip GPS/all EXIF and convert to sRGB. Preserve the team and both public award boards; check small badges but no heavy redaction is expected. Produce a 3:2/16:10 lead and a tighter card crop. |
| `IMG_2331.heic` | Wildan speaking into a microphone at a builder event; energetic “learning in public” candid. | Supporting | 3024×4032 portrait; GPS + P3 | Strip GPS/all EXIF and convert to sRGB. Crop distracting foreground bodies where possible and redact participant name labels if readable. Use a 4:5 portrait/card derivative. |
| `ab102d36-feaa-4abc-9e27-c697ae78e648 3.JPG` | Strong individual event portrait for About, contact, or a pause between team moments. | Lead / portrait | 3072×4096 portrait; sRGB; no GPS detected | The ID card is readable and must be cropped out or redacted. Strip remaining metadata. Produce an intentional 4:5 portrait with the face as focal point; retain enough venue context to avoid a generic headshot. |
| `FullSizeRender 5.JPG` | SpecHeal team with the Refactory Hackathon 2nd Place board; strong evidence of a student hackathon outcome. | Lead | 2268×4032 portrait; GPS + P3 | Strip GPS/all EXIF and convert to sRGB. No obvious private screen or ID detail; retain the full board and both people. Make a 4:5 card/lead crop, not an ultra-wide crop. |
| `PHOTO-2025-11-01-10-16-29 3.JPG` | Fradium team with the WCHL Fully On-Chain Track $5,000 winner board; strongest human outcome for the **Leader & Full-Stack Developer** story. | Lead | 960×1280 portrait; sRGB; no GPS detected | Strip metadata and keep all six teammates plus the result board. No upscale: publish near native size as a medium evidence/card frame, with a responsive width cap around 960 CSS pixels at 1×. |
| `352e823d-9a72-4741-8114-58145643a3dc 2.JPG` | Four-person Dicoding Developer Conference photograph; peer community and continuing-learning moment. | Supporting | 2268×4032 portrait; sRGB; no GPS detected | Strip metadata; inspect badges at the approved crop. Preserve the event wall as useful context. A 4:5 crop can reduce excess window area while keeping all four people. |
| `e3f3c699-30b6-4609-95ec-2156f2f3a6ce.JPG` | Adikarya 2025 awarding-ceremony group; campus/lab community context rather than a flagship-project result. | Context | 1280×960 landscape; sRGB; no GPS detected | Strip metadata and keep as a compact contact-sheet image. Check visible badges at final size. Do not upscale or use full-bleed. |
| `f00f87ad-908f-4db1-babf-e0303cd744ea 2.JPG` | Food Bank Bandung group activity; broadens the story beyond competitions into student community participation. | Context | 4032×3024 landscape; sRGB; no GPS detected | Strip metadata. Crop out the phone at the far right if convenient and redact handwritten name tags only when legible at published size. Confirm group/source comfort before use. Best as a wider contact-sheet tile. |

## Implemented V1 editorial sequence

Issue #17 implements a small, intentional first release instead of placing all
13 images at equal weight:

1. `IMG_2331.heic` — learning-in-public lead at Kelas Rutin Batch 4 Graduation Day.
2. `PHOTO-2025…JPG` — Fradium team outcome.
3. `IMG_5499.HEIC` — self-healing research proposal milestone.
4. `IMG_7463 2.HEIC` — Nova team outcome; this reuses the existing Nova frame
   and must never become a duplicate binary or second tile.
5. `FullSizeRender 5.JPG` — SpecHeal result.
6. `IMG_0313 2.HEIC` — SERAMBI 2026 / learning-beyond-campus close. The photo
   does **not** independently support a scholarship claim.

`ab102d36…JPG` is separated into the About/contact portrait package rather than
being forced into the documentary sequence.

The remaining six are ready as a second contact sheet once captions, source, and
group comfort are recorded. `IMG_5100.HEIC` remains deliberately deferred because
the school group has the highest consent/privacy risk. This keeps the first gallery
personal and varied while avoiding the feel of an organization résumé.

## Private review package

Run `node scripts/prepare-moment-review.mjs` on macOS with the original files in
`~/Downloads` (or set `MOMENT_SOURCE_DIR`). It generates only ignored files below
`.quality-reports/moments-review/`:

- a seven-frame crop sheet;
- desktop and mobile WebP review derivatives;
- a machine-readable manifest with crop, focal point, redaction, dimensions,
  quality, and byte size.

The script uses ColorSync to convert Display P3 masters to sRGB, bakes orientation,
applies the scoped student-number/credential redactions, strips source metadata,
and enforces the 200 KB desktop / 140 KB mobile moment budgets. Review output is
not a publication boundary: approved derivatives move to `public/media/moments`
only after caption, date/place, credit, rights, and visible-person consent review.

## Derivative contract

For every published photograph:

1. Keep the untouched master outside the workspace.
2. Confirm event, actual date, place, related project, names/people credit, photographer/source, and permission. Treat embedded dates as hints because forwarded/exported files can carry a different creation date.
3. Bake orientation, make the editorial crop, and perform only the redactions listed above.
4. Convert Display P3 sources to sRGB and remove **all** EXIF/IPTC/XMP metadata, including GPS and device data.
5. Export an approved high-quality sRGB JPEG master derivative (roughly quality 82–88, normally no more than 2400–2560 px on the long edge). Let the image pipeline provide WebP/AVIF variants; do not commit HEIC files.
6. Create only crops the composition supports: lead, 4:5 portrait/card, compact thumbnail, and 1200×630 social crop when it remains honest. Do not stretch, upscale, generatively replace backgrounds, or erase teammates for a cleaner claim.
7. Name derivatives with stable lowercase slugs rather than original filenames, for example `nova-lisk-award-lead.jpg` and `fradium-wchl-team-card.jpg`.
8. Approve the exact derivative visually before it enters `public/media`, then provide a factual caption and concise alt text.

No original photograph was edited or added to the repository during this intake.
