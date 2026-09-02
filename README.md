# FinClaim

**Confidential Claim Infrastructure for Receivable Finance** — a permissioned, regulator-supervised registry that lets competing Bangladeshi banks/NBFIs check *"has this invoice already been pledged, and how much financing room is left?"* without exposing client lists, pricing, or exact positions to each other.

**Team DeluluChain** (Meherun Mehnaj Miti, Md. Mahidul Islam Mahi, Khondaker Zarifa Haque, MD. Samiul Islam Tamim, Habibur Rahman, Faiyaz-Ur Rahman) · United International University · Team ID `6a8345f5ab2e0` · BCOLBD 2026 Prototype Round.

---

## Overview

FinClaim solves duplicate and over-collateralized receivable financing across institutions that don't trust each other with client-sensitive data. Bangladesh's Secured Transactions (Movable Property) Act, 2023 already mandates a national collateral registry for movable assets including receivables; FinClaim is a working implementation of that registry.

Core capabilities:

- **Legally-aware Receivable Claim Object** — distinguishes **pledge** (seller retains ownership, receivable used as collateral) from **assignment** (the right to collect is transferred), tracked as legally distinct on-chain events.
- **Confidential partial-financing check** — before approving a new claim, the ledger atomically checks `existing claims + new claim ≤ face value` and returns only the outcome and the new aggregate remaining capacity — never another lender's amount.
- **Linked-entity ("beneficial-ownership contagion") flag** — claims connected via shared directors/signatories/addresses are flagged for **human review**, never auto-blocked; clearing a flag requires both a penalty fee (0.02% of the flagged invoice's value) and reviewer-verified documentation.
- **Supervisory consortium + public Merkle audit anchor** — Bangladesh Bank anchors the consortium without running it alone; a periodic Merkle root of ledger events is recorded so outside auditors can verify nothing was secretly altered, without seeing private transaction data.

**Flagship scenario:**

> Receivable `RCV-2026-04871` = BDT 1,000,000, buyer-attested, status ACTIVE.
> - Padma Bank PLC requests 400,000 → **approved**. Capacity remaining: 600,000.
> - Jamuna Capital & Finance Ltd. requests 300,000 → **approved**. Capacity remaining: 300,000.
> - Meghna NBFI Ltd. requests 500,000 → **rejected** (exceeds remaining 300,000). Meghna's own dashboard shows only "not eligible" — never Padma's or Jamuna's amounts.

**What happens when two requests race?** Ledger transactions are ordered, not simultaneous. If, after Padma's 400,000 is approved (600,000 remaining), Jamuna's 300,000 and Meghna's 500,000 both individually fit within 600,000 but not together, whichever the network confirms first is evaluated against the live balance and approved; the second is then evaluated against the *already-updated* balance and rejected. The contract needs no special-case logic for this — it only ever sees one canonical ordered state.

---

## Architecture

```text
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│     Frontend      │    │     Backend       │    │    Blockchain     │
│   (Next.js App)   │◄──►│  (Express + TS)   │◄──►│ (Hyperledger      │
│                    │    │                    │    │  Fabric)          │
│ - Seller portal    │    │ - Fabric Gateway   │    │ - finclaimContract│
│ - Buyer confirm    │    │   client           │    │ - Two-org         │
│ - Lender dashboard │    │ - AES-256-GCM      │    │   endorsement     │
│ - Regulator view   │    │   document crypto  │    │ - Event log       │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

**Consensus setup.** Hyperledger Fabric on a two-organization channel topology:

| Org | MSP | Role |
|---|---|---|
| Org1 | `Org1MSP` | Lender Consortium (banks/NBFIs/fintechs) |
| Org2 | `Org2MSP` | Regulator — Bangladesh Bank |

The channel's endorsement policy requires **both organizations** to endorse state-changing transactions — the literal on-chain enforcement of the principle that no single institution, not even the regulator alone, can unilaterally write or alter claim state. Fabric's ordering service sequences transactions into blocks, which is what gives the "transactions are ordered, not simultaneous" guarantee the capacity-check logic depends on.

**On-chain vs. off-chain split:**

| Layer | Where | Contents |
|---|---|---|
| Actors & inputs | Off-chain | Seller portal, buyer confirmation, lender dashboard, regulator view (`frontend/`) |
| Processing & middleware | Off-chain | API/gateway routing, identity & oracle checks (KYC/BIN/tax) |
| **Core protocol** | **On-chain (Fabric)** | Legally-aware claim object, atomic capacity check, linked-entity flag records, freeze/unfreeze governance, event log — `chaincode/src/finclaimContract.ts` |
| External services | Off-chain | AES-256-GCM encrypted invoice store, hash-commitment confidentiality service, public Merkle anchor record |

**Data model:**

- `Receivable` — `id, sellerId, buyerId, faceValue, invoiceHash, status (PENDING→ACTIVE→FLAGGED/DISPUTED→SETTLED), totalClaimed, flagReason?, createdAt`.
- `Claim` — keyed by a composite `(receivableId, lenderId)` key, `amount, claimType (PLEDGE|ASSIGNMENT), status (ACTIVE|REJECTED|SETTLED|RELEASED), commitment, createdAt`.
- `Lender` — onboarding/offboarding record, regulator-controlled, an `active` flag gates whether a lender identity may submit claims at all.
- `LinkedEntity` — `businessIdA, businessIdB, reason` — the contagion-flag record, regulator-written.
- `MerkleAnchor` — `rootHash, eventCount, periodLabel` — a regulator-recorded checkpoint of ledger integrity.

---

## Privacy & Security

**Data minimization, not obfuscation.** Raw invoices, prices, and commercial terms never touch the ledger. The `Receivable` object stores only an `invoiceHash` (a fingerprint of the encrypted off-chain document), identifiers, status, and aggregate `totalClaimed` — enough to prove state and authorization, nothing that reveals business terms.

**Off-chain document encryption.** `backend/src/services/crypto.ts` implements AES-256-GCM encryption for invoice documents before they leave the submitting institution, with the decryption key held outside the ledger. The whitepaper's stated production path is per-institution keys in an HSM/KMS — a roadmap item, not what's running today.

**Confidentiality between competing lenders**, enforced at two layers:
- **On-chain:** `RequestFinancing` returns only the caller's own approval outcome and the new aggregate remaining capacity — another lender's claim amount is never serialized into a response a competing lender can read. Reading *another* lender's specific claim (`GetMyClaim`) is scoped to the calling lender's own identity; reading all claims on a receivable (`GetAllClaims`) is regulator-only.
- **In the frontend:** each lender's dashboard queries only its own claims plus the shared aggregate capacity meter — Meghna NBFI's dashboard shows its own rejected claim and the capacity meter, never Padma's or Jamuna's amounts.

**Claim-amount commitment.** Each claim carries a `commitment` field — `SHA256(amount ‖ nonce)`, computed in `commitAmount()` — binding the amount for dispute-time reveal without exposing it on the ledger in the meantime. This is a hash-commitment stand-in for the whitepaper's target of Pedersen commitments and Bulletproofs-style range proofs; a full zk-SNARK confidentiality circuit is a longer-term production goal.

**Access control is identity-scoped, not role-labeled.** The chaincode checks the calling identity's MSP (`ctx.clientIdentity.getMSPID()`) against `Org1MSP` (Lender Consortium) or `Org2MSP` (Regulator) before allowing state-changing lender or regulator actions — enforced by the network's cryptographic identity, not a checkbox in application code.

**Residual risks, acknowledged rather than hidden:** a forged or collusive buyer attestation can still create a bad receivable — no ledger can make false real-world data true; this is why buyer attestation is designed to eventually bind to Bangladesh Bank's e-KYC framework rather than a bare signature. Linked-entity flags can produce innocent false positives, which is exactly why they trigger human review instead of an automatic freeze.

---

## Governance

**Membership governance.** Lenders are explicitly onboarded/offboarded by the Regulator org (`OnboardLender`/`OffboardLender`) before they can transact; `RequestFinancing` checks the lender is both registered and `active` before evaluating a claim — the on-chain form of "only approved institutions can run participant nodes or submit financing claims."

**Business-network governance — no unilateral action.** The two-org endorsement policy means neither "a lender" nor "the regulator alone" can write state without the other organization's peer endorsing the transaction, on every state-changing call. Freezing or unfreezing a disputed receivable is restricted to the Regulator identity at the chaincode-permission layer, and still executes as a transaction subject to the channel's shared endorsement policy — matching the principle that Bangladesh Bank anchors the consortium but does not run it alone.

**Fraud containment governance — review, not auto-block.** `FlagLinkedEntity` records a flag; nothing auto-freezes a receivable when a flag is written — freezing is a separate, explicit `FreezeReceivable` action a regulator takes after review. Linked-entity signals can be innocent (shared registered agent, coincidental address), so an automatic block would risk unfairly freezing legitimate finance. The frontend's flag-clearing flow (`ClearFlagDialog`) keeps the "Clear flag" action disabled until **both** the penalty-fee acknowledgment (0.02% of the flagged invoice's value, pre-calculated) **and** a supporting document are provided — payment alone cannot clear a flag.

**Technical infrastructure governance.** No native coin, no public speculative token — the ledger entry is a registry record, not something an SME buys or trades.

**Auditability.** No institution can silently delete or rewrite a settled claim — corrections happen only through new signed events (`getHistoryForKey` in `GetReceivableHistory` exposes the full append-only history for a receivable to the regulator), and the Merkle anchor record exists specifically so a party outside the consortium can verify ledger integrity without needing access to private transaction contents.

---

## Smart Contract Functions

`chaincode/src/finclaimContract.ts`:

**Receivable lifecycle**
- `SubmitReceivable(receivableId, sellerId, buyerId, faceValue, invoiceHash)` — create a receivable in `PENDING`.
- `AttestBuyer(receivableId, buyerId)` — buyer confirms the obligation, moves it to `ACTIVE`.
- `SettleReceivable(receivableId)` — mark a receivable settled.

**Confidential partial-financing check**
- `RequestFinancing(receivableId, lenderId, amount, claimType, commitment)` — atomically checks remaining capacity and approves or rejects a claim, returning only the caller's own outcome and the new aggregate capacity.
- `GetReceivableCapacity(receivableId)` — public aggregate capacity remaining.
- `GetMyClaim(receivableId, lenderId)` — a lender's own claim only.
- `GetAllClaims(receivableId)` — full cross-lender breakdown, regulator-only.

**Governance & compliance**
- `OnboardLender` / `OffboardLender` / `GetLender` — consortium membership control.
- `FlagLinkedEntity(businessIdA, businessIdB, reason)` — records a beneficial-ownership contagion flag for human review.
- `FreezeReceivable` / `UnfreezeReceivable` — regulator-only dispute handling.
- `GetReceivableHistory(receivableId)` — full append-only history, regulator-only.
- `RecordMerkleAnchor(rootHash, eventCount, periodLabel)` — regulator-recorded ledger-integrity checkpoint.

---

## 📋 Features Implemented

### ✅ Core Features

- [x] Legally-aware receivable + claim data model (pledge vs. assignment)
- [x] Atomic confidential partial-financing check
- [x] Two-organization Fabric endorsement policy (Lender Consortium + Regulator)
- [x] Merkle-anchored ledger integrity checkpoints

### ✅ Security Features

- [x] AES-256-GCM off-chain invoice encryption
- [x] Hash-based claim-amount commitment scheme
- [x] Linked-entity contagion flag with human-review-only clearing
- [x] Regulator-only audit views (cross-lender claims, full receivable history)

### ✅ User Experience

- [x] Seller portal for receivable submission
- [x] Buyer confirmation flow to activate receivables
- [x] Lender dashboard with live capacity and claim status
- [x] Regulator view with full audit trail

## 🚧 On the Roadmap

- [ ] Live e-KYC / BIN / tax oracle integration for buyer attestation and onboarding
- [ ] Per-institution Fabric CA identities (currently one gateway identity per organization)
- [ ] Pedersen commitments + Bulletproofs-style range proofs, then a full zk-SNARK confidentiality circuit
- [ ] Broadcasting the Merkle anchor root to a public permissionless chain
- [ ] Validator Participation Bond for lender-run validating nodes (separate regulatory approval required)
- [ ] Per-institution HSM/KMS key management for document encryption

---

## Project Structure

```text
FinClaim/
├── frontend/               # Next.js + Tailwind + shadcn/ui demo application
│   └── src/
│       ├── app/            # App router pages
│       ├── components/     # UI + domain components
│       ├── hooks/          # React hooks
│       └── lib/            # Types, utils, fixture data
├── backend/                # Fabric Gateway client + invoice encryption service
│   └── src/
│       ├── fabric/          # Gateway connection and contract calls
│       └── services/        # AES-256-GCM crypto service
├── chaincode/              # Hyperledger Fabric smart contract (TypeScript)
│   └── src/
│       └── finclaimContract.ts
└── docs/                   # Whitepaper summary, prototype plan, phase handoff specs
```
