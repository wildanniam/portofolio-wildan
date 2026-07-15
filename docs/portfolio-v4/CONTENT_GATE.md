# Portfolio V4 — Editorial Content Gate

- Status: approved and locked by Wildan on 15 July 2026; canonical migration in progress
- Scope: editorial contract plus project-level English copy for the Work archive, metadata, and full case-study openings
- Source boundary: canonical project YAML, approved role labels, claims, system flows, and lifecycle notes as verified on 11 July 2026
- Runtime effect: none; this document does not change schemas, content records, routes, or rendered UI

This copy gate was approved before layout implementation. The exact wording below is now authorized for migration into canonical content; the project YAML remains the runtime source of truth.

## Decision to lock

One project sentence cannot serve every surface. Portfolio V4 gives each context one editorial job:

| Context | Proposed canonical field | Editorial job | Budget |
| --- | --- | --- | --- |
| Homepage Atlas | `homepage.projectStages[].question` and `.answer` | Connect one research question to one working-system answer | Existing approved copy; unchanged by this gate |
| Work archive | `project.editorial.archive.summary` | Help a visitor understand and choose a project quickly | Non-empty, one sentence, maximum 180 characters |
| Case-study opening | `project.editorial.caseOpening.question` and `.answer` | Open the deeper problem → product-response narrative | Question maximum 140 characters; answer maximum 200 characters |
| Page metadata | `project.editorial.metadata.description` | Stand alone in search and social previews | Non-empty, plain text, one line, maximum 180 characters |

The proposed content shape is:

```yaml
editorial:
  archive:
    summary: ...
  metadata:
    description: ...
  caseOpening: # required only for full case studies
    question: ...
    answer: ...
```

`oneLiner` becomes a migration-only legacy field. V4 must not derive one context from another, even when two approved sentences happen to be similar. Explicit duplication is preferable to accidental editorial coupling.

## Voice and truth rules

1. Use the exact approved project role confidently. Collaboration credit remains visible elsewhere; it does not weaken Wildan's role.
2. Describe a hackathon build as a real prototype or build artifact. Do not frame it as a failed company or pretend it is an operated product.
3. Use `testnet`, `prototype`, `beta`, `active`, `public`, `grant`, and award language only where the project record supports it.
4. Do not claim mainnet readiness, production scale, customer adoption, revenue, partnership, certification, security audit, autonomous custody, or published research.
5. Do not use `inspect`, `inspectable`, or `inspection` as a substitute for explaining what the system does.
6. Avoid repeatedly foregrounding `evidence` and `boundaries` in public-facing summaries. Those ideas remain available inside the detailed technical narrative where they are concrete.
7. Archive copy explains the product. Role, lifecycle, origin, and outcome remain separate visible facts and are not crammed into the same sentence.
8. Metadata may include Wildan's role and one differentiating fact because it must make sense outside the page.
9. A case opening asks one real question and answers with the built mechanism. Awards and limitations belong in their dedicated case-study sections.
10. Character counts below include spaces and punctuation. Any wording change requires a recount and another claim check.

## Approval matrix

Mark a cell only after approving the exact quoted wording for that context.

| Project | Archive summary | Metadata description | Case opening |
| --- | --- | --- | --- |
| Fradium | [x] | [x] | [x] |
| Nova AI Wallet | [x] | [x] | [x] |
| PayGate | [x] | [x] | [x] |
| Quorum | [x] | [x] | [x] |
| AgentPay | [x] | [x] | Not applicable — brief record |
| Crucible | [x] | [x] | Not applicable — brief record |
| SpecHeal | [x] | [x] | Not applicable — brief record |

## Full case studies

### Fradium

- Record state: published · full case study · public beta · hackathon collaboration
- Approved role label: **Leader & Full-Stack Developer**
- Grounding: `fradium-role`, `fradium-wchl-2025`, `fradium-public-beta`, `fradium-risk-flow`, plus the canonical problem and system flow

#### Archive summary — 95 / 180 characters

- [x] Approve exact wording

> A Web3 trust layer that combines AI and community signals before a user confirms a transaction.

#### Metadata description — 178 / 180 characters

- [x] Approve exact wording

> Fradium case study: Wildan led its six-person team and worked across the full stack. The team won the Fully On-Chain Track at the World Computer Hacker League 2025 Global Finale.

#### Case-study opening

- [x] Approve question — 75 / 140 characters

> How can a wallet surface meaningful risk before a user signs a transaction?

- [x] Approve answer — 125 / 200 characters

> Fradium combines chain-specific analysis, AI inference, and community reports while keeping the final decision with the user.

Truth boundary: this says what the reviewed beta flow does. It does not claim that the risk result is infallible, that every execution path is mainnet, or that the project has production-scale adoption.

### Nova AI Wallet

- Record state: published · full case study · completed hackathon prototype
- Approved role label: **Full-Stack & AI Builder**
- Grounding: `nova-role`, `nova-user-signing-boundary`, `nova-sprint-state`, plus the canonical problem, decisions, and system flow

#### Archive summary — 127 / 180 characters

- [x] Approve exact wording

> An AI wallet that turns a user's prompt into on-chain context and a prepared transaction that they approve in their own wallet.

#### Metadata description — 143 / 180 characters

- [x] Approve exact wording

> Nova AI Wallet case study: Wildan built the full stack and AI-agent flows for a collaborative hackathon prototype with user-controlled signing.

#### Case-study opening

- [x] Approve question — 83 / 140 characters

> Can an AI wallet translate a prompt into an on-chain action without taking custody?

- [x] Approve answer — 130 / 200 characters

> Nova interprets intent, gathers wallet and market data, and prepares transactions for the user to approve in the connected wallet.

Truth boundary: Nova is presented as an agent-assisted hackathon artifact. The copy does not imply that the model holds keys, autonomously moves funds, or remains an actively operated production wallet.

### PayGate

- Record state: published · full case study · active Stellar testnet product · independent grant-backed build with a credited hardening contribution
- Approved role label: **Founder & Full-Stack Developer**
- Grounding: `paygate-role`, `paygate-instaward-2026`, `paygate-machine-payment-flow`, `paygate-active-testnet`, plus the canonical problem and system flow

#### Archive summary — 114 / 180 characters

- [x] Approve exact wording

> A Stellar testnet gateway that lets API providers charge software agents for individual requests through HTTP 402.

#### Metadata description — 145 / 180 characters

- [x] Approve exact wording

> PayGate case study: Wildan founded and built an active Stellar testnet product for per-request API payments that received a $5,000 SCF Instaward.

#### Case-study opening

- [x] Approve question — 74 / 140 characters

> How can an AI agent pay for one API request without a human checkout flow?

- [x] Approve answer — 147 / 200 characters

> PayGate issues an HTTP 402 challenge, verifies the bound Stellar testnet payment, forwards the request to the protected API, and returns a receipt.

Truth boundary: `active` refers to the verified testnet product state. The copy does not claim mainnet operation, revenue, customer scale, guaranteed delivery, or completion of every future grant milestone.

### Quorum

- Record state: published · full case study · live Stellar testnet hackathon prototype
- Approved role label: **Full-Stack Product Builder**
- Grounding: `quorum-role`, `quorum-six-testnet-flows`, `quorum-settlement-boundary`, `quorum-live-testnet`, plus the canonical problem and system flow

#### Archive summary — 108 / 180 characters

- [x] Approve exact wording

> A Stellar testnet event platform linking wallet-bound passes, collaborator splits, check-in, and withdrawal.

#### Metadata description — 160 / 180 characters

- [x] Approve exact wording

> Quorum case study: Wildan built the full-stack product and Soroban flows for event access and settlement in a collaborative Stellar testnet hackathon prototype.

#### Case-study opening

- [x] Approve question — 94 / 140 characters

> How can event collaborators share access and revenue without relying on manual reconciliation?

- [x] Approve answer — 130 / 200 characters

> Quorum combines wallet-bound passes, on-chain splits, check-in, and withdrawal, while keeping cash-out as a separate tracked step.

Truth boundary: the signed flows are testnet-scoped. The separate cash-out continuation does not claim an evidenced end-to-end MoneyGram pickup, production event use, mainnet readiness, or an independent contract audit.

## Brief archive records

### AgentPay

- Record state: preview · brief record · public independent Stellar testnet prototype
- Approved role label: **Product Builder & Full-Stack Developer**
- Grounding: `agentpay-role`, `agentpay-testnet-prototype`, canonical context, and canonical outcome

#### Archive summary — 98 / 180 characters

- [x] Approve exact wording

> A public Stellar testnet marketplace where software agents discover APIs and pay for each request.

#### Metadata description — 147 / 180 characters

- [x] Approve exact wording

> AgentPay archive: Wildan built the product and full stack for a public Stellar testnet marketplace where software agents discover and pay for APIs.

Truth boundary: this is a public testnet prototype, not a mainnet marketplace, revenue claim, or adoption claim.

### Crucible

- Record state: preview · brief record · collaborative hackathon and testnet prototype
- Approved role label: **Full-Stack & Smart Contract Developer**
- Grounding: `crucible-role`, `crucible-accountability-flow`, canonical context, and canonical outcome

#### Archive summary — 131 / 180 characters

- [x] Approve exact wording

> A hackathon prototype where autonomous agents register, stake on tasks, submit outputs, and carry outcome history into future work.

#### Metadata description — 152 / 180 characters

- [x] Approve exact wording

> Crucible archive: Wildan built the full stack and smart contracts for a collaborative hackathon prototype centered on stake-backed agent accountability.

Truth boundary: this describes implemented hackathon and testnet behavior, not a production protocol, proven economic security model, or adoption claim.

### SpecHeal

- Record state: preview · brief record · collaborative hackathon prototype · second-place team result
- Approved role label: **Product Developer, Full-Stack Developer & AI Integration Lead**
- Grounding: `specheal-role`, `specheal-recovery-flow`, `specheal-refactory-second-place`, canonical context, and canonical outcome

#### Archive summary — 144 / 180 characters

- [x] Approve exact wording

> A hackathon recovery cockpit that turns Playwright failures into controlled patch attempts, reruns, or a clear handoff for genuine product bugs.

#### Metadata description — 139 / 180 characters

- [x] Approve exact wording

> SpecHeal archive: Wildan built the product and full stack and led AI integration on the team that placed second at the Refactory Hackathon.

Truth boundary: the recovery loop and team placement are documented hackathon outcomes. The copy does not claim production adoption or that every proposed patch is safe to merge automatically.

## Final acceptance checklist

The content gate is ready to migrate only when all applicable items are checked:

- [x] All seven archive summaries are approved exactly as written or revised and recounted.
- [x] All seven metadata descriptions are approved exactly as written or revised and recounted.
- [x] All four case-opening questions are approved and end with a question mark.
- [x] All four case-opening answers are approved and remain mechanism-focused.
- [x] Fradium, Nova, PayGate, and Quorum role labels match their canonical records exactly.
- [x] AgentPay, Crucible, and SpecHeal role labels match their canonical records exactly.
- [x] Hackathon and testnet qualifiers remain visible wherever removing them could imply greater maturity.
- [x] No line introduces production scale, adoption, revenue, partnership, certification, security-audit, autonomous-custody, or published-research claims.
- [x] No proposed public-facing line uses `inspect`, `inspectable`, or `inspection`.
- [x] Collaboration credit remains present in project metadata and detailed case content after migration.
- [x] The existing Homepage Atlas question/answer set remains unchanged unless a separate homepage-copy gate is opened.
- [x] Approval is recorded before canonical YAML, schema, DTO, query, route, or component migration begins.

## Post-approval migration boundary

The approved implementation adds explicit editorial fields, updates selectors and DTOs, migrates all seven project records, and removes V4 runtime dependence on `oneLiner`. Validation, query, DTO, metadata, route, and browser tests remain required before release.
