# Decision Log — Personal Field Notes

## Locked

| Decision | Rationale |
| --- | --- |
| Personal Field Notes is the visual concept | supports projects, journey, photography, and future updates |
| English public copy | approved audience and portfolio language |
| Homepage is overview-first | visitors choose detail after intent |
| Four flagships have equal homepage weight | avoids one-project tunnel vision |
| PayGate is the current signal | it is the active real product |
| Project details live on `/work/[slug]` | preserves homepage clarity |
| Moments categories are Build/Win/Learn/Give | represents a human journey without an organization résumé |
| 70/30 structure/expression rule | maintains creativity without layout chaos |
| Warm paper + ink + three accents | distinctive but implementable and readable |
| Instrument Serif + Instrument Sans | editorial expression plus clear UI/body text |
| No 3D/WebGL | concept does not benefit enough to justify cost |
| No sticky project preview | directly prevents the previous occlusion failure |
| Static before motion | layout and content must work independently |
| Bounded GSAP only | one cover sequence may justify sequencing; ordinary states use CSS |
| Native scroll snap first for filmstrip | avoid a gallery dependency until necessary |
| New V2 preview namespace | protects rollback and enables honest comparison |
| Generated images are composition references only | they contain inaccurate text and media pairings |

## Implementation decisions to verify, not redesign

These are measurement questions whose answers do not change the concept:

- exact WOFF2 subset and fallback metrics;
- whether native filmstrip momentum is sufficient across target browsers;
- whether View Transitions improve route continuity without hurting navigation;
- exact hero crop/focal point after asset review;
- exact public Moment count at release after rights approval;
- whether current budgets can be tightened after explorer removal.

## Change control

A locked decision changes only when:

1. Wildan explicitly requests the change;
2. an accessibility, performance, factual, or implementation constraint makes
   the decision unsafe or infeasible; and
3. the replacement is documented here before implementation spreads.

Taste drift during coding is not a reason to change the concept.
