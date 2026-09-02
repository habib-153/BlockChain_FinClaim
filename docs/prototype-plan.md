# FinClaim Prototype — Implementation Plan

**Deadline:** 4 September 2026 · **Today:** 3 September 2026 · **Less than 24 hours left**
**Status:** REVISED — strategy changed 3 Sept after whitepaper update + team decision. Supersedes the original 1 Sept draft.

---

## 0. What changed on 3 September (read this first)

Two things happened since the original draft of this plan:

1. **The whitepaper was updated** (`DeluluChain_Whitepaper_Updated.docx.pdf`, still dated 18 Aug 2026 internally, Team ID `6a8345f5ab2e0`). See `whitepaper-summary.md` for the full recap of what changed. The two changes that actually affect this build:
   - A new "Prototype: Adherence to Decentralized Application Design" section describes FinClaim as "an EVM-compatible permissioned consortium." **The team has decided to keep Hyperledger Fabric** (see §3) — the existing draft chaincode already targets Fabric, and re-platforming to an EVM chain with ~1 day left is not worth the risk. This wording is being treated as loose/generic Web3 phrasing in the whitepaper, not a binding architecture instruction, and should be corrected in the whitepaper's next revision.
   - Clearing a beneficial-ownership contagion flag now explicitly requires **both** a penalty fee (0.02% of invoice value) **and** reviewer-verified documentation — not just an unfreeze toggle — and the whitepaper calls this mechanism part of the MVP. The team decided to add a lightweight version of this to the demo (see Phase 1).

2. **Given only ~1 day remains before submission, the team changed strategy.** Original plan assumed 3 working days and a bottom-up build (network → chaincode → backend → frontend). That is no longer realistic. New priority order:
   - **Priority 1 (now): a polished, frontend-only demo running entirely on mock/static JSON data.** No live backend calls, no live chaincode calls. The UI must look and feel finished — this is what gets presented.
   - **Priority 2 (only after Priority 1 is demo-ready, time permitting): architecture/backend work in this repo** — an honest attempt at a live chaincode transaction, to address the mandatory back-end gate below. If time runs out, this ships as documented architecture rather than a working system, and that gap is disclosed, not hidden.
   - Frontend and backend are **not wired together** for this round.

**⚠ Read this before treating Priority 1 as sufficient on its own:** the guideline's mandatory gate (§2 below) requires the prototype to *write to a blockchain* — this is pass/fail, worth 0 or full credit, independent of UI quality. A mock-data-only frontend with zero live chaincode interaction risks failing this gate outright, however polished it looks. That's why Priority 2 exists as a bounded, best-effort follow-up rather than something dropped entirely — see Phase 2.

**Design/structure reference for the frontend:** [`monzim/auctra-product`](https://github.com/monzim/auctra-product) — its Next.js App Router folder conventions and its login page's "enter credential → brief loading state → redirect into your dashboard" pattern. This is a **structural/UX reference only** — its own demo visibly labels itself as showing demo data, which FinClaim's build must *not* do (see the non-negotiable rules below), and its blue/purple color scheme is not used — FinClaim uses its own brand palette, extracted from the whitepaper's own logo and diagrams (see `docs/handoff/phase-1-frontend.md` §2).

**Non-negotiable UI rules (added 3 Sept, after reviewing the reference):**
- The running app must **never** label any data as mock/demo/sample — no banners, no disclaimers, no "(demo)" suffixes. It has to read as a real, live product to anyone watching.
- Fixture data must use realistic Bangladeshi business/institution names, never placeholders (no "John Doe," "Company A/B/C"). A fixed roster is defined once in `docs/handoff/phase-1-frontend.md` §3 and reused everywhere so the demo reads as one coherent system.

**How this plan is actually executed:** the team works this repo across multiple separate chat sessions, one phase per session, to control token spend. `CLAUDE.md` (repo root) is the always-read entry point for any session; `PROJECT_STATUS.md` (repo root) tracks what's actually done vs. this plan; `docs/handoff/phase-1-frontend.md` / `phase-2-backend.md` / `phase-3-documentation.md` / `phase-4-rehearsal.md` are self-contained execution specs for each phase below — this document stays the strategic narrative, the handoff docs carry the execution-level detail.

## 1. Where we are

Proposal round passed (top 30). This plan covers the **Prototype Round** only, evaluated against `BLOCKCHAIN OLYMPIAD BANGLADESH Blockchain Guideline (2).pdf`. A draft chaincode contract (Fabric, TypeScript) and a partial Express backend skeleton already exist in `chaincode/` and `backend/` from before this revision — untouched by this plan's new priority order, kept as the starting point for Phase 2 if time allows. `frontend/` is currently empty.

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

## 3. Technical decisions

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js + Tailwind + shadcn/ui | Team's stated preference; folder structure follows the auctra-product reference's App Router conventions (see `docs/handoff/phase-1-frontend.md` §5), not its visual branding |
| Backend | Express (Node/TypeScript) | Draft skeleton exists in `backend/`; not wired to the frontend this round (see §0) |
| Blockchain | **Hyperledger Fabric**, chaincode in JS/TypeScript | Reaffirmed 3 Sept despite the whitepaper's new "EVM-compatible" wording (see §0) — team chose Fabric over Solidity/EVM specifically to avoid Solidity, and a draft chaincode already exists targeting it |
| Network topology | Fabric `test-network`'s stock 2-org setup: **Org1MSP = Lender Consortium**, **Org2MSP = Regulator (Bangladesh Bank)** | Default endorsement policy requires **both orgs** to endorse every transaction — this is the literal on-chain enforcement of the whitepaper's "no single institution acts unilaterally" governance principle, and directly answers the guideline's Architecture question ("if Fabric, who are the peers/orderers?"). Only exercised for real if Phase 2 happens. |
| Frontend data source (this round) | Hardcoded/static JSON fixtures per role, matching the flagship demo scenario exactly | No REST calls, no chaincode calls. Numbers must match §8 exactly so the demo narrates correctly across screens |
| Auth (this round) | A real-looking email/password login: match against a fixed fixture directory (`docs/handoff/phase-1-frontend.md` §3), ~1s artificial "Signing in…" delay, client-side redirect to that identity's dashboard | Mirrors `auctra.vercel.app/login`'s *interaction* pattern (credential → spinner → dashboard) but **does not** show credentials on-page like that reference does — nothing in this UI may hint the data or accounts are fixtures. No real session, JWT, or password check underneath |
| Confidential partial-financing check | If Phase 2 happens: chaincode does the real atomic sum ≤ capacity check on-chain; Fabric's native multi-org endorsement serves as the "signed attestation." A hash commitment (`SHA256(amount‖nonce)`) stands in for the whitepaper's Pedersen-commitment concept. In the frontend-only demo, this is simulated: the fixture data already encodes the approved/rejected outcomes | Team's confirmed choice over building a real zk-SNARK circuit |
| Confidentiality *between lenders* | Each lender's mock dashboard only ever shows their own claims plus the aggregate remaining capacity — never another named lender's amount, even in the static fixtures | |
| Off-chain invoice storage | If Phase 2 happens: AES-256-GCM in Express before storage; only a hash + commitment on-chain | Matches team's stated "manual encryption in backend" approach |
| Identity model | **One gateway identity per org** (not one per bank/institution), if Phase 2 happens | Explicit, disclosed simplification — production would issue per-institution Fabric CA identities |

## 4. Scope simplifications to state openly (same pattern the whitepaper itself uses)

The whitepaper repeatedly and explicitly labels prototype-stage mocks ("the Olympiad prototype uses a clearly labeled mock version"). Judges penalize hidden gaps, not disclosed ones — **but per the 3 Sept decision, disclosure happens in the pitch and in Phase 3's documentation, never as a label inside the running UI itself** (see the non-negotiable rules in §0). Say all of this out loud when presenting, and write it into the README:

- **Frontend and backend are not connected this round.** The demo runs entirely on static fixture data, presented as real. This is the biggest disclosed gap and directly affects the mandatory back-end gate — see §0 and Phase 2.
- **e-KYC / BIN / tax oracle checks** — fixture-backed, not labeled as mock on-screen; disclosed in the documentation instead.
- **Per-institution identity** — one Fabric identity per org role for the demo, not per bank (only relevant if Phase 2 happens).
- **Confidentiality proof** — fixture-encoded outcomes in the frontend demo; on-chain plaintext sum-check + hash commitment if Phase 2 happens; not the whitepaper's own stated Pedersen/Bulletproofs or eventual zk-SNARK target.
- **Flag-clearing (penalty + verified docs)** — built as a lightweight UI flow (mock fee amount shown, mock document upload accepted, reviewer approves) not real payment processing or document verification.
- **Public Merkle anchor** — shown in the UI as a recorded event with a hash; whether it's genuinely broadcast to a public testnet is a stretch goal, only relevant if Phase 2 happens.
- **Validator participation bond** — whitepaper itself says this is a design proposal, out of MVP scope. Not built. (Distinct from the flag-clearing penalty fee, which the whitepaper explicitly places inside MVP scope — see `whitepaper-summary.md`.)

## 5. Phases

Full execution detail for each phase now lives in `docs/handoff/` (see §0) so each can be picked up in its own chat session without re-deriving context. Summary:

### Phase 1 — Frontend demo — TOP PRIORITY, not started

Spec: `docs/handoff/phase-1-frontend.md`. Build a polished, clickable Next.js + Tailwind + shadcn/ui app running entirely on static fixtures (no API wiring), covering all four roles plus the Regulator's flag-clearing step. **Exit criteria:** the flagship demo scenario (§8) is clickable start-to-finish in the browser, with visual polish comparable to the auctra-product reference, using only local fixture data, with no data ever labeled as mock/demo on-screen.

### Phase 2 — Best-effort live blockchain proof — not started, only after Phase 1 is demo-ready

Spec: `docs/handoff/phase-2-backend.md`. Exists to address the mandatory "back-end writes to a blockchain" gate (§2), which Phase 1 alone does not satisfy. **Exit criteria (minimum bar):** one successful transaction submitted and queried from a live Fabric network, proven on video/screenshot, even if never wired into the Phase 1 frontend. If it doesn't happen in time, the gap gets stated plainly in Phase 3's documentation rather than hidden.

### Phase 3 — Technical documentation — not started, can start once Phase 1's fixture roster is settled

Spec: `docs/handoff/phase-3-documentation.md`. A judge-facing README/architecture doc answering all four graded criteria, leaning on the whitepaper's new "Prototype: Adherence to Decentralized Application Design" section, and stating the Fabric-vs-"EVM-compatible" wording discrepancy (§0) and the frontend/backend disconnect (§4) openly. **Exit criteria:** a reader who never sees the live demo can still answer all four graded criteria from this document alone.

### Phase 4 — Rehearsal & submission — not started, last

Spec: `docs/handoff/phase-4-rehearsal.md`. Full rehearsal of the demo script (§7/§8), a backup demo video, a final pass against the grading map (§6), then submit.

## 6. Grading criteria → feature mapping

| Criterion (pts) | Covered by |
|---|---|
| Problem & Solution (40) | The flagship demo scenario, fully clickable in the frontend — a duplicate-financing attempt caught in real time, in front of the judges |
| Privacy & Security (20) | Lender views never show another lender's amounts (even from fixtures) + audit-log/hash-commitment concept + AES-256-GCM off-chain design (documented; live only if Phase 2 happens) + role-gated views |
| Architecture (20) | Named, real consensus design (Fabric peers/orderers/2-org endorsement policy) documented per §Phase 3, reinforced by the whitepaper's new DApp-design section; live chaincode proof from Phase 2 strengthens this further if it happens |
| Governance (20) | Org1/Org2 endorsement policy = no unilateral action (documented); regulator-only freeze/dispute + flag-clearing (penalty fee + verified docs, not payment alone) fully clickable in Phase 1; linked-entity human-review flag (not auto-block) |

## 7. Demo script (rehearse this exact sequence)

1. Log in as Seller (Karnaphuli Garments Ltd., ~1s "Signing in…") → submit the BDT 650,000 receivable to Nordicwear Sourcing ApS; invoice shown as encrypted/hashed.
2. Log in as Buyer (Nordicwear Sourcing ApS) → confirm the obligation → that receivable goes ACTIVE.
3. Switch to the already-settled flagship receivable (`RCV-2026-04871`, BDT 1,000,000): log in as Padma Bank PLC → its 400,000 claim shows **approved**, capacity remaining 600,000.
4. Log in as Jamuna Capital & Finance Ltd. → its 300,000 claim shows **approved**, capacity remaining 300,000.
5. Log in as Meghna NBFI Ltd. → its 500,000 claim shows **rejected** — its screen shows only "not eligible," never Padma's or Jamuna's amounts.
6. Switch to Regulator view (Bangladesh Bank): full claim breakdown, audit log, capacity history.
7. Show the Turag Apparel Solutions Ltd. flag already sitting in the review queue (shares a director with a previously disputed entity) → not auto-blocked, needs human review.
8. Trigger flag-clearing: show the pre-calculated penalty-fee amount (0.02% of that claim's invoice value) and the document-upload step — demonstrate that submitting the fee *alone*, without the document, does not clear the flag.
9. Show the Merkle anchor event recorded in the audit log.
10. **If judges ask "what if two lenders request at nearly the same time and both individually fit but not together?"** — have the answer ready even though it's not a live click-through: transaction ordering decides it, not fairness. E.g. after Padma's 400,000 is approved (600,000 remaining), if Jamuna's 300,000 and Meghna's 500,000 arrive close together, whichever the network confirms first is evaluated against the live 600,000 balance and approved; the second is then evaluated against the now-updated balance and rejected. No race condition, because the ledger only ever has one canonical ordered state — this is straight from the updated whitepaper's own worked example.

## 8. Flagship demo scenario (source of truth for the fixture data — full roster in `docs/handoff/phase-1-frontend.md` §3)

> Receivable `RCV-2026-04871` = **BDT 1,000,000**, buyer-attested, status ACTIVE.
> - Padma Bank PLC requests **400,000** → approved. Capacity remaining: 600,000.
> - Jamuna Capital & Finance Ltd. requests **300,000** → approved. Capacity remaining: 300,000.
> - Meghna NBFI Ltd. requests **500,000** → rejected (exceeds remaining 300,000). Meghna sees only "not eligible."

## 9. Risk register

| Risk | Fallback |
|---|---|
| **Mandatory back-end gate not met** — Phase 1 alone is a static-data frontend with no live blockchain write | Attempt Phase 2's minimum bar (one live chaincode transaction, proven on video) as soon as Phase 1 is demo-ready. If it truly can't happen in time, submit anyway with the gap disclosed in the README rather than faking a live connection — but treat Phase 2 as genuinely worth attempting, not optional filler |
| Fabric vs. the whitepaper's "EVM-compatible" wording creates an inconsistent story in front of judges | Say explicitly in the README/pitch that Fabric was the team's deliberate choice (to avoid Solidity) and that the whitepaper's phrasing will be corrected in its next revision — a disclosed inconsistency reads far better than an unexplained one |
| Frontend polish takes longer than expected, squeezing Phase 2/3 to zero | Acceptable outcome given the priority order in §0 — a fully clickable, well-designed frontend against fixture data is still a demonstrable UI (mandatory gate item i) and covers most of the graded criteria through documentation |
| Team runs out of time for the public Merkle anchor to be "real" | Keep it a recorded-event-with-a-hash in the UI; the audit-trail claim doesn't require a real public broadcast to read convincingly in a demo |

## 10. Open questions for the team to resolve now

- Who owns Phase 1 (frontend) vs. Phase 2 (backend proof) vs. Phase 3 (docs) — given the timeline, these likely need to run in parallel across different people/chat sessions starting immediately.
- Decide, once Phase 1 is actually demo-ready, how much of the remaining time goes to Phase 2 vs. rehearsal — don't let Phase 2 eat all the buffer needed for Phase 4.

~~Confirm the exact fixture dataset before building screens against it~~ — **resolved 3 Sept**: fixed roster (companies, banks, amounts, credentials) is now specified in `docs/handoff/phase-1-frontend.md` §3, don't redefine it ad hoc.
