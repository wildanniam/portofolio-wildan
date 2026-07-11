# Flagship Evidence Audit

Internal current-state evidence inventory through 11 July 2026. It supports the portfolio narrative; it is not public-facing copy and does not grade student or hackathon work against a production-company standard. Values explicitly marked uncertain are omitted; consult the source JSON for audit notes.

Wildan's owner attestation is valid provenance for his own roles, leadership, decisions, and private or coordination work. Public artifacts illustrate scope and preserve collaborator credit; they do not veto his account.

Raw source records retain an internal evidence-readiness field for asset planning; it is intentionally omitted from this narrative report and is not a public project rating.

Independent audit records are normalized to stable object/list shapes at this report boundary; the source JSON preserves each researcher's richer raw structure.

## Contents

- [Fradium](#fradium) — An award-winning hackathon project that grew into a publi...
- [Nova AI Wallet](#nova-ai-wallet) — An award-recognized hackathon artifact with a public land...
- [PayGate](#paygate) — An actively shipped Stellar testnet product in a funded $...
- [Quorum](#quorum) — An ambitious hosted Stellar hackathon build demonstrating...

## Fradium

Source record: `fradium.json`

### Project Identity

#### Project Name

Fradium

#### Repository Url

https://github.com/fradiumofficial/fradium

#### Live Urls

-
  - **Label:** Public web application
  - **Url:** https://fradium.io
  - **Verification:** Returned HTTP 200 on 2026-07-11 and is served by the Internet Computer asset canister t4sse-tyaaa-aaaae-qfduq-cai.
-
  - **Label:** Documentation
  - **Url:** https://fradium.gitbook.io/docs
  - **Verification:** Returned HTTP 200 on 2026-07-11.
-
  - **Label:** Two-minute product demo
  - **Url:** https://youtu.be/4Twnw54thms
  - **Verification:** Public YouTube URL linked by the canonical repository README.
-
  - **Label:** Three-minute pitch
  - **Url:** https://youtu.be/OrjROVReH6o
  - **Verification:** Public YouTube URL linked by the canonical repository README.
-
  - **Label:** Beta-testing recap
  - **Url:** https://youtu.be/9H5q75SkUJg
  - **Verification:** Public YouTube URL linked beside the repository's SUS survey material.
-
  - **Label:** Chrome Web Store extension
  - **Url:** https://chromewebstore.google.com/detail/fradium-the-trust-layer-f/bkkhicfomfaagfhnlechfapddmdfabdp
  - **Verification:** Public listing available on 2026-07-11; the listing showed version 1.1.10, an October 23, 2025 update, and four ratings.
-
  - **Label:** DoraHacks build entry
  - **Url:** https://dorahacks.io/buidl/28746
  - **Verification:** Canonical competition entry linked by the repository README; direct automated access is CAPTCHA-protected.

#### Repository State

- **Visibility:** Public and not archived.
- **Default Branch:** main
- **License:** MIT
- **History:** The repository contains 625 commits across four publicly credited code contributors. GitHub credits Wildan with 162 contributions. The repository has 16 public tags and one formal GitHub release, v1.0.0, published on September 2, 2025.
- **Latest Update:** The latest push to main was December 24, 2025, a homepage styling fix. The last concentrated feature work was in October 2025; no 2026 repository activity was visible at the audit date.
- **Maturity Signals:** The source includes a web product, browser extension, multiple ICP canisters, Candid interfaces, model artifacts, tests, architecture material, deployment IDs, release tags, and a tag-triggered extension build workflow.
- **Process Gaps:** There are no open or historical pull requests visible in the canonical repository, no issue history, no monorepo-wide build/test CI, and the latest v1.0.9-production extension workflow run failed. Several earlier extension tag builds succeeded.

#### Product Maturity

An award-winning hackathon project that grew into a publicly accessible beta: the web app is hosted on an ICP asset canister and the extension is published in the Chrome Web Store. It is a strong student-team artifact with a real distribution footprint. The case study should simply contextualize that Bitcoin uses testnet, Ethereum uses Sepolia, Solana uses devnet, only parts of the ICP/SNS surface use mainnet assets, and the visible sprint concluded in December 2025.

### Product Story

#### Problem

Web3 users often decide whether to send funds with little context about the destination address. Wallets and explorers expose balances and transactions, but risk signals, community reports, and chain-specific behavior are fragmented. Fradium attempts to move that intelligence into the transaction path so a user can inspect an address and see a risk verdict before explicitly confirming a send.

#### Intended Users

- **Primary:** Retail crypto users who need a pre-transaction risk check inside a wallet or browser extension.
- **Secondary:**
  - Community reporters and validators who submit evidence, stake tokens, and vote on suspicious addresses.
  - Wallet, dApp, or exchange developers who want address-analysis access through an API surface.
- **Aspirational Only:** The PRD also names regulators and financial institutions, but the repository contains no verified deployment, partnership, or workflow for those users.

#### Value Proposition

Fradium places a combined AI-and-community risk verdict directly before a Web3 transaction. The live implementation connects multi-chain feature extraction to ONNX inference in an Internet Computer canister, checks the result against community reports, and presents the outcome in a web wallet and browser extension before the user proceeds.

#### Canonical Product Flow

- The user signs in with Internet Identity and opens the wallet, extension, or address-analysis screen.
- The user enters a Bitcoin, Ethereum, Solana, or ICP address, or begins a send flow that supplies a destination address.
- The client detects the chain and, in the currently wired web flow, gathers chain data and prepares features through chain-specific JavaScript services.
- The client invokes the Rust AI canister, where an embedded ONNX model produces a chain-specific risk result.
- If the AI result is unsafe, Fradium returns that verdict immediately. If the AI result is safe, the client also queries the Motoko community-report backend; an unsafe community result overrides the AI-safe result.
- Fradium renders the verdict, confidence, analysis source, and scan history. In the send flow, the user can cancel or explicitly confirm the test-network transaction through the wallet canister.
- In a separate community path, authenticated users create evidence-backed reports, stake FRADIUM tokens, vote, and later recover stakes or rewards according to the report outcome.

### Wildan Contribution

#### Verified Role

Wildan confirms that he led Fradium and worked across the full stack; the portfolio role is `Leader & Full-Stack Developer` with owner-attestation provenance. The canonical repository README publicly credits him as Frontend Developer, while commit history visibly captures sustained frontend and product-integration work. That public record is a partial view of his contribution, not a reason to erase leadership, coordination, private work, or responsibilities that were not encoded in Git history.

#### Contribution Evidence

- **Summary:** Wildan is Fradium's owner-attested leader and full-stack developer. The public repository additionally credits him with 162 contributions, with especially visible implementation across the React web client, extension, wallet/product surfaces, and integrations.
- **Inspectable Commits:**
  - f4f40a94 — created the landing-page hero and supporting layout/UI components.
  - 4c5bff4c — implemented the address-analysis result experience.
  - 744f2767 — added the extension AI Analyzer surface and navigation integration.
  - 190dabba — implemented report-creation interaction work.
  - 4708e41c — integrated Transak in the frontend and added integration documentation.
  - 979d4791 — refactored the homepage/product integration and wallet provider wiring.
  - a64a34be — implemented the Fradium Escrow product page.
  - 5b7e82f1 — added the homepage Magic Bento interaction.
- **Broader Scope:** The history also shows sustained work on wallet pages, send/receive modals, transaction and scan history, community reports, product pages, responsive behavior, authentication integration, and extension screens from July through October 2025.
- **Attribution Boundary:** The reviewed public commits do not fully reconstruct how Motoko, Rust wallet, model, planning, coordination, and private work were divided. The case study therefore uses Wildan's owner-attested full-stack/leader role, pairs it with the implementation that is publicly inspectable, and credits the team without pretending Git history is a complete timesheet.

#### Collaborators

- **Repository Readme Team:**
  - Wildan Syukri Niam — Frontend Developer
  - Bintang Al-Fath — Product Developer
  - Ghina Rosvita Maharani — UI/UX Designer
  - Arga Adolf Lumunon — AI Engineer
  - Yazid Al Ghozali — Extension Developer
- **Official Award Team:** Telkom University's award notice lists Wildan Syukri Niam, Indra Mahesa, Muhammad Bintang Al-Fath, Yazid Alghozali, Arga Adolf Lumunon, and Ghina Rosvita Maharanisa as the six-person WCHL Global Finale team: https://bse.telkomuniversity.ac.id/tim-fradium-berhasil-meraih-global-finale-winner-fully-on-chain-track-pada-world-computer-hacker-league-2025/
- **Github Contributors:** The public contributor list credits Gavin Alinski (237), Yazid Al Ghozali (192), Wildan (162), and ArgaAAL (34). Do not infer an identity mapping between Gavin Alinski and a named competition teammate without confirmation.

### Technical System

#### Architecture

- **Client Surfaces:** A React 19 and Vite single-page web application plus a React 18 and Plasmo browser extension. Internet Identity provides user authentication; DFINITY agents call Candid canister interfaces.
- **Decision Path:** Chain-specific client services fetch and transform address data, then call a Rust AI canister. The current web flow uses client-prepared features for Bitcoin, Ethereum, Solana, and ICP, even though some documentation describes more fully on-chain extraction paths. The AI result is composed with a community-report lookup in the Motoko backend.
- **Ai Boundary:** The Rust AI canister embeds ONNX artifacts into its Wasm build and runs tract-onnx inference. Repository metadata defines 66 Bitcoin features, 65 Ethereum features, 120 Solana features, and 41 ICP features.
- **Wallet Boundary:** A Rust wallet canister derives chain accounts from the authenticated principal and uses Internet Computer threshold signing: ECDSA for Bitcoin/Ethereum and Ed25519-compatible signing for Solana. The deployed configuration targets Bitcoin testnet, Ethereum Sepolia, and Solana devnet.
- **Application Backend:** A Motoko actor composes community reporting and staking, analysis history, faucet, ICRC-based escrow, payment links, API tokens/credits, and persistence hooks. Separate ledger/index, LLM/chatbot, wallet, AI, backend, and frontend canister IDs are committed in canister_ids.json.
- **External Integrations:** The product uses chain RPC/data providers, ICRC ledgers, ICPSwap, Transak, Pinata/IPFS, Internet Identity, and a Chrome extension distribution channel.
- **Deployment:** The frontend, backend, AI, wallet, chatbot, LLM, FRADIUM ledger, and FRADIUM index have public ICP canister IDs. The live response includes Internet Computer certificate headers, which is useful deployment evidence.

#### Technology Stack

- **Frontend:**
  - React 19
  - Vite 6
  - React Router 7
  - Tailwind CSS 3
  - Radix UI
  - Framer Motion
  - Motion
  - GSAP
  - JavaScript
- **Extension:**
  - Plasmo
  - React 18
  - TypeScript
  - Chrome Extension APIs
- **Internet Computer:**
  - ICP canisters
  - Motoko
  - Rust
  - Candid
  - DFINITY Agent
  - Internet Identity
  - ICRC-1 and ICRC-2 ledgers
  - threshold ECDSA
  - threshold Ed25519-compatible signing
- **Ai:**
  - ONNX
  - tract-onnx
  - Python
  - scikit-learn
  - chain-specific feature services
- **Web3 Integrations:**
  - Bitcoin integration
  - Alloy and EVM RPC
  - Solana RPC
  - ICPSwap
  - Transak
  - Pinata/IPFS
- **Quality And Delivery:**
  - PocketIC
  - Python unittest
  - GitHub Actions
  - tagged extension builds

#### Standout Engineering Decisions

- Use a conservative composition rule instead of presenting one opaque score: an AI-unsafe result stops the path, while a community-unsafe result can override an AI-safe result.
- Embed model artifacts into the AI canister's Wasm build so model and inference code are deployed as one versioned unit rather than fetched at runtime.
- Keep signing behind a principal-derived Internet Computer wallet canister, while the browser caches public addresses and UI preferences rather than raw private keys.
- Make community intelligence an economic workflow: reports and votes require stake, the backend prevents self-voting and duplicate voting, and outcomes determine reward recovery.
- Expose the same trust idea through several product surfaces—standalone analyzer, wallet send confirmation, browser extension, payment links, and developer API—so the risk signal appears near the action it is meant to influence.
- Separate deployable concerns into frontend, backend, AI, wallet, ledger/index, and chatbot/LLM canisters while keeping interfaces explicit through Candid.

#### Reliability Security Evidence

- **Positive Evidence:**
  - Internet Identity authentication and explicit anonymous-caller rejection are present across wallet, report, paylink, and escrow paths.
  - Wallet sends derive accounts from the caller and use Internet Computer threshold-signature APIs rather than client-held private keys.
  - Delegated wallet sends require an explicit delegate, named scope, and expiration, with grant/revoke/list operations.
  - Community tests cover report creation, voting, stake/reward behavior, duplicate/self/late voting, anonymous rejection, cooldowns, and multi-user isolation.
  - The repository contains 37 PocketIC unittest methods. The README reports 28 passing and 9 intentionally skipped because the comprehensive suite depends on a mock/Wasm artifact; this audit did not independently rerun those results.
  - Motoko modules implement pre-upgrade/post-upgrade persistence, ownership checks, input validation, and some rate limiting.
  - A tag-driven GitHub Actions workflow builds and packages the browser extension; several production-tag runs completed successfully.
- **Blocking Gaps Before Production Claims:**
  - No independent smart-contract, wallet, extension, or application security audit was found.
  - The public Motoko actor exposes testing-only admin mutation methods for report deadline changes and deletion without a caller authorization check.
  - Native BTC/ETH/SOL payment-link completion accepts a supplied transaction hash after only a length check; it does not verify the transaction on-chain.
  - API keys are generated from timestamps and stored as plaintext token values; this is not a production-strength credential design.
  - A tracked .env.local contains explicitly test-only client API values. The repository warns that they are public, but the pattern must not be described as production secret management.
  - There is no whole-repository test/build CI, no frontend or extension automated test suite, and the latest extension production-tag workflow failed.
  - The deployed wallet's Bitcoin, Ethereum, and Solana flows are testnet/devnet configurations.

### Proof And Media

#### Shipped Features

- A public ICP-hosted web application with Internet Identity sign-in.
- A multi-chain wallet surface for Bitcoin, Ethereum, Solana, ICP, FRADIUM, and SNS/ICRC assets, with public-address generation, balances, history, send, and receive flows.
- Address analysis for Bitcoin, Ethereum, Solana, and ICP with chain detection, feature preparation, ONNX-canister inference, community cross-checking, and scan history.
- Risk information inside the transaction confirmation flow, with explicit cancel or confirm controls.
- A published Chrome extension with wallet, analysis, and history surfaces.
- Community report creation, evidence upload, stake-backed voting, report status, and reward/unstake flows.
- Payment-link creation and execution paths for ICRC and native-token modes.
- P2P escrow interfaces and Motoko logic for wrapped-token deposits and release, plus experimental native-token support.
- Developer dashboard, API token management, analysis history, pricing/credits, and documentation routes.
- FRADIUM ledger/index, faucet, ICPSwap integration, Transak on-ramp integration, and an AI assistant/chatbot surface.

#### External Validation

-
  - **Claim:** Global Finale Winner, Fully On-Chain Track, World Computer Hacker League 2025.
  - **Sources:**
    - https://bse.telkomuniversity.ac.id/tim-fradium-berhasil-meraih-global-finale-winner-fully-on-chain-track-pada-world-computer-hacker-league-2025/
    - https://id.linkedin.com/company/disruptives
  - **Notes:** Telkom University names Wildan and the full six-person team; ICP HUB Indonesia publicly describes Fradium as the Fully On-Chain Track winner.
-
  - **Claim:** Public Chrome Web Store distribution.
  - **Sources:**
    - https://chromewebstore.google.com/detail/fradium-the-trust-layer-f/bkkhicfomfaagfhnlechfapddmdfabdp
  - **Notes:** The listing was live at audit time and showed four ratings. Do not turn this into an adoption claim; the visible user count is small and changes over time.
-
  - **Claim:** DoraHacks WCHL project entry and public product demonstrations.
  - **Sources:**
    - https://dorahacks.io/buidl/28746
    - https://youtu.be/4Twnw54thms
    - https://youtu.be/OrjROVReH6o
  - **Notes:** These sources verify public submission and presentation, not production adoption.

#### Repository Proof

- 625-commit public history with Wildan credited for 162 contributions and a clearly inspectable frontend/extension trail.
- A complete recursive tree of 1,068 entries spanning web, extension, Motoko backend, Rust AI/wallet canisters, Candid declarations, model artifacts, scripts, tests, documentation, and media.
- Public canister_ids.json for frontend, backend, AI, wallet, chatbot, LLM, FRADIUM ledger, and FRADIUM index deployments.
- Four chain-specific ONNX artifacts and committed model metadata/scalers; repository metadata includes feature counts and model metrics.
- Five PocketIC test modules with 37 test methods covering community, faucet, staking/rewards, voting, and comprehensive lifecycle scenarios.
- A tag-triggered extension build/release workflow and 16 public version tags.
- Architecture, user-flow, product, extension, AI-evaluation, and beta-survey media under docs/images.
- Modular Motoko and Rust source with explicit Candid boundaries and upgrade persistence hooks.

#### Available Media

-
  - **Group:** repository_media
  - **Items:**
    - docs/images/cover.png and docs/images/features.png at 1920x1080.
    - High-resolution product captures for the landing page, wallet, address analysis, transaction history, community voting, report creation, unstaking, assistant, and extension.
    - Four 512x878 browser-extension screenshots.
    - docs/images/architecture.png and docs/images/userflow.png.
    - AI plots for feature importance, confusion matrix, precision-recall, ROC, and training loss.
    - Five beta-survey screenshots, including a field-of-work chart showing nine responses.
    - A large collection of production UI illustrations and product assets under src/frontend/public/assets.
-
  - **Group:** public_video_and_deck
  - **Items:**
    - Two-minute product demo: https://youtu.be/4Twnw54thms
    - Three-minute pitch: https://youtu.be/OrjROVReH6o
    - Beta-testing recap: https://youtu.be/9H5q75SkUJg
    - Pitch deck linked from the README: https://drive.google.com/file/d/1zp0Tk7d8dlwQd8qBsY3Ovyh9_pbtUC1N/view
-
  - **Group:** external_media
  - **Items:**
    - Chrome Web Store listing screenshots.
    - Telkom University WCHL winner article image, subject to credit and reuse permission.
    - A current tracked reference capture exists at docs/portfolio-v1/flagship-evidence-audit/live-screens/fradium-home-1440x1024.png.
-
  - **Group:** quality_note
  - **Items:** The media volume is strong, but many captures document older UI and terminology. Some images show the former FUM ticker, and one analysis screenshot pairs 'ADDRESS IS NOT SAFE' with copy saying the address appears clean. These should be treated as process evidence, not final hero media.

#### Evidence Gaps

- Record Wildan's owner attestation for `Leader & Full-Stack Developer`, then optionally add planning artifacts, private implementation records, or collaborator notes that make the behind-the-scenes leadership story more visual.
- Record a fresh, stable 12-15 second product loop showing address input, on-chain inference/community composition, the risk verdict, and the pre-send decision. Avoid demo balances or claims that cannot be reproduced.
- Capture a new standardized desktop and mobile screenshot set from the current live build; do not use the inconsistent legacy risk screenshot as primary evidence.
- Redraw the architecture and product-flow diagrams as editable, editorial SVGs. The current diagrams mix outdated FUM terminology, documentation claims that diverge from the wired client flow, and rough visual hierarchy.
- Add one clean commit/diff contact sheet that maps Wildan's verified contributions to visible product outcomes.
- Collect the original WCHL award photo, stage/team photographs, certificate or results page, date/location, photographer credit, and reuse consent from Wildan.
- Provide the raw beta-test questionnaire, anonymized responses, method, respondent profile, and calculated SUS score. Current screenshots establish nine responses but do not establish a complete SUS result.
- Document model dataset provenance, train/test split, class balance, evaluation procedure, and reproducible metrics before presenting AUC/F1 as product-quality evidence. The ICP metadata reports AUC 0.485 and the README itself calls that module experimental.
- Add current canister-status or transaction proof for the exact flows shown in the case study, with secrets and user data removed.
- Resolve or explicitly disclose the unauthenticated admin debug methods, unverified native-payment hashes, timestamp-derived API tokens, and test-network boundaries before making any production-security claim.
- Add a whole-repository CI run and a current test artifact; the existing README test count was not independently reproduced during this audit.

### Portfolio Translation

#### Strongest Portfolio Angle

Tell the story of Wildan leading a student team and building across the stack to turn a complex on-chain trust idea into a usable decision moment: detect the destination, combine AI and community evidence, explain the verdict, and place it immediately before a transaction. The case study can celebrate leadership, full-stack execution, systems integration, and product judgment under hackathon pressure while generously crediting the team members who built Fradium with him.

#### Recommended Headline

Making on-chain risk legible before money moves.

#### Recommended Role Label

Leader & Full-Stack Developer

#### Recommended Evidence Sequence

-
  - **Frame:** 1
  - **Purpose:** Outcome
  - **Evidence:** A fresh current product still or short loop of the wallet's pre-send risk verdict, paired with 'WCHL 2025 Fully On-Chain Track Winner' and an honest 'public beta / test-network flows' status label.
-
  - **Frame:** 2
  - **Purpose:** Problem
  - **Evidence:** A restrained diagram of the missing decision context between pasting an address and confirming a transaction; use sourced risk context only, not generic fear statistics.
-
  - **Frame:** 3
  - **Purpose:** My role and the team
  - **Evidence:** Wildan's owner-attested Leader & Full-Stack Developer role, paired with a selected commit/build contact sheet and generous specialist team credits.
-
  - **Frame:** 4
  - **Purpose:** Product decision
  - **Evidence:** An editable flow showing address detection -> client feature preparation -> ONNX canister inference -> community cross-check -> conservative verdict composition -> scan history.
-
  - **Frame:** 5
  - **Purpose:** System behavior
  - **Evidence:** A side-by-side capture of standalone analysis and the same risk signal inside transaction confirmation, demonstrating that intelligence appears at the decision point.
-
  - **Frame:** 6
  - **Purpose:** Architecture
  - **Evidence:** A clean system plate for web/extension, Internet Identity, client data services, AI canister, Motoko backend, threshold-signature wallet, ledgers, and external providers, with testnet/mainnet boundaries visibly encoded.
-
  - **Frame:** 7
  - **Purpose:** Technical proof
  - **Evidence:** Public canister IDs and certified live response, a PocketIC test excerpt, extension build workflow, and Chrome Web Store listing. Treat repository model metrics as internal artifacts, not independent validation.
-
  - **Frame:** 8
  - **Purpose:** External outcome
  - **Evidence:** The official Telkom University WCHL result, one credited team photograph, the DoraHacks entry, and a factual caption about what the award validated.
-
  - **Frame:** 9
  - **Purpose:** What I would improve next
  - **Evidence:** A concise, constructive look at test-network scope, documentation refresh, hardening opportunities, and what Wildan would build next.

#### Case Study Outline

- Opening — One live product frame, the headline 'Making on-chain risk legible before money moves,' verified role, team, year, award, and public-beta status.
- The decision gap — Explain why an address string and a confirm button are not enough context for a crypto user.
- My role and the team — Establish Wildan as Leader & Full-Stack Developer through owner attestation, show representative visible outcomes, and credit collaborators generously.
- Designing trust before transaction — Explain the key interaction decision to move risk analysis into the send path rather than leave it as a separate tool.
- How a verdict is assembled — Walk through network detection, client feature preparation, ONNX-canister inference, community cross-check, conservative override rules, and history.
- One system, several surfaces — Compare the web analyzer, wallet confirmation, extension, reports, and developer API without turning every feature into an equal card.
- Under the interface — Present the canister architecture, Internet Identity, threshold-signature wallet boundary, ledgers, and explicit testnet/mainnet map.
- Proof under pressure — Show live canisters, repository history, PocketIC tests, extension delivery, beta-testing material, and WCHL recognition.
- Where it stands — Place test-network scope, model evaluation, and hardening opportunities in the context of an ambitious 2025 hackathon/public-beta build.
- What I learned — Reflect on translating probabilistic and community signals into a user decision, and state what Wildan would change before a production security launch.

#### Context And Next Milestones

- Use `Leader & Full-Stack Developer` as Wildan's owner-attested role and credit the rest of the team alongside it.
- Describe the system as a hybrid multi-chain risk-analysis flow: client/external feature preparation feeds on-chain inference rather than forcing a broader `everything is fully on-chain` slogan.
- Present testnet/devnet as the natural boundary of an ambitious hackathon/public-beta build.
- Place payment-link verification, debug admin methods, and developer-token hardening under `What I would improve next` when those details help the engineering story.
- Explain the verdict as decision support: the product warns and still lets the user make the final choice.
- Use model metrics with their repository context and label experimental evaluation honestly.
- Use the Chrome listing and nine-response survey as modest distribution/research signals rather than scale metrics.
- Label the visible build period as the 2025 Fradium sprint and use fresh screenshots instead of legacy FUM or contradictory states.


## Nova AI Wallet

Source record: `nova_ai_wallet.json`

### Project Identity

#### Project Name

Nova AI Wallet

#### Repository Url

https://github.com/OfficialNovaAI/nova-wallet

#### Live Urls

-
  - **Label:** Public product deployment
  - **Url:** https://nova-wallet-puce.vercel.app
  - **Verification:** The landing page returned HTTP 200 on 2026-07-11 and visibly exposed the Nova product, feature grid, wallet connection entry point, and /chat route.
-
  - **Label:** Wallet-gated chat experience
  - **Url:** https://nova-wallet-puce.vercel.app/chat
  - **Verification:** The route returned HTTP 200 and initially rendered a Connect Your Wallet gate on 2026-07-11. In a real browser session, the page later crashed because /api/copilotkit returned HTTP 500 and no CopilotKit agent registered; treat this as a degraded demo, not a working end-to-end product.
-
  - **Label:** Canonical public repository
  - **Url:** https://github.com/OfficialNovaAI/nova-wallet
  - **Verification:** Public, non-archived repository with 82 commits and main as the default branch.
-
  - **Label:** External trade-cost predictor
  - **Url:** https://wildanniam-slippagepredictoronchain.hf.space
  - **Verification:** The /health endpoint returned HTTP 200 on 2026-07-11 and identified a LightGBM model running with ONNX Runtime. A read-only ETH/USDT prediction request also returned HTTP 200 with ranked venue quotes.
-
  - **Label:** Lisk Builders Challenge Round Three program page
  - **Url:** https://lisk-builders-challenge-3.devfolio.co/
  - **Verification:** Public program page confirms the Southeast Asia challenge, Lisk and BlockDevId organizers, four-month build program, January 10, 2026 submission deadline, and January 31 Demo Day.

#### Repository State

- **Visibility:** Public, non-fork, non-archived repository under the OfficialNovaAI organization.
- **Default Branch:** main
- **History:** The repository contains 82 commits, 187 tracked files, 136 TypeScript/TSX files, and roughly 20,445 lines of TypeScript/TSX. GitHub credits Wildan with 56 contributions; local history associates 62 of 82 commits with his verified email or GitHub identity, making him the dominant contributor.
- **Latest Updates:** The last code change was ArgaAAL's Ethereum client update on 2026-01-29. Wildan's two May 2026 commits updated the README and documentation assets; the latest push was 2026-05-04. The gap between the January code freeze and May documentation polish is consistent with a completed hackathon sprint rather than an actively operated product.
- **License And Release State:** GitHub detects no license, there is no LICENSE file, no tags or releases are published, and no GitHub Actions workflows are configured. The repository has zero public stars and forks; those counts are not quality metrics, but they provide no external adoption signal.
- **Quality State:** A clean npm install succeeded but reported 89 dependency vulnerabilities: 10 low, 56 moderate, and 23 high. npm run lint failed with 173 errors and 85 warnings. A local production build compiled and type-checked, then failed while prerendering /_not-found because a dependency attempted to use localStorage on the server.

#### Product Maturity

An award-recognized hackathon artifact with a public landing page, substantial full-stack AI-agent implementation, authentic team and beta-testing media, and a live companion prediction service. It captures a completed sprint and the learning around it. Recorded flows and repository evidence remain the canonical showcase even when the historical chat runtime is unavailable.

### Product Story

#### Problem

Existing crypto wallets expose users to menus, raw addresses, fragmented explorers, unclear execution costs, and payment rails that assume both parties already understand crypto. Nova explores whether one conversational layer can translate intent into wallet reads, on-chain analysis, transaction preparation, and fiat-to-crypto payment workflows while keeping the final wallet signature under the user's control.

#### Intended Users

- **Primary:**
  - Crypto users who already have an EVM wallet but want to ask for balances, transaction preparation, and address activity in natural language.
  - On-chain explorers and traders who want portfolio, whale, counterparty, transaction-statistics, and trade-cost summaries without manually combining several explorers and market tools.
  - Freelancers and creators who want to create a paylink for a client who prefers QRIS, card, or fiat on-ramp payment.
- **Important Boundary:** The current code requires a connected external wallet for the main chat page. It does not create or custody wallet keys, and the current prototype is unsuitable for high-value or production financial use.

#### Value Proposition

Nova turns a natural-language request into an inspectable wallet action or evidence card: identify intent, select a tool, fetch wallet, chain, payment, or market data, render a structured preview, and ask the user to confirm signing in their own wallet. For the portfolio, the strongest promise is not 'an autonomous superwallet'; it is 'a prototype orchestration layer that makes crypto workflows conversational without moving the signing boundary into the AI.'

#### Canonical Product Flow

- The user opens the public landing page, enters /chat, and connects an EVM wallet through RainbowKit and WalletConnect-compatible providers.
- The active chat UI wraps the experience in CopilotKit. Its system instructions map prompts to registered frontend actions such as balance checks, comprehensive address analysis, transaction preparation, trade-cost prediction, and paylink creation.
- For reads and analysis, the action calls a Next.js API route. The blockchain layer selects a chain client, fetches RPC or explorer data, aggregates portfolio, token activity, transaction statistics, whale activity, and counterparties, then returns data for a dedicated generative UI card.
- For a send request, Nova validates the recipient and amount, requests a network switch when needed, and renders a transaction card. Only a separate user click invokes Wagmi sendTransaction, after which the connected wallet owns the signing decision.
- For trade-cost prediction, Nova calls the repository's Next.js proxy to Wildan's Hugging Face service, which currently returns LightGBM/ONNX venue estimates; the UI ranks the returned exchanges in a SlippageCard.
- For Paylink, Nova collects amount, token, network, and recipient wallet; Prisma stores a payment request, Midtrans handles the QRIS side, and Transak is intended to quote or deliver the crypto side. A client-facing /pay/[paymentId] page polls the request state.
- The result is rendered as chat text, a form, a status card, an analysis card, or a transaction preview. Some branches currently fall back to mocks or synthetic completion; these must be visibly separated from real evidence in the case study.

### Wildan Contribution

#### Verified Role

Wildan's role was `Full-Stack & AI Builder`, established through owner attestation and strongly reinforced by repository history. As the top contributor, he worked across the Next.js application, AI agents, CopilotKit and generative UI, transaction preparation, prediction integration, Paylink, rate limiting, deployment fixes, and documentation. Nova remains credited as a team build.

#### Contribution Evidence

- **Commit Ownership:** Wildan is associated with 62 of 82 commits in local history, while GitHub's contributor API credits wildanniam with 56 contributions. He authored the initial commit on 2025-12-21 and both May 2026 documentation updates.
- **Representative Commits:**
  - f12dde6 — feat: build agent
  - 5d1d6b1 — feat: implement CopilotKit UI tools with gpt-4o-mini
  - 64f70e6 — generative UI transaction
  - c8ea690 — generative UI slippage predictor
  - e74e56b — integration payment link
  - 7554425 — Redis and rate-limiting implementation
  - 7febe7d and 5a31020 — Vercel and Prisma build/deployment fixes
  - 22ac379 — generative UI on-chain search
  - 38b03a8 — final documentation and evidence update
- **Authored Surfaces:** Wildan's history repeatedly touches app/chat/page.tsx, app/chat/actions/useNovaActions.tsx, app/api/copilotkit/route.ts, app/api/ai/chat/route.ts, transaction and payment cards, payment services and webhooks, Prisma schema, chain configuration, on-chain routes, tests, README, PRD, and deployment configuration.
- **Public Pull Requests:** Wildan opened and merged agent work through pull requests #2, #3, #5, #7, and #8 in the public repository.

#### Collaborators

- **Summary:** Keep code and award rosters separate. GitHub publicly credits three code contributors: Wildan (wildanniam), Galih Aditya M (galihadityam1), and ArgaAAL. Galih's history is concentrated in chat and landing-page UI redesign work; Arga implemented and hardened the multi-chain intelligence layer and Ethereum/explorer behavior. Telkom University's institutional award report names Wildan, Arga, and Casta Garneta as the Nova team for the recognition. The award photo contains four people, but the fourth person's identity and role were not verified; do not infer that every person pictured was a code contributor or named award-team member. Do not imply that Wildan designed every visual surface or built every blockchain client alone.

### Technical System

#### Architecture

- **Summary:** Nova is a Next.js App Router application deployed on Vercel. The browser uses RainbowKit, Wagmi, Viem, TanStack Query, and a client-only wallet provider. The current /chat path uses CopilotKit with a server runtime at /api/copilotkit backed by OpenAIAdapter and gpt-4o-mini, while most callable tools are registered in the browser so they can render generative UI. A second, manual Gemini/Gemma tool-calling route exists at /api/ai/chat, but the current chat page does not call it. Tool actions invoke Next.js routes for balances, a blockchain orchestrator, payments, and predictions. Chain-specific clients combine EVM RPC reads with explorer-style APIs; aggregators derive portfolio, token activity, transaction statistics, whale, and counterparty views. Transaction execution remains in the connected wallet after a rendered confirmation card. The Paylink subsystem stores PaymentRequest and WebhookLog records in PostgreSQL through Prisma, integrates Midtrans QRIS and Transak staging flows, and serves a polling client payment page. Upstash Redis rate-limits the CopilotKit route. The trade-cost route proxies to a separate Hugging Face LightGBM/ONNX service.

#### Technology Stack

- **Frontend:** Next.js 16.1 App Router, React 19.2, TypeScript 5.9, Tailwind CSS 4, Radix UI/shadcn-style components, Framer Motion, Recharts, Lucide, React Hook Form, Zod, and Axios.
- **Agent And Ai:** CopilotKit 1.49 with OpenAIAdapter/gpt-4o-mini in the active chat runtime; an alternate Google Generative AI Gemma/Gemini route and custom intent parser; generative UI actions and cards; an external LightGBM model served with ONNX Runtime for trade-cost prediction.
- **Web3:** Wagmi 2, Viem 2, RainbowKit 2, WalletConnect, EVM RPC clients, Etherscan/Blockscout-style explorer clients, and configured Ethereum, Lisk, Mantle, Polygon, Optimism, Arbitrum, and Base mainnet/testnet chains.
- **Data And Payments:** Prisma 5, PostgreSQL, Midtrans QRIS, Transak staging and widget flows, Upstash Redis rate limiting, and external price/data sources including CryptoCompare, Moralis, and DeFiLlama fallbacks in chain clients.
- **Verification:** ESLint, a single script-style blockchain integration check, several manual Gemini key/model probes, and manual browser inspection. No CI workflow, unit-test suite, assertion-based integration suite, or end-to-end test harness is present.

#### Standout Engineering Decisions

- Treat Nova as an orchestration layer above existing wallets instead of creating a new custodial wallet. This keeps private keys outside the application and makes the connected wallet the final signing boundary.
- Use generative UI rather than text-only answers. Balance, portfolio, counterparty, whale, payment, slippage, and transaction results become purpose-built cards or forms that users can inspect before acting.
- Register tool actions close to the React presentation layer. That makes action state available to visual cards and enables a form-first fallback when the user's prompt omits transaction or payment parameters.
- Consolidate expensive address research into a comprehensive action that requests portfolio, whale, counterparty, statistics, and token activity in one backend call instead of issuing multiple sequential agent calls.
- Bound analysis windows and add caching, retries, request de-duplication, and multi-chain fallbacks to keep explorer-heavy analysis usable during a hackathon demo.
- Separate transaction preparation from execution: the AI chooses and validates a proposed action, while a user-operated card triggers network switching and wallet confirmation.
- Split Paylink by payer context: Midtrans QRIS for Indonesian payments and Transak for global on-ramp flows. This was ambitious product scope for the challenge, although the current implementation must remain labeled prototype.
- Use an external model service for execution-cost prediction so the web application can consume a separately deployable model through a narrow HTTP contract.
- The demo fallbacks are also an important engineering lesson: preserving a presentation with synthetic data helped the sprint, but mixing simulation into normal execution paths weakened trust. The case study should show the decision, its cost, and the planned replacement with explicit demo fixtures and provenance labels.

#### Reliability Security Evidence

- **Implemented Controls:**
  - User-controlled wallet confirmation for sends; the AI does not hold a private key or sign the transaction.
  - Recipient and amount validation in the send flow, Viem address validation in wallet reads, and supported-chain checks.
  - A sliding-window Upstash rate limiter on the CopilotKit endpoint.
  - Midtrans SHA-512 webhook signature verification and payment-status modeling in Prisma.
  - Caching, exponential backoff, rate-limit handling, and request de-duplication in parts of the on-chain and prediction layers.
  - A blockchain integration script that executed successfully on 2026-07-11 for transaction statistics, portfolio, and token activity, although it returned empty Sepolia data and contains no assertions.
  - The companion prediction service returned a healthy status and a real response during the audit.
- **Material Gaps:**
  - The public /chat experience crashed during browser inspection because /api/copilotkit returned HTTP 500; duplicate action registration warnings appeared before the crash.
  - The repository has no GitHub Actions workflows. ESLint currently fails with 173 errors, and a clean local production build fails during prerendering.
  - npm audit reported 89 dependency vulnerabilities, including 23 high-severity findings; this is a dependency snapshot, not proof that every finding is exploitable.
  - The Transak webhook route accepts plain JSON event bodies when encrypted data is absent and does not independently authenticate that fallback path.
  - Payment creation validates presence but not a bounded amount, currency allowlist, network allowlist, or recipient address. Several payment states auto-complete with randomly generated transaction hashes for demo purposes.
  - Mantle and Lisk chain wrappers inject synthetic reconciliation transactions with random hashes when RPC balance exceeds reconstructed explorer history. Those records can influence derived statistics and must never be presented as authentic on-chain proof.
  - Trade-cost and Transak errors can fall back to hard-coded or mock results in normal UI paths. The UI labels at least one prediction fallback as simulated, but evidence provenance is not consistently enforced across the product.
  - No external security audit, uptime history, monitoring, production incident record, or independently replayable payment transaction evidence was found.

### Proof And Media

#### Shipped Features

- A public responsive marketing site with Nova's AI-wallet positioning, feature overview, and wallet entry point.
- Wallet connection and chain configuration through RainbowKit, Wagmi, Viem, and WalletConnect-compatible EVM wallets.
- A chat-first product shell with CopilotKit system instructions, tool selection, quick actions, and generative UI rendering.
- Native and multi-chain balance reads, portfolio summaries, token activity, transaction statistics, whale analysis, counterparty analysis, and a comprehensive wallet-analysis action.
- Natural-language transaction preparation with network switching, a review card, explicit confirm/cancel controls, and connected-wallet signing.
- A trade execution-cost form and card backed by a currently healthy external LightGBM/ONNX prediction API, plus a documented API guide.
- Paylink creation forms, persisted payment requests, public payment pages, QRIS initiation, Transak staging/widget integration, webhook routes, and status polling. These are technically present but include demo-only completion and quote fallbacks.
- A product PRD, API guide, architecture slides, beta-testing slide, roadmap, award photo, and README implementation index.

#### External Validation

- Telkom University's institutional report at https://bse.telkomuniversity.ac.id/prestasi-tim-nova-ai-di-south-east-asia-lisk-builder-challenge-3/ confirms Nova's 1st Notable Mention and 1st Social Media Challenge recognition and names Wildan, Arga, and Casta Garneta.
- The repository's authentic award photo at https://github.com/OfficialNovaAI/nova-wallet/blob/main/docs/assets/readme/winner.jpg visibly shows the Nova team receiving '1st Notable Mention' with USD 500 and 'Social Media Challenge' with USD 150 at a Lisk x BlockDevId event.
- Casta Garneta's public LinkedIn profile, https://id.linkedin.com/in/castagarneta, lists '1st Notable Mention & Social Media Challenge Winner – Lisk Builders Challenge 3 (Southeast Asia Region)' from BlockDev Indonesia in January 2026.
- The official program page at https://lisk-builders-challenge-3.devfolio.co/ confirms the organizers, Southeast Asia scope, submission process, finalist stage, and January 31, 2026 Demo Day. It does not itself list Nova's award category.
- The repository's beta slide reports seven respondents with scores from 80 to 98 and an average SUS score of 90. This is internal product evidence rather than independent validation because raw questionnaires, recruitment criteria, task scripts, and calculations are not published.
- No verified user count, transaction volume, production partnership, grant, investment, mainnet deployment, or independent customer testimonial was found.

#### Repository Proof

- README.md maps agent capabilities to concrete files and states the bounded product direction, core flows, stack, roadmap, and current polish areas.
- Nova_Wallet_UI_UX_PRD_v2.md contains product problems, user personas, core flows, component requirements, design principles, target metrics, out-of-scope items, and a phased roadmap.
- app/chat/page.tsx and app/chat/actions/useNovaActions.tsx contain the wallet gate, CopilotKit context, 27 registered action definitions, generative cards, transaction confirmation, Paylink, and multi-chain analysis behavior.
- app/api/copilotkit/route.ts, app/api/ai/chat/route.ts, app/lib/intentParser.ts, and app/lib/systemPrompt.ts expose the active and alternate agent paths and their guardrails.
- app/lib/blockchain/orchestrator, clients, aggregators, and app/lib/blockchainAgentWrapper.ts contain the multi-chain data acquisition and analysis implementation, including both useful resilience logic and synthetic reconciliation debt.
- app/lib/services/payment.service.ts, midtrans.service.ts, transak.service.ts, payment/webhook API routes, and prisma/schema.prisma expose the Paylink state machine and provider boundaries.
- test/test-blockchain-integration.ts is an executable smoke script. It ran successfully during the audit but has no assertions and returned zero-transaction data, so it is evidence of a reachable code path rather than correctness coverage.
- api.md documents the external cost-prediction contract; the linked Hugging Face health and prediction endpoints were live during the audit.
- The git history and public pull requests make Wildan's agent, transaction, payment, deployment, and documentation contributions inspectable.

#### Available Media

- docs/assets/readme/winner.jpg — authentic 1280x960 four-person award moment with visible 1st Notable Mention and Social Media Challenge boards; strongest human moment asset.
- docs/assets/readme/solution-overview.png — 1800x1012 product overview slide containing laptop renders of the landing page and chat UI.
- docs/assets/readme/system-architecture.jpeg — 1800x756 architecture drawing covering agent, analysis, wallet, payment, Midtrans, Transak, and market-data layers. It is visually usable as source material but should be redrawn to match the actual code.
- docs/assets/readme/beta-sus-score.png — 1800x1012 beta-testing collage with participant photos, seven SUS bars, average score, and qualitative takeaways. Obtain consent and raw methodology before treating it as research proof.
- docs/assets/readme/how-it-works.png and roadmap.png — 1800x1012 flow and future-roadmap slides. The how-it-works slide includes Health Wallet Score and Hugging Face risk language not confirmed in the current application, so it is not a canonical architecture asset.
- public/landing-page and public/card-assets — hero decoration, product UI renders, feature-card illustrations, and a larger 771x528 chat interface render used by the live landing page.
- public/nova-logo.webp, public/navbar/navbar-icon.png, chain logos, and Paylink background/logo assets — reusable authentic brand and product materials.
- The live landing page itself is a valid source for fresh desktop/mobile captures. No MP4, GIF, narrated walkthrough, silent product loop, exported Figma file, or full-resolution screen-by-screen product screenshot set was found.

#### Evidence Gaps

- Optionally restore the historical CopilotKit runtime; the canonical case study can already use recorded flows, repository evidence, and a curated product reconstruction of the completed sprint.
- Create a sanitized 8–15 second demo loop for one canonical path: prompt → tool selection → generative evidence card → explicit wallet confirmation. Also provide a poster frame and reduced-motion fallback.
- Capture standardized, current screenshots for the welcome state, connected chat, comprehensive address analysis, transaction review, wallet signature, trade-cost card, Paylink creation, and client payment state.
- Redraw the architecture from the current source. Separate active CopilotKit/OpenAI behavior, unused Gemini route, chain analysis, user-signing boundary, predictor service, and prototype payment system. Retire slides that claim unimplemented wallet-health or risk features.
- Separate real, simulated, and aspirational evidence at the data-model level. Remove synthetic reconciliation transactions and random completion hashes from normal runtime paths; keep demo fixtures behind an explicit mode with visible provenance.
- Add assertion-based unit/integration tests, one browser end-to-end happy path, CI gates, a reproducible production build, dependency remediation, and a public status or verification record.
- Harden and document the Transak webhook authentication path, payment input validation, idempotency, reconciliation, and transaction verification before showing Paylink as anything beyond a prototype.
- Publish raw or summarized beta-research methodology: tasks, respondent criteria, consent, anonymization, individual SUS answers, calculation, and findings. Do not rely only on the designed slide.
- Add an official or organizer-hosted award result link if available, plus a named team roster and role attribution. The current photo and teammate profile support the outcome but do not fully document individual responsibilities.
- Add a LICENSE file, release or version record, change history, and a concise reproduction guide with safe example environment variables.
- Obtain real explorer links or sanitized transaction receipts for any on-chain or payment claim selected for the case study.

### Portfolio Translation

#### Strongest Portfolio Angle

Show how Wildan and the Nova team turned one ambiguous sentence into a bounded, inspectable wallet action without giving the agent signing authority. Follow a prompt through intent, tool selection, data, a generative evidence card, and explicit user confirmation. The result is a strong hackathon story about AI-agent UX, Web3 boundaries, rapid full-stack execution, award recognition, and what Wildan learned while building an ambitious prototype under time pressure.

#### Recommended Headline

Turning wallet intent into inspectable actions—without taking over the signature.

#### Recommended Role Label

Full-Stack & AI Builder

#### Recommended Evidence Sequence

- 01 — The friction map: one compact frame showing the menus, explorer tabs, raw addresses, and hidden costs Nova attempted to collapse into a conversation.
- 02 — The build sprint: introduce the Lisk Builders Challenge, the team, Wildan's Full-Stack & AI Builder role, and the external-wallet signing boundary.
- 03 — Prompt becomes plan: animate a real example such as 'Analyze this address' into intent, selected action, chain, and data sources. Use source-derived labels rather than a decorative AI-brain diagram.
- 04 — Agent architecture: show active CopilotKit runtime → frontend action → Next.js route → chain client/aggregator → generative card. Visually mark the alternate Gemini route as experimental or omit it from the primary flow.
- 05 — Evidence card: expand a real comprehensive-analysis card beside sanitized API payload and source files. Never use the synthetic reconciliation path as proof.
- 06 — Human confirmation: show transaction details, network switch, confirm/cancel card, and the connected wallet signature prompt to prove that the user—not the model—authorizes execution.
- 07 — Model boundary: show the live Hugging Face health response and one trade-cost result, clearly distinguishing model output from guaranteed execution price.
- 08 — Ambitious branch: present Paylink as a prototype system map and UI flow, with demo/staging labels and no claim of completed production settlement.
- 09 — External outcome: expand the authentic award photo, exact 1st Notable Mention and Social Media Challenge labels, program context, and a factual caption about what the team shipped.
- 10 — What I would improve next: distinguish recorded, live, and simulated states, then close with the ideas Wildan would carry into the next iteration.

#### Case Study Outline

- Opening — Nova AI Wallet; headline, status 'Lisk Builders Challenge prototype', role label, year, live/repository links, and one authentic product frame.
- Why it existed — the concrete wallet, address, on-chain data, cost, and payment friction; keep the scope to the problems actually represented in code.
- The challenge context — four-month Southeast Asia build program, team and collaborator credits, deadline pressure, and exact award outcome.
- My role and the team — Wildan's Full-Stack & AI Builder ownership across agent tools, generative UI, transaction preparation, Paylink, rate limiting, deployment, and documentation, alongside collaborator credit.
- One canonical flow — prompt → intent/action → live data → evidence card → user confirmation. Use a real address-read or testnet send as the golden walkthrough.
- System anatomy — active AI runtime, browser actions, Next.js routes, multi-chain analysis, external predictor, wallet signing boundary, and payment prototype.
- Engineering decisions — generative UI, comprehensive action, bounded analysis windows, de-duplication, external-wallet custody, and service separation.
- What shipped — current landing, wallet connection, analysis actions, transaction review, predictor integration, and Paylink surfaces, each tagged live, degraded, staging, or simulated.
- Validation — award photo and source, event program, seven-person beta slide with methodology caveat, live predictor response, and repository evidence.
- Where it stands — a completed hackathon artifact whose live, recorded, staging, and simulated states are labeled clearly.
- What I would improve next — explicit evidence provenance, one agent architecture, deterministic fixtures, CI/e2e coverage, verified payment state, and a refreshed media package.
- Archive metadata — collaborators, stack, source links, last verified date, license status, project maturity, and limitations.

#### Context And Next Milestones

- Frame Nova proudly as an award-recognized hackathon artifact rather than a production wallet.
- Use the exact recognition: `1st Notable Mention` and `1st Social Media Challenge`, with the USD 500 and USD 150 boards visible in the authentic team photograph.
- Differentiate live, recorded, staging, and simulated states where it helps a visitor understand the prototype.
- Describe transactions as agent-assisted preparation with explicit connected-wallet confirmation.
- Present Paylink, internal beta results, and architecture material in their hackathon context, and credit Galih, Arga, and the broader team alongside Wildan's Full-Stack & AI Builder role.


## PayGate

Source record: `paygate.json`

### Project Identity

#### Project Name

PayGate

#### Repository Url

https://github.com/wildanniam/paygate-stellar

#### Live Urls

- https://trypaygate.com — verified public deployment; returned HTTP 200 on 2026-07-11.
- https://paygate-stellar.vercel.app — verified deployment alias; redirects to https://trypaygate.com/.
- https://github.com/wildanniam/paygate-stellar/tree/main/docs — public product, developer, technical, demo, and evidence documentation.
- https://stellar.expert/explorer/testnet/contract/CC3EERTU5TQOZ3E53NHYNNLCE4MCYMP6NT2LUV6OWSCZHM6V3L62MIEM — public testnet escrow contract referenced by the repository evidence package.
- https://x.com/Indo_Stellar/status/2075550378553421994 — Stellar Indonesia announcement congratulating PayGate and repeating the $5K Instaward announcement.
- https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules — official SCF Instawards program rules.

#### Repository State

- **Summary:** Public, non-archived repository with default branch `main`. GitHub records creation on 2026-04-24 and the latest push on 2026-06-28. The history contains 127 commits: GitHub attributes 126 to Wildan (`wildanniam`) and one to `ArgaAAL`. There are no published releases or tags, no open issues, and no pull requests in the public history. The latest security workflow on `main` passed. GitHub does not detect a license and the tree has no `LICENSE` file, although the README says MIT; the portfolio should describe the source as public rather than claiming a verified open-source license until a license file is added. Sources: https://github.com/wildanniam/paygate-stellar, https://github.com/wildanniam/paygate-stellar/commits/main, and https://github.com/wildanniam/paygate-stellar/actions/runs/28339613487.

#### Product Maturity

An actively shipped Stellar testnet product in a funded $5,000 SCF Instaward execution sprint. Its public application, wallet authentication, protected-upstream API routes, deterministic smoke coverage, and real testnet payment, escrow-credit, and withdrawal transactions provide working evidence. Mainnet and production customer operations remain later milestones.

### Product Story

#### Problem

API monetization normally assumes a human buyer who creates an account, chooses a subscription, enters a card, and manages recurring billing. That interaction is a poor fit for AI agents and other machine clients that need to request a resource, receive a machine-readable price challenge, pay for that single request, retry with proof, and receive JSON. An API owner would otherwise need to build payment verification, replay protection, upstream access control, revenue accounting, settlement, and withdrawal infrastructure independently.

#### Intended Users

- **Summary:** The provider-facing product is for indie API builders, startup API owners, and backend developers who already operate useful GET/JSON endpoints and want per-call monetization. The buyer side is designed for AI agents, applications, and machine clients capable of responding to an HTTP 402 challenge with Stellar MPP payment credentials. Current scope excludes human checkout, buyer accounts, subscriptions, POST/body forwarding, and non-Stellar payment methods.

#### Value Proposition

PayGate turns an ordinary API URL into a testnet pay-per-call endpoint: it issues an HTTP 402 payment challenge, verifies a Stellar MPP payment, credits a Soroban escrow ledger, forwards the paid request to a secret-protected upstream, and exposes request, transaction, fee, revenue, and withdrawal evidence to the API owner. The strongest truthful promise is not generic 'API monetization'; it is an inspectable machine-payment lifecycle with explicit failure and proof states.

#### Canonical Product Flow

- 1) The developer connects Freighter and signs a wallet-auth challenge. 2) The developer registers an upstream base URL, GET path, name, and USDC price. 3) PayGate creates a paid proxy URL and an encrypted `X-PayGate-Secret`, with the endpoint initially `pending_setup`. 4) The developer installs the secret guard; PayGate tests both an invalid secret and the real secret before activating the endpoint. 5) An agent calls `/api/pay/:apiId` without payment and receives HTTP 402 plus request/payment identifiers. 6) The agent pays testnet USDC through Stellar MPP and retries with the credential. 7) PayGate binds the credential to the original API and payment ID, verifies amount/currency/recipient, records the transaction, prevents replay, and invokes the Soroban escrow credit. 8) PayGate decrypts the upstream secret and forwards the GET request. 9) A successful upstream response is returned with `Payment-Receipt`; failures remain explicitly retryable without creating a second payment. 10) The dashboard exposes calls, payment and credit hashes, the 90/10 revenue split, and balances; the developer signs withdrawal XDR in Freighter, so the backend does not receive the developer secret key.

### Wildan Contribution

#### Verified Role

Wildan is PayGate's `Founder & Full-Stack Developer`. This is supported by his owner attestation, Stellar Indonesia's public founder reference, and dominant repository ownership—126 of 127 commits—across the product UI, APIs, payment proxy, data layer, Soroban contract, security hardening, tests, and deployment. ArgaAAL remains credited for a beta-hardening contribution.

#### Contribution Evidence

- **Summary:** Concrete ownership evidence includes: repository ownership under `wildanniam`; 126 of 127 commits attributed by GitHub to Wildan; the initial commit on 2026-04-24 and the latest security/deployment commits on 2026-06-28 authored by Wildan; substantial modules such as `api/pay/[apiId].js`, `api/apis/[apiId]/verify.js`, `server/lib/upstreamSecurity.js`, `server/lib/apiSecret.js`, `server/lib/rateLimit.js`, `contracts/contracts/paygate-escrow/src/lib.rs`, the React pages, Supabase migrations, smoke scripts, and evidence records; and the current public deployment. Representative commits: https://github.com/wildanniam/paygate-stellar/commit/69fe93085c5816e3943cb4e16846ab231c50f1da, https://github.com/wildanniam/paygate-stellar/commit/219461fe75f1929fd537109bb7b96bbe280375b3, and https://github.com/wildanniam/paygate-stellar/commits/main.

#### Collaborators

- **Summary:** GitHub lists one additional contributor, `ArgaAAL`, with one commit: `feat: harden PayGate V1 testnet beta` on 2026-06-06 (https://github.com/wildanniam/paygate-stellar/commit/100d915a9fc7e97b3b3bab3879d5c409f637bb8f). That commit touched beta auth persistence, documentation, dependency hygiene, and removal of generated frontend artifacts. No public team roster or broader collaborator attribution was found. Portfolio copy should credit Arga if the case study discusses that hardening phase, and should avoid 'built entirely alone.'

### Technical System

#### Architecture

- **Summary:** The browser is a React/Vite SPA deployed by Vercel. API owners authenticate by signing a challenge with Freighter; PayGate exchanges it for an HMAC-signed, HTTP-only session cookie and stores atomic challenge state in Supabase. The API registry stores lifecycle state and AES-256-GCM-encrypted upstream secrets in Supabase Postgres. Public machine clients call a Vercel Function paid proxy, which creates a durable proxy-request/payment ID, uses `@stellar/mpp` plus `mppx` to issue or verify a Stellar testnet USDC charge, persists replay protection and payment state, and invokes an admin-authorized Soroban escrow contract to split the ledger 90% to the developer and 10% to PayGate. The proxy then validates the upstream URL, injects the decrypted secret, forwards a bounded GET request, and records success or retryable failure. Dashboard functions aggregate APIs, proxy requests, payments, escrow balances, and withdrawals. Withdrawal is a prepared Soroban transaction signed by the developer in Freighter and validated against a stored transaction hash before submission. The legacy Express code generator remains isolated from the primary V1 flow.

#### Technology Stack

- **Summary:** Frontend: React 18, React Router 6, Vite 7, Tailwind CSS 3, GSAP 3 with `@gsap/react`, lucide-react, DM Sans, and JetBrains Mono. Server/API: Node.js 22+ ESM, Vercel Functions, a legacy Express 5 generator, Zod validation, and native Web APIs. Data/infrastructure: Supabase Postgres, SQL migrations with RLS enabled, Vercel deployment, Upstash Redis rate limiting, GitHub Actions. Payments/Web3: `@stellar/mpp`, `mppx`, Stellar SDK 15, testnet USDC, Freighter, and a Rust Soroban escrow contract. Quality/evidence: custom Node smoke scripts, Playwright browser smoke coverage, Cargo contract tests, dependency audit, secret scan, OpenSpec capability specifications, and timestamped evidence documents.

#### Standout Engineering Decisions

- Treat API activation as a proof step: the verifier first sends an invalid secret and requires rejection, then sends the real secret and requires success. This prevents a public upstream from being incorrectly labeled protected.
- Bind one machine payment across boundaries with a PayGate payment ID carried as the MPP external ID, unique database constraints for payment IDs and transaction hashes, and a persistent MPP replay store.
- Keep developer custody at withdrawal: PayGate prepares and records the intended transaction, Freighter signs it, and the server checks wallet source and expected transaction hash before submitting it.
- Model paid-but-undelivered requests as retryable evidence states instead of charging again. A recorded credential may retry only until the request reaches `forwarded`; automatic refunds remain an explicit unresolved product decision.
- Use an escrow contract as the MPP recipient, then separately credit an idempotent developer/platform ledger. This makes the 90/10 split and withdrawals inspectable, while also exposing a reconciliation boundary the case study should discuss honestly.
- Harden developer-supplied upstream URLs at registration and execution time: production HTTPS, DNS/IP blocking for private and metadata ranges, manual redirects, timeout, and response-size limits.
- Preserve a simple commercial product surface while placing detailed proof in receipts, transaction hashes, request states, tests, and evidence documents rather than relying on marketing claims.

#### Reliability Security Evidence

- **Summary:** The strongest automated proof is GitHub Actions run https://github.com/wildanniam/paygate-stellar/actions/runs/28339613487 on commit `69fe9308`, where Beta smoke tests, secret scan, and production dependency audit all completed successfully. `npm run test:beta` composes auth, registry, setup verification, reset, protected upstream, unpaid and paid proxy, full demo flow, dashboard, withdrawal, SSRF/security smoke, frontend build, Cargo tests, and diff checks. The repository includes contract tests for fee splitting, duplicate-payment rejection, developer withdrawal, and platform-fee withdrawal. Security controls include AES-256-GCM API-secret encryption, atomic expiring auth challenges, HMAC session tokens, same-origin checks for writes, unique payment/transaction constraints, persistent replay protection, Upstash-backed rate limits, SSRF/DNS defenses, manual redirect handling, input and response limits, security headers, transaction-intent binding for withdrawals, and CI secret/dependency scans. The security audit is self-authored, so it should be presented as documented hardening, not an independent audit. Residual items are explicit: strict CSP tuning, manually published Vercel WAF, production alerting/audit logs, automatic reconciliation, and refund policy.

### Proof And Media

#### Shipped Features

- Public marketing site and responsive React product shell at https://trypaygate.com.
- Freighter wallet challenge/login, persistent auth challenges, and authenticated API-owner sessions.
- API registration with price, generated paid proxy URL, encrypted upstream secret, pending/active/archived lifecycle, duplicate live-endpoint prevention, archive/delete reset behavior, and two-sided setup verification.
- Unpaid HTTP 402 challenge and paid Stellar MPP retry for GET/JSON APIs.
- Persistent request, payment, replay, payment-transaction, and contract-credit records.
- Soroban escrow with idempotent credit, 90/10 developer/platform ledger split, developer withdrawal, and platform-fee withdrawal.
- Dashboard views for overview, endpoints, calls, payment history, revenue, fee, withdrawable balance, request states, and withdrawal history.
- Secret-protected upstream forwarding with query propagation, SSRF defenses, timeout, redirect rejection, and bounded responses.
- Example paid Express API/client, developer guide, OpenSpec specs, security report, smoke tests, visual QA baselines, and CI gates.

#### External Validation

- PayGate was awarded a $5,000 SCF Instaward. Stellar Indonesia publicly congratulated the team on 2026-07-10 and repeated PayGate's announcement that it was awarded $5K through Instawards: https://x.com/Indo_Stellar/status/2075550378553421994. The official rules describe Instawards as time-bound execution funding and state that most accepted initial awards range from $1,000 to $5,000 paid in XLM: https://stellar.gitbook.io/scf-handbook/scf-awards/instawards/official-rules. Stellar testnet proof is also publicly inspectable: Horizon confirms successful transfer, `credit_payment`, developer `withdraw`, and `withdraw_platform_fee` transactions referenced by the repository. The live custom domain and Vercel deployment are public. Present these as grant, build, deployment, and testnet execution validation; customer scale and mainnet remain later milestones.

#### Repository Proof

- `README.md` and `PRODUCT.md`: bounded product statement, canonical flow, architecture, status matrix, API surface, roadmap, and anti-hype positioning.
- `api/pay/[apiId].js`: the actual 402/credential verification, payment recording, escrow credit, retry-state, protected forwarding, and receipt implementation.
- `api/apis/[apiId]/verify.js`: invalid-secret and valid-secret activation probes.
- `contracts/contracts/paygate-escrow/src/lib.rs` and `test.rs`: idempotent credit, 90/10 ledger, events, balances, and withdrawal tests.
- `supabase/migrations/*`: persistent auth, API lifecycle, unique live endpoints, proxy requests, payments, replay store, withdrawals, and prepared-transaction state.
- `SECURITY_AUDIT.md`, `server/lib/upstreamSecurity.js`, `server/lib/rateLimit.js`, and `.github/workflows/paygate-security.yml`: traceable findings, patches, and CI gates.
- `docs/evidence/PAYGATE_V1_PHASE1_SETTLEMENT_PROOF.md` and `PAYGATE_V1_PHASE6_PAID_PROXY_PROOF.md`: testnet addresses, commands, transaction hashes, and bounded remaining work.
- `scripts/phase*.mjs`, `scripts/browser-smoke.mjs`, `scripts/secret-scan.mjs`, and successful Actions run 28339613487: executable verification rather than documentation alone.
- `openspec/specs/*`: explicit capability requirements for registry, wallet auth, paid proxy, escrow, generated middleware, monitoring, and frontend behavior.

#### Available Media

- Current landing evidence in `docs/evidence/ui/landing-audit-2026-06-28/`, including desktop/mobile hero, full-page, mechanism, protected-call, receipt-proof, workspace, feature, CTA, and mobile-navigation captures. The live 1440x900 hero visually matched the latest audit capture on 2026-07-11.
- Authenticated product UI captures in `docs/evidence/ui/app-final/`: dashboard desktop/mobile, create form, create success, unauthenticated dashboard, and pending endpoint detail.
- A large dashboard visual baseline in `docs/evidence/ui/dashboard-v2/dashboard-v2-visual-baseline.png` and earlier phase-by-phase baselines under `docs/evidence/ui/` for showing iteration.
- Interactive hero states in `output/playwright/paygate-hero-interactive-*.png`, useful as motion storyboard references rather than as the final product state.
- Original SVG brand assets in `frontend/public/brand/`: mark, wordmark, avatar, API, chart, code, and signal illustrations, plus `frontend/public/favicon.svg`.
- Mermaid sequence and flow diagrams in `README.md`, plus detailed system descriptions and public testnet addresses in the evidence documents.
- Stellar Indonesia's public $5K Instaward announcement and the embedded PayGate founder video at https://x.com/Indo_Stellar/status/2075550378553421994; capture an approved still and preserve the source link.
- No finished demo video was found. Screenshot dashboards use controlled demonstration data and placeholder transaction strings; captions must label them as product/UI evidence, not as real customer metrics. Any secret-like value in registration screenshots should be visibly redacted before portfolio use.

#### Evidence Gaps

- Complete and capture the deployed end-to-end replay on `trypaygate.com`: authenticated API registration, direct upstream 401, proxy 402, real paid 200, payment and credit explorer links, dashboard update, and withdrawal. The repository's beta-readiness deployment slots are still `TBD`.
- Record one concise, silent 8–15 second demo loop and a longer optional technical walkthrough. There is currently no finished product video.
- Export a portfolio-grade architecture diagram and a request-state diagram; the Mermaid source is accurate but not yet a polished visual asset.
- Add public docs routing or link the navigation directly to GitHub docs; `https://trypaygate.com/docs` returned 404 on 2026-07-11.
- Add a real `LICENSE` file if MIT is intended, because GitHub currently detects no license despite the README statement.
- Turn the verified $5K SCF Instaward announcement and founder video into a durable, credited evidence frame; continue gathering beta-user or usage evidence as the active sprint progresses.
- Capture real sanitized request receipts and dashboard data from the deployed replay; current UI baselines contain demonstration data and placeholder hashes.
- Document authorship and collaborator credit explicitly, including Arga's beta-hardening contribution.
- Resolve or frame the product's payment-before-delivery boundary: no automatic refund, no retry worker/TTL policy, and no mainnet/compliance readiness.

### Portfolio Translation

#### Strongest Portfolio Angle

Follow one machine-paid API request across every trust boundary. Start with a normal API, issue a 402 challenge, bind the agent's payment to one request, prove the Stellar transfer and contract credit, forward through the secret guard, and expose the operational ledger. Then show how paid-but-undelivered becomes an explicit recoverable state. Combined with the $5K SCF Instaward and Wildan's founder story, PayGate becomes a strong case study about product judgment, distributed-state reliability, Web3 integration, and security hardening.

#### Recommended Headline

Turning ordinary APIs into machine-paid endpoints on Stellar testnet.

#### Recommended Role Label

Founder & Full-Stack Developer

#### Recommended Evidence Sequence

- 01 — Founder momentum: open with Wildan's founder video, the Stellar Indonesia announcement, and the verified $5K SCF Instaward.
- 02 — Constraint: contrast human subscription onboarding with the machine-native `request → 402 → pay → retry → JSON` loop.
- 03 — Transformation: use the current landing mechanism visual to show source API → PayGate → paid endpoint, while clearly labeling testnet USDC.
- 04 — Provider setup: show the registration UI, generated proxy/secret, and `pending_setup`; redact the displayed secret.
- 05 — Protection decision: animate the two verification probes—invalid secret must fail, valid secret must succeed—then reveal the active endpoint.
- 06 — Real paid request: pair the HTTP 402/200 states with the successful MPP transfer and `credit_payment` transaction links verified on Stellar testnet.
- 07 — Settlement internals: show the Soroban contract's idempotent payment ID, 90/10 split, and developer-signed withdrawal path.
- 08 — Operational proof: expand into the dashboard ledger for calls, payment tx, credit tx, revenue, fees, request state, and withdrawal; label sample UI numbers as demo data.
- 09 — Hardening record: present an issue-to-control strip for SSRF, upstream guard, replay, rate limiting, response limits, transaction-intent binding, secret scan, and the passing CI run.
- 10 — What shipped / what comes next: close with the active testnet product, Instaward sprint, current boundaries, and the next product milestones.

#### Case Study Outline

- Opening — one sentence, Founder & Full-Stack Developer role, active testnet product status, verified $5K SCF Instaward, live/GitHub links, and one real product frame.
- The buyer changed — explain why an AI agent cannot be treated like a subscription customer.
- The contract of the interaction — define 402, MPP credential, one payment ID, one API request, and one observable outcome.
- Protecting the original API — show secret generation, encrypted storage, negative/positive setup probes, activation lifecycle, and duplicate endpoint prevention.
- Crossing the payment boundary — trace MPP verification, persistent replay protection, unique tx/payment records, and the two public testnet transactions.
- Accounting without taking the developer key — explain escrow credit, 90/10 ledger, Freighter-signed withdrawal, and prepared-transaction hash binding.
- Designing for failure — visualize `challenge_sent`, `payment_verified`, `credit_pending`, `credited`, `upstream_failed`, `forwarded`, and retry behavior; discuss why refund policy remains unresolved.
- Operating the system — use dashboard frames and receipts to show observability, not fabricated traction.
- Hardening pass — pair the self-audit findings with code patches, smoke tests, contract tests, secret scan, dependency audit, and the green CI run.
- What shipped / what comes next — connect the live site, tests, chain transactions, code, and Instaward sprint to the next milestones around customers, mainnet, audit, and deployed replay.
- What I would improve next — deployed evidence replay, demo loop, refund/reconciliation policy, structured audit logs/alerts, CSP/WAF, POST support, and mainnet review.

#### Context And Next Milestones

- Present PayGate as an active Stellar testnet product, founded and built by Wildan, and a verified $5K SCF Instaward recipient. Current proof covers live deployment, wallet-authenticated provider flows, testnet payment, escrow, withdrawal, security hardening, and CI. Mainnet, production customer scale, automatic refunds/retry workers, and independent security certification remain future milestones. Label dashboard demonstration data as demo data and explain the backend ledger-credit step accurately.


## Quorum

Source record: `quorum.json`

### Project Identity

#### Project Name

Quorum

#### Repository Url

https://github.com/wildanniam/Quorum

#### Live Urls

- https://quorum-sandy-eight.vercel.app — verified public Vercel deployment; the homepage returned HTTP 200 on 2026-07-11.
- https://quorum-sandy-eight.vercel.app/discover — verified public product route; returned HTTP 200 on 2026-07-11.
- https://quorum-sandy-eight.vercel.app/evidence — verified public evidence route; returned HTTP 200 but currently displayed zero proof rows and a database-connection failure on 2026-07-11.
- https://quorum-sandy-eight.vercel.app/api/contracts/status — verified public runtime status endpoint; reported Stellar TESTNET, live proof mode, configured core/pass/USDC contract IDs, all four contract actions as `live_required`, and a reachable RPC on 2026-07-11.
- https://quorum-sandy-eight.vercel.app/.well-known/stellar.toml — verified hosted Stellar client-domain document with Quorum's testnet signing key; returned HTTP 200 and CORS headers on 2026-07-11.
- https://stellar.expert/explorer/testnet/contract/CBZ7FTHKJ4BEGETYWNUN4RFMSJJ47Y6YJQGXIRVU4WXCFNP33V63IFBV — public QuorumCore testnet contract.
- https://stellar.expert/explorer/testnet/contract/CAQ44PH2OXYIAJVRYUB57VRL7MG3UUBKVHKN3LIUSNOLLIKGYKCJ7HIH — public QuorumPassNFT testnet contract.
- https://github.com/wildanniam/Quorum/tree/main/docs — public product, readiness, testnet-evidence, browser-QA, MoneyGram, and deployment documentation.

#### Repository State

- **Summary:** Public, non-archived repository with default branch `main`. GitHub records creation on 2026-06-08 and the latest push on 2026-07-11. `main` contains 248 commits: 232 are attributed to Wildan's two author identities and 16 to `ArgaAAL`. The latest meaningful update is merged PR #28, which corrected the MoneyGram cash-out accounting boundary and added migration `0005_anchor_cashout_proof.sql`. The latest GitHub Actions run on `main` passed lint and build: https://github.com/wildanniam/Quorum/actions/runs/29137241778. The repository has no published releases or tags, no detected license or `LICENSE` file, and no current open issue/PR. Its maturity signals are unusually substantive for a one-month repository—two Rust contracts, five SQL migrations, 248 commits, issue/PR history, testnet transaction evidence, smoke scripts, generated QA docs, and a hosted app—but release governance and licensing are not yet formalized.

#### Product Maturity

An ambitious hosted Stellar hackathon build demonstrating end-to-end product and systems thinking across event creation, checkout, passes, split settlement, evidence, and payout continuation. Two Soroban contracts are deployed and six signed testnet flows were confirmed through Horizon. The hosted evidence feed and final MoneyGram pickup are clear next iterations rather than prerequisites for showcasing the completed build.

### Product Story

#### Problem

Paid community events often involve an organizer, speaker, venue, community, sponsor, or partner, but ticket revenue is commonly collected by one host and reconciled manually through spreadsheets, screenshots, and follow-up transfers. Attendees also need access proof, resources, and check-in, while collaborators need a shared settlement record and a defensible path from event revenue to their own wallet or an off-ramp. The system problem is therefore not generic ticketing; it is keeping event access, multi-party accounting, on-chain settlement, evidence, and payout state consistent across several trust boundaries.

#### Intended Users

- **Summary:** Primary users are Web3 community organizers creating paid or free meetups, workshops, cohorts, side events, webinars, and resource access; attendees buying or claiming a wallet-bound pass and unlocking resources; and collaborators such as speakers or partners who need a transparent share, balance, withdrawal proof, and optional MoneyGram cash-out path. Hackathon judges and public reviewers are a secondary audience for the evidence hub. Current scope assumes Stellar-compatible wallets and does not serve mainstream card/email checkout users.

#### Value Proposition

Quorum gives collaborative Web3 events one inspectable path from event setup to access and settlement: an organizer locks a collaborator split, an attendee buys or claims a non-transferable pass, the Soroban system credits verifiable collaborator balances, and the app exposes passes, check-in, event proof, a collaborator ledger, withdrawal evidence, and a MoneyGram-compatible cash-out continuation. The precise promise is `verifiable multi-party event settlement and access on Stellar testnet`; do not repeat the landing page's stronger implication that every purchase instantly transfers funds into every collaborator wallet, because the contract first credits internal balances and each collaborator withdraws separately.

#### Canonical Product Flow

- 1) An organizer connects Freighter and authenticates through a signed wallet challenge. 2) The organizer creates a draft event with story, schedule, capacity, paid/free mode, gated resources, and collaborator percentages totaling 100%. 3) Publishing prepares a QuorumCore `create_event` action; in live mode the browser preflights the transaction, validates the expected source/contract/function/arguments, obtains explicit Freighter signing, submits signed XDR, polls finality, and persists the verified result. 4) An attendee discovers the event and either pays the exact testnet USDC amount or claims a free pass. 5) QuorumCore enforces capacity and one-pass-per-wallet, transfers paid funds into contract escrow, credits collaborator/platform balances, invokes QuorumPassNFT to mint a unique non-transferable pass, and emits proof events. 6) The pass unlocks the resource page; an organizer can verify its QR/token and record on-chain check-in. 7) The indexer reads Quorum contract events from Stellar RPC into Postgres, while event proof, the global evidence hub, pass receipt, and collaborator ledger expose the relevant evidence with explorer links. 8) A collaborator explicitly withdraws the credited contract balance to the collaborator wallet. 9) Only after that confirmed settlement can the collaborator initiate a linked MoneyGram SEP-24 cash-out; Quorum separates the contract-to-wallet transaction from the later wallet-to-MoneyGram transfer, validates the transfer instructions, and syncs anchor state. The final USDC transfer and pickup/KYC completion remain manual and not fully evidenced end to end.

### Wildan Contribution

#### Verified Role

Wildan's role was `Full-Stack Product Builder`, established through owner attestation and reinforced by dominant repository ownership. He authored work across product specification, the Next.js application, Soroban contracts, deployment tooling, wallet transaction boundaries, database and evidence systems, MoneyGram integration, QA, and the settlement/cash-out correction. ArgaAAL remains credited for substantive infrastructure and evidence contributions.

#### Contribution Evidence

- **Summary:** Concrete evidence includes repository ownership under `wildanniam`; 232/248 commits on `main`; Wildan-authored product/spec documents (`TECHNICAL_SPEC.md`, `DEVELOPMENT_PLAN.md`, `DESIGN.md`); substantial modules across `src/app`, `src/lib/stellar`, `src/lib/anchor`, `src/lib/evidence`, `src/lib/ledger`, `contracts/quorum_core`, `contracts/quorum_pass_nft`, `scripts`, and the SQL migrations; and Wildan-authored issues/PRs that document decisions and verification. The clearest recent ownership artifact is issue #27 and PR #28: Wildan identified that contract withdrawal and MoneyGram cash-out were conflated, changed the data model and flow so cash-out consumes an already confirmed settlement without creating a second event debit, added fail-safe validation and retry semantics, and verified the change across smoke, live-evidence, browser, lint, and build checks. Sources: https://github.com/wildanniam/Quorum/issues/27, https://github.com/wildanniam/Quorum/pull/28, https://github.com/wildanniam/Quorum/commits/main, and https://github.com/wildanniam/Quorum/commit/05664180d9edad19186c1072fa1265205983fef6.

#### Collaborators

- **Summary:** GitHub identifies `ArgaAAL` as the second contributor with 16 commits. Publicly inspectable work includes migration from SQLite to server-side Postgres/Supabase, deployment handoff material, the custom Soroban event indexer, global/event evidence surfaces, collaborator ledger, wallet/RPC fixes, live testnet flow evidence, and browser/live-policy isolation. Two representative merged pull requests are https://github.com/wildanniam/Quorum/pull/1 and https://github.com/wildanniam/Quorum/pull/2. Portfolio credits should name Arga for that infrastructure/evidence phase or use `Built with ArgaAAL` in the project metadata. No broader team roster was found.

### Technical System

#### Architecture

- **Summary:** The product is a Next.js App Router application deployed on Vercel. React server/client surfaces cover landing, discover, event detail, checkout, resources, passes, QR check-in, Studio, collaborator ledger, and evidence. Wallet identity uses a Freighter-first signed challenge and cookie-backed session. Server routes read/write a server-only Postgres/Supabase database for event metadata, collaborators, resources, local/live proof identity, indexed contract events, withdrawals, and anchor-payout state; browser Supabase credentials are intentionally absent. Two Rust/Soroban contracts separate settlement from the pass collection: QuorumCore owns event parameters, USDC escrow transfer, basis-point split balances, purchase/claim uniqueness, collaborator withdrawals, platform-fee accounting, check-in state, and events; QuorumPassNFT allows only the configured core contract to mint, stores one unique owner/event pass, marks check-in, and always rejects transfer. Live actions cross an explicit trust pipeline: derive deterministic arguments → RPC preflight/simulation and XDR assembly → browser-side metadata/XDR validation → Freighter signing → server-side signed-XDR source/contract/function/argument validation → RPC submission/finality polling → decoded-result persistence with global proof-hash replay protection. A custom idempotent indexer polls `getEvents`, maintains cursor/latest-ledger state, and feeds public/event evidence and the collaborator ledger; Vercel Cron schedules it daily. After a contract withdrawal, an anchor provider boundary supports MoneyGram SEP-1 discovery, SEP-10 wallet authentication, SEP-24 withdrawal initiation and status sync, while preserving separate settlement and cash-out proof records.

#### Technology Stack

- **Summary:** Frontend/product: Next.js 16.2.7, React 19.2.4, TypeScript 5, Tailwind CSS 4, GSAP 3 with `@gsap/react`, Motion 12, Embla Carousel, Lucide React, QRCode, Outfit/Geist typography, and responsive/reduced-motion styling. Backend/data: Next.js route handlers, Node.js 22+, `pg`, server-side Supabase Postgres, five SQL migrations, Zod, HMAC/cookie session logic, Vercel, and Vercel Cron. Stellar/Web3: `@stellar/stellar-sdk` 16, `@stellar/freighter-api` 6, Stellar testnet RPC/Horizon, testnet USDC, Rust 2021, Soroban SDK 25, Stellar CLI, custom QuorumCore and QuorumPassNFT WASM contracts, deterministic XDR preparation/validation, and a Soroban event indexer. Anchor/off-ramp: MoneyGram-compatible SEP-1, SEP-10, and SEP-24 adapters with a mock fallback. Verification: ESLint 9, Playwright 1.60, Cargo tests and snapshots, GitHub Actions lint/build, and many purpose-built Node/TypeScript smoke and evidence scripts.

#### Standout Engineering Decisions

- Separate mutable off-chain event content from on-chain authorization and accounting: the database powers product UX, while contract parameters, pass ownership, balances, withdrawal, and check-in are treated as verifiable truth.
- Use a minimal custom non-transferable pass contract instead of importing a general NFT stack. Quorum needs one owner/event pass, core-only minting, and disabled transfers as first-class invariants; the tradeoff is that the custom contract has no independent audit and must remain explicitly testnet-scoped.
- Make wallet signing a narrow, inspectable boundary. Prepared and signed XDR are checked for signer, network, source account, contract, function, and encoded arguments before the wallet or RPC boundary can proceed; persistence happens only after successful finality and decoded-result validation.
- Treat evidence as a system, not a screenshot: persist unique live proof hashes, ingest contract events idempotently with cursor state, distinguish Stellar transactions from indexed/app proof, and expose event-scoped, global, pass, and collaborator views.
- Correct the payout model when implementation exposed a double-accounting risk. PR #28 made contract withdrawal the only event debit, required cash-out to reference an eligible settled withdrawal, separated contract-to-wallet and wallet-to-MoneyGram hashes, prevented over-allocation, and reused failed/cancelled payout records for safe retry.
- Keep MoneyGram bearer tokens and the client-domain signing secret out of persistence/browser state, validate SEP-24 HTTPS domain, destination, numeric memo, asset issuer, amount, network, and transaction hash, and leave the final wallet transfer under explicit user control.
- Design a local proof mode and extensive mocked live boundaries so the complete product can be exercised without silently signing or submitting transactions; live deployment and signing commands are testnet-only and gated by explicit approval.
- Use issue-driven UI phases to separate visual work from payment/wallet/settlement behavior, with route-specific desktop/mobile QA and reduced-motion requirements.

#### Reliability Security Evidence

- **Summary:** The repository contains 26 Rust contract tests plus committed snapshots covering paid purchase, free claim, capacity, exact amount, split totals, duplicate prevention, collaborator/platform withdrawals, pass uniqueness, core-only mint/check-in, non-transferability, proof events, and check-in authorization/idempotency. The generated `docs/DEMO_EVIDENCE.md` records passing migration, DB, lint, build, dependency audit, wallet-auth, origin, product-flow, settlement, deployment-env, live-argument, persistence, preflight, signing, submission, browser-flow, contract, and readiness checks; this is strong self-recorded evidence, not an independent certification. Security controls visible in code/docs include signed wallet challenges, production session-secret length/placeholder rejection, same-origin mutation guards, server-only DB credentials, testnet/network and explicit signing-approval gates, pre/post-sign XDR intent validation, RPC finality polling, global live-proof hash uniqueness/replay rejection, idempotent indexer storage, fail-closed live action policy, and MoneyGram transfer/URL/asset/memo validation. `docs/BROWSER_QA.md` reports 13 routes at desktop and mobile with no console errors or horizontal overflow. The latest CI run passed lint and build, but GitHub Actions does not execute the full smoke/contract suite. There is no third-party smart-contract audit, penetration test, production monitoring evidence, mainnet incident history, or currently healthy hosted evidence feed, so `secure`, `audited`, and `production reliable` are prohibited claims.

### Proof And Media

#### Shipped Features

- Public Quorum marketing site with Stellar positioning, interactive three-step explanation, feature visuals, FAQ, and responsive motion.
- Public event discovery, event detail, paid/free modes, capacity, collaborator split presentation, and event-specific resources/proof routes.
- Freighter-first signed wallet authentication, wallet-bound sessions, testnet readiness, and explicit live action policy.
- Organizer Studio and guided event creation for metadata, schedule, access, collaborator percentages, and gated resources.
- Paid USDC checkout and free claim flows with exact-amount/capacity/duplicate guards, unique non-transferable pass minting, pass receipt/library, gated resources, QR display, and organizer check-in.
- QuorumCore escrow/split/withdraw/check-in contract and QuorumPassNFT contract, deployed and initialized on Stellar testnet.
- RPC preflight, Freighter signing adapter, signed transaction submission/finality polling, decoded token/amount results, and verified result persistence for publish, checkout, claim, check-in, and withdraw.
- Custom Soroban event indexer, global/event evidence pages, Stellar explorer links, collaborator credit/debit ledger, and proof-mode labeling.
- MoneyGram-compatible hosted Stellar TOML, SEP-1 discovery, SEP-10 challenge/token exchange, SEP-24 initiation/status sync, settlement-linked cash-out records, validated transfer instructions, and retry-safe state handling.
- Responsive product-system refactor across discover, event, checkout, Studio, proof, ledger, pass, and check-in surfaces, plus executable browser QA.

#### External Validation

- The strongest external validation is network execution, not market traction. Horizon independently returned `successful: true` for all six hashes recorded in `docs/LIVE_TESTNET_EVIDENCE.json`: paid-event publish `4ef57a3cc189e728f17e9f0209b4e52853b6e7dfe6fb853e85ec42bca5673f53` (https://horizon-testnet.stellar.org/transactions/4ef57a3cc189e728f17e9f0209b4e52853b6e7dfe6fb853e85ec42bca5673f53), paid checkout `9de9002c53d18b3762ab740c799269cec25056afe3349edeaaca3f4a6536a0cd` (https://horizon-testnet.stellar.org/transactions/9de9002c53d18b3762ab740c799269cec25056afe3349edeaaca3f4a6536a0cd), free-event publish `aacff3ab92050be1e374c3d21c5f278b05b3fc4ed5d0c170be0d9a86ca14036e` (https://horizon-testnet.stellar.org/transactions/aacff3ab92050be1e374c3d21c5f278b05b3fc4ed5d0c170be0d9a86ca14036e), free claim `ea793672bee14b696d9d3c38f7ed49ad7acc12d992941e32adbd2e34466480f8` (https://horizon-testnet.stellar.org/transactions/ea793672bee14b696d9d3c38f7ed49ad7acc12d992941e32adbd2e34466480f8), check-in `a495baefc620c8dc4ebd7948152ec680f46d0fbe1c5012cfaf93a82777c9e253` (https://horizon-testnet.stellar.org/transactions/a495baefc620c8dc4ebd7948152ec680f46d0fbe1c5012cfaf93a82777c9e253), and collaborator withdrawal `f202905159b999cb142b9c802080f613b1240e0f6d97933ca7db59d9836156a0` (https://horizon-testnet.stellar.org/transactions/f202905159b999cb142b9c802080f613b1240e0f6d97933ca7db59d9836156a0). The live Vercel domain, runtime contract status, and Stellar TOML are also externally reachable. The repository states that live MoneyGram SEP-10 exchange and sandbox SEP-24 initiation succeeded on 2026-07-10, but that is integration evidence, not a MoneyGram partnership or completed cash-out. No verified award, grant, customer/user count, revenue, production event, endorsement, or independent testimonial was found. The three landing testimonials and repeated logo strip are authored demonstration content and must not be used as validation.

#### Repository Proof

- `TECHNICAL_SPEC.md`, `DEVELOPMENT_PLAN.md`, and `docs/QUORUM_PM_GOAL_BRIEF.md`: bounded scope, source-of-truth model, user flows, contract/data/API architecture, risks, and acceptance criteria.
- `contracts/quorum_core/src/lib.rs` and `test.rs`: event registry, escrow transfer, basis-point balance accounting, purchase/claim, platform and collaborator withdrawals, pass invocation, check-in, events, and 19 tests.
- `contracts/quorum_pass_nft/src/lib.rs` and `test.rs`: core-only unique pass minting, owner/event lookup, check-in state, disabled transfer, emitted events, and seven tests.
- `docs/LIVE_TESTNET_DEPLOYMENT_EVIDENCE.json` and `scripts/live-deployment-validate.mjs`: recorded contract/WASM IDs, deploy/init/set-core hashes, decoded parameters, and read-only Horizon/RPC/interface validation.
- `docs/LIVE_TESTNET_EVIDENCE.json`: six real signed testnet flow hashes for paid/free publish, paid checkout, free claim, check-in, and collaborator withdrawal; all six were independently rechecked successfully through Horizon on 2026-07-11.
- `src/lib/stellar/*` and the `live:*:smoke` scripts: argument encoding, action policy, preflight, signing, signed-XDR validation, submission/finality, decoded return values, browser orchestration, and persistence boundaries.
- `db/migrations/*`, `src/lib/evidence/repository.ts`, `src/lib/ledger/repository.ts`, and `src/lib/stellar/indexer.ts`: global proof uniqueness, indexed contract events, cursor state, event evidence, and collaborator ledger.
- `docs/MONEYGRAM_ANCHOR_RUNBOOK.md`, `src/lib/anchor/*`, migration `0005_anchor_cashout_proof.sql`, issue #27, and PR #28: traceable settlement-to-cash-out correction, SEP validation, separate proof rails, and retry/over-allocation controls.
- `.github/workflows/ci.yml`, successful run 29137241778, `docs/DEMO_EVIDENCE.md`, and `docs/BROWSER_QA.md`: CI plus timestamped local verification and responsive route matrices.
- The public issue/PR sequence #9–#28: reviewable planning, risk separation, screenshots referenced during QA, and verified incremental product/UI changes.

#### Available Media

- Reusable Quorum logo and mark SVGs in `public/figma/landing/quorum-logo.svg` and `quorum-mark.svg`, plus Stellar, wallet, split, checkout-orbit, pass, and hero-glow SVG assets in the same folder.
- A polished live landing page and product routes that can be recaptured at controlled desktop/mobile sizes; `/`, `/discover`, `/dashboard`, `/dashboard/events/new`, `/passes`, `/dashboard/ledger`, and `/evidence` all returned HTML on 2026-07-11, although data-dependent states vary and the evidence feed is currently unhealthy.
- Mermaid architecture and purchase-flow source in `TECHNICAL_SPEC.md`, plus an app-refactor dependency diagram in `docs/APP_UI_REFACTOR_ROADMAP.md`. These are useful source material but are not yet portfolio-grade exported diagrams.
- Textual responsive QA evidence in `docs/BROWSER_QA.md` for 13 routes at 1280×720 and 390×844. PR descriptions reference many local Playwright screenshots, but those screenshot files are ignored/not committed and therefore are not durable public assets.
- Machine-readable deployment and live-flow JSON evidence, contract test snapshots, public transaction URLs, and current runtime status JSON; these can become authentic evidence frames rather than decorative UI mockups.
- `john-avatar.webp` and `sarah-avatar.webp` plus landing testimonial content exist, but they are demonstration/Figma assets rather than verified customer portraits or testimonials and should not appear as personal/project validation in the portfolio.
- No committed product demo video, walkthrough, competition photo, team photo, award photo, or polished social/OG case-study image was found.

#### Evidence Gaps

- Repair and re-verify the hosted database/evidence path. On 2026-07-11 the public `/evidence` route showed zero proof rows and said the database connection did not respond, even though repository JSON contains real hashes. Apply and verify the latest hosted migration before using the live page as proof.
- Capture a clean deployed end-to-end sequence on the stable Vercel domain: create/publish event, paid checkout or free claim, pass receipt, resource unlock, check-in, collaborator ledger, withdrawal, evidence row, and explorer confirmation. The existing complete flow was recorded against a temporary ngrok URL.
- Complete and capture the remaining MoneyGram manual E2E: Freighter SEP-10 authorization, interactive pickup/KYC details, exact classic Stellar USDC transfer, status sync, transfer hash, pickup reference, and final state. Until then, only claim MoneyGram-compatible sandbox initiation and instructions.
- Create one silent 8–15 second product loop and a concise technical walkthrough; no committed video currently exists.
- Export a portfolio-grade system diagram showing browser, session, Postgres, preflight/sign/submit boundary, QuorumCore, QuorumPassNFT, indexer, evidence ledger, and MoneyGram continuation. Current Mermaid source is useful but visually unfinished.
- Commit or otherwise preserve approved desktop/mobile screenshots and real sanitized proof frames. PRs reference local Playwright images, but the public repository does not contain them.
- Reconcile stale status documents. `README.md` and `docs/MVP_READINESS.md` still say hosted Vercel/Supabase and real app-flow signing are missing, while `docs/LIVE_TESTNET_EVIDENCE.json`, the current Vercel runtime, and later MoneyGram docs prove a newer state.
- Replace or remove fictional landing testimonials and the repeated Quorum logo strip before using the live landing page as portfolio evidence. They are not customer proof.
- Add a real `LICENSE` file if public reuse is intended, and add a release/tag strategy if the project is presented as a maintained product rather than a sprint artifact.
- Obtain project-specific external validation such as hackathon submission/result, organizer beta test, collaborator quote, real event usage, or partner review. None is currently verified.
- Add an explicit team credit artifact and gather authentic project/team photos if available; Git history proves Arga's role, but the product surface does not present the collaboration.
- Document contract audit/hardening plans and the remaining product risks: static QR replay/social sharing, no refunds/cancellations, limited wallet coverage, indexer cadence, testnet-only assumptions, and no production observability.

### Portfolio Translation

#### Strongest Portfolio Angle

Show how a seemingly simple event checkout became a proof-and-settlement system spanning browser intent, wallet authorization, smart-contract accounting, pass access, indexed evidence, collaborator withdrawal, and an off-ramp. The most differentiated chapter is not the cyan landing page; it is the correction documented in issue #27/PR #28. Wildan recognized that an on-chain withdrawal and a MoneyGram cash-out were two distinct money movements, then redesigned the data model and user flow so one cannot masquerade as or double-debit the other. Following one testnet purchase from exact amount → escrow → split balances → pass → check-in → withdrawal → separate cash-out eligibility, with real transaction hashes and explicit unproven boundaries, fits the Open Proving Ground concept exceptionally well.

#### Recommended Headline

Making collaborative event settlement inspectable on Stellar testnet.

#### Recommended Role Label

Full-Stack Product Builder

#### Recommended Evidence Sequence

- 01 — The real coordination problem: one paid event, several stakeholders, and the hidden manual work between ticket purchase, access, reconciliation, and payout.
- 02 — Product frame: a clean live event/checkout screen with the split visible; label the project `Active testnet prototype`, not a generic crypto landing page.
- 03 — Locked intent: show the organizer configuring event metadata, resources, capacity, and a 100% collaborator split before publish.
- 04 — Trust-boundary map: animate deterministic arguments → RPC preflight → inspected XDR → explicit Freighter approval → signed-XDR revalidation → finality → persistence.
- 05 — Contract behavior: expand QuorumCore and QuorumPassNFT as two focused modules, then show exact invariants—capacity, amount, one owner/event pass, disabled transfer, split balances, authorized withdrawal, and check-in.
- 06 — One real attendee path: pair paid/free checkout, pass receipt, gated resource, and QR check-in product frames with the relevant successful Horizon transaction links.
- 07 — Evidence becomes a product: show the indexer cursor, idempotent event row, event proof, global evidence, and collaborator ledger; label the current hosted evidence-feed failure honestly beside the repository proof packet.
- 08 — The correction: a before/after diagram of the old conflated withdrawal/cash-out state versus `contract settlement → wallet funds → MoneyGram cash-out`, with PR #28, migration 0005, duplicate-allocation guard, and retry semantics.
- 09 — Verification ledger: 26 contract tests, browser route matrix, replay/session/origin/network guards, green CI, and the six independently successful testnet transactions—clearly separating CI from self-recorded local smoke evidence.
- 10 — What shipped / what comes next: close with the live contracts, six confirmed flows, hosted build, current evidence-feed iteration, and MoneyGram continuation roadmap.

#### Case Study Outline

- Opening — project statement, Wildan's Full-Stack Product Builder role, Arga credit, hackathon/testnet context, live/GitHub links, and one authentic event/ledger frame.
- Why event revenue becomes a systems problem — explain the multiple-party settlement and access problem without attacking Luma/Eventbrite or using vague blockchain claims.
- Define the contract of the product — draft, locked split, paid/free checkout, one pass, resource access, check-in, balance, withdrawal, and evidence.
- Choose the source of truth — show what stays in Postgres for UX versus what must be enforced by QuorumCore/QuorumPassNFT, including why the pass is custom and non-transferable.
- Make wallet intent inspectable — trace preflight, signing, signed-XDR verification, finality, and verified persistence; emphasize the failure states that prevent local proof from impersonating a live transaction.
- Run one event through the system — show publish, purchase/claim, pass, resource, check-in, split balance, and withdrawal using product media plus the six real testnet hashes.
- Turn transactions into readable evidence — explain custom indexing, idempotency, global proof-hash uniqueness, event proof, pass receipt, collaborator ledger, and the current hosted-feed iteration.
- The correction that made the model clearer — reconstruct issue #27, the double-debit/conflated-proof risk, the decision to require prior settlement, the additive migration, validation rules, and safe retry behavior.
- Continuing toward MoneyGram — show SEP-1/10/24 readiness, transfer-instruction validation, and the remaining manual transfer/pickup step.
- Prove the engineering — combine contract tests, smoke boundaries, browser QA, CI, testnet deployment validation, and Horizon confirmations while labeling self-authored versus external proof.
- Where it stands — a live testnet hackathon build with deployed contracts and real flows, plus clear future milestones around the hosted feed, MoneyGram, audits, users, and production operations.
- What I would improve next — hosted migration/replay, durable media, full MoneyGram E2E, product validation, contract hardening, broader wallet support, and production observability.

#### Context And Next Milestones

- Present Quorum as a live Stellar testnet hackathon build and Wildan as its Full-Stack Product Builder, with Arga credited for his infrastructure/evidence contributions. Label the MoneyGram path as sandbox and in progress, the hosted evidence feed as a current iteration, and demo testimonials as illustrative content rather than customer proof. Mainnet, independently audited custody, production-event usage, and automatic fiat payout remain future milestones. Keep secrets and sensitive transfer details out of media.
