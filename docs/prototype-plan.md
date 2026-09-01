# FinClaim Prototype — Implementation Plan

**Deadline:** 4 September 2026 · **Today:** 1 September 2026 · **~3 working days left**
**Status:** DRAFT — for team review before any implementation starts

---

## 1. Where we are

Proposal round passed (top 30). This plan covers the **Prototype Round** only, evaluated against `BLOCKCHAIN OLYMPIAD BANGLADESH Blockchain Guideline (2).pdf`. See `whitepaper-summary.md` for the full whitepaper recap.

## 2. What the guideline actually requires (Prototype Round)

### Mandatory gate — must pass BOTH or the round scores 0 regardless of quality

| # | Requirement |
|---|---|
| i | **Front-end** — the prototype must have a user interface |
| ii | **Back-end** — the prototype must **write to a blockchain** |

### Graded criteria (100 pts)

| Criterion | Points | Judges are asking |
|---|---|---|
| Problem & Solution | 40 | Why is blockchain *the best* fit (not cloud/DB)? What pain point, for whom? Does it actually work? |
| Privacy & Security Risks | 20 | Data/identity privacy? Leak risk? Key management? Access control? |
| Architecture | 20 | Consensus setup (name it — validators/peers/orderers)? On-chain vs off-chain split? Regulatory compliance handling? Data model? Legacy integration? Digital identity? |
| Governance | 20 | Membership governance, business network governance, tech infra governance — trust design for the DApp |

## 3. Technical decisions already confirmed with the team

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js + Tailwind + shadcn/ui | Team's stated preference |
| Backend | Express (Node/TypeScript) | Acts as the whitepaper's "API & Oracle Gateway" layer |
| Blockchain | **Hyperledger Fabric**, chaincode in JS/TypeScript | Team chose this over Solidity/EVM specifically to avoid Solidity; accepted the higher infra-setup cost this brings |
| Network topology | Fabric `test-network`'s stock 2-org setup: **Org1MSP = Lender Consortium**, **Org2MSP = Regulator (Bangladesh Bank)** | Default endorsement policy requires **both orgs** to endorse every transaction — this is the literal on-chain enforcement of the whitepaper's "no single institution acts unilaterally" governance principle, and directly answers the guideline's Architecture question ("if Fabric, who are the peers/orderers?") |
| Confidential partial-financing check | Chaincode does the real atomic sum ≤ capacity check on-chain; Fabric's native multi-org transaction endorsement/signing serves as the "signed attestation" the whitepaper describes. A hash-based commitment (`SHA256(amount‖nonce)`) is stored per claim as audit-trail evidence, echoing the whitepaper's Pedersen-commitment concept without needing elliptic-curve tooling under this timeline | Team's confirmed choice over building a real zk-SNARK circuit |
| Confidentiality *between lenders* | Enforced at the **API layer**, not the ledger: a lender's API responses only ever include their own claims plus the aggregate remaining capacity — never another named lender's amount | |
| Off-chain invoice storage | AES-256-GCM, encrypted manually in the Express backend before storage; only a hash + commitment go on-chain | Matches team's stated "manual encryption in backend" approach |
| Identity model | **One gateway identity per org** (not one per bank/institution) for the prototype | Explicit, disclosed simplification — production would issue per-institution Fabric CA identities, matching the whitepaper's own stated identity roadmap |

## 4. Scope simplifications to state openly (same pattern the whitepaper itself uses)

The whitepaper repeatedly and explicitly labels prototype-stage mocks ("the Olympiad prototype uses a clearly labeled mock version"). We should do the same, out loud, in the pitch and README — judges penalize hidden gaps, not disclosed ones:

- **e-KYC / BIN / tax oracle checks** — mocked services, clearly labeled as mock in the UI.
- **Per-institution identity** — one Fabric identity per org role for the demo, not per bank.
- **Confidentiality proof** — on-chain plaintext sum-check + off-chain hash commitment, not the whitepaper's own stated Bulletproofs/zk-SNARK target.
- **Public Merkle anchor** — chaincode records anchor events; whether it's genuinely broadcast to a public testnet or just logged is a stretch goal (see Phase 4).
- **Validator participation bond** — whitepaper itself says this is a design proposal, out of MVP scope. Not built.

## 5. Environment status (infra prep only — no feature work started)

- [x] Docker Desktop, Node, Git confirmed installed; WSL2 + Ubuntu distro present
- [x] Node.js 20 installed inside WSL (no-sudo tarball method, since `sudo` needs an interactive password unavailable in this session)
- [x] `fabric-samples` (incl. `test-network`) cloned into WSL's native filesystem at `~/finclaim/fabric-samples` — kept off `/mnt/c` deliberately, since Fabric's bootstrap scripts are known to be unreliable over Windows-mounted paths
- [ ] Docker Desktop → WSL Integration → "Ubuntu" toggle — **pending, needs a person to click it in Docker Desktop's settings**
- [ ] `test-network` actually booted
- [ ] Chaincode deployed and smoke-tested against a live network

A draft chaincode contract and a partial Express backend skeleton were started in `chaincode/` and `backend/` before this plan was written — **treat both as unreviewed drafts**, not approved work. They're there as a possible head start once the team has reviewed this plan, not a commitment to that exact design.

## 6. Phases

### Phase 0 — Network bootstrap (Sept 1, remainder of today)
- [ ] Enable Docker Desktop WSL integration for Ubuntu
- [ ] Boot `test-network` with a channel (`network.sh up createChannel -ca`)
- [ ] Deploy a trivial "hello world" chaincode to prove the install→approve→commit→invoke pipeline works end-to-end
- **Exit criteria:** one successful transaction submitted and queried from a Node script against the live network.
- **Why first:** this is the single highest-risk, least-flexible item — everything else is negotiable on scope, this isn't.

### Phase 1 — Core chaincode logic (Sept 2, morning)
- [ ] Finalize the receivable/claim/lender data model
- [ ] Implement: submit receivable → buyer attestation → activate → request financing (capacity check) → settle
- [ ] Implement: lender onboarding/offboarding, linked-entity flag, freeze/unfreeze (regulator-only)
- [ ] Deploy via chaincode-as-a-service, smoke-test every function via `peer chaincode` CLI as both orgs
- **Exit criteria:** the flagship demo scenario (BDT 1,000,000 receivable; Bank A 400k approved; Bank B 300k approved; Bank C 500k rejected) runs correctly from the CLI.

### Phase 2 — Backend API + off-chain layer (Sept 2 afternoon – Sept 3 morning)
- [ ] Express routes wrapping every chaincode function, using the correct org identity per role
- [ ] AES-256-GCM invoice encryption/decryption service
- [ ] Mock oracle endpoints (e-KYC/BIN/tax), clearly labeled as mock in responses
- [ ] Linked-entity registry + lookup
- **Exit criteria:** the full flagship demo scenario is runnable end-to-end via curl/Postman, no UI needed yet.

### Phase 3 — Frontend (Sept 2–3, run in parallel with Phase 2 once API contracts are agreed)
- [ ] Seller view: submit receivable, upload invoice, track status
- [ ] Buyer view: attest to a receivable
- [ ] Lender view: query capacity, submit a claim, see only own claims
- [ ] Regulator view: full audit log, flag/freeze controls, linked-entity alerts
- **Exit criteria:** the flagship demo scenario is clickable start-to-finish in the browser.

### Phase 4 — Governance features + public anchor (Sept 3)
- [ ] Linked-entity contagion flag wired end-to-end (trigger → regulator review queue)
- [ ] Freeze/dispute flow visible in both Lender and Regulator views
- [ ] Merkle anchor: batch a period's events, compute root, record on-chain
- [ ] **Stretch:** actually publish the root to a public EVM testnet (one plain transaction, no contract needed) — decide go/no-go based on time remaining
- **Exit criteria:** every one of the 4 graded criteria (§7 below) has a specific, demonstrable moment in the app.

### Phase 5 — Hardening, rehearsal, submission (Sept 3 evening – Sept 4)
- [ ] Seed realistic demo data
- [ ] Two full rehearsal run-throughs of the demo script (§8)
- [ ] Bug fixes from rehearsal
- [ ] Record a backup demo video (in case live demo fails)
- [ ] Write the judge-facing README/architecture note (mirrors the whitepaper's 4-layer diagram)
- [ ] Submit — do not let Sept 4 be the first full run-through

## 7. Grading criteria → feature mapping

| Criterion (pts) | Covered by |
|---|---|
| Problem & Solution (40) | The flagship demo scenario itself — a duplicate-financing attempt caught in real time, in front of the judges |
| Privacy & Security (20) | API-layer confidentiality (Bank C never sees A/B's amounts) + hash-commitment audit trail + AES-256-GCM off-chain invoice encryption + role-gated chaincode functions |
| Architecture (20) | Named, real consensus setup (Fabric peers/orderers/2-org endorsement policy) + explicit on-chain/off-chain split + documented data model |
| Governance (20) | Org1/Org2 endorsement policy = no unilateral action; lender onboarding/offboarding; regulator-only freeze/dispute; linked-entity human-review flag (not auto-block) |

## 8. Demo script (rehearse this exact sequence)

1. Seller submits a BDT 1,000,000 receivable; invoice encrypted and hashed off-chain.
2. Buyer attests → receivable goes ACTIVE.
3. Bank A requests 400,000 → **approved**, capacity remaining 600,000.
4. Bank B requests 300,000 → **approved**, capacity remaining 300,000.
5. Bank C requests 500,000 → **rejected** — Bank C's screen shows only "not eligible," never A's or B's amounts.
6. Switch to Regulator view: full claim breakdown, audit log, capacity history.
7. Trigger a linked-entity flag (a new claimant shares a "director" attribute with a flagged entity) → shows up in the regulator's review queue, not auto-blocked.
8. Show the Merkle anchor being recorded (and, if built, verified independently on the public testnet).

## 9. Risk register

| Risk | Fallback |
|---|---|
| Fabric CCaaS deployment not reliable by end of Phase 0/1 | Pre-scoped fallback: minimal Solidity contract on an EVM testnet, called from Express via ethers.js — was the team's original alternative before choosing Fabric; keep as a circuit-breaker, not a default |
| `sudo`/WSL friction blocks setup | Already worked around once (no-sudo Node install); document any further workarounds here |
| Privacy layer feels too thin for 20 pts | Time permitting, layer a real Pedersen commitment (EC point, not just hash) on top without touching the enforcement logic — cosmetic strengthening, not a redesign |
| Team runs out of time for the public Merkle anchor | Keep it a Phase 4 stretch goal only; chaincode-recorded anchor alone still satisfies the audit-trail claim |

## 10. Open questions for the team to resolve before Phase 0 starts

- Who owns each phase? (chaincode / backend / frontend / demo-rehearsal)
- Is the draft chaincode in `chaincode/` an acceptable starting point, or should it be rewritten from this plan?
- Confirm: is the hash-commitment privacy layer (§3) acceptable, or does someone want to attempt a real Pedersen/EC commitment given the time left?
- Real vs. simulated public Merkle anchor — decide by Phase 4, not before (don't let it block earlier phases).
