# FinClaim — Whitepaper Summary

**Team:** DeluluChain — Meherun Mehnaj Miti, Md. Mahidul Islam Mahi, Khondaker Zarifa Haque, MD. Samiul Islam Tamim, Habibur Rahman, Faiyaz-Ur Rahman
**Institution:** United International University
**Source:** `DeluluChain_Whitepaper.docx (5).pdf`, 18 August 2026

---

## 1. One-line pitch

A permissioned, regulator-supervised blockchain registry that lets competing banks/NBFIs check *"has this invoice already been pledged elsewhere, and how much financing room is left?"* — without exposing their client lists, pricing, or exact positions to each other.

## 2. The problem

- Receivable financing (factoring) lets an SME turn an unpaid invoice into cash today instead of waiting 30–90 days.
- Banks, NBFIs, and fintechs each keep **siloed** records. The same invoice can be pledged to more than one lender before anyone notices — **duplicate financing**, a recognized global trade-finance fraud pattern.
- Bangladesh's **Secured Transactions (Movable Property) Act, 2023** already mandates a national collateral registry for movable assets (incl. receivables). Three years on, it still hasn't been built — not because of missing legal mandate, but because **no single competitor wants to feed a shared database with sensitive data**.
- Simple document hashing doesn't solve this: lenders also need to know whether the *total* claimed amount exceeds the receivable's value (partial financing), and sharing exact amounts/positions creates a confidentiality problem between competitors.
- Fraud can span **linked/related companies**, not just one company reusing an ID (referencing real BD cases: Hallmark-Sonali, Crescent Group, the 2026 Premier Bank case — all involved networks of separately-registered companies secretly controlled by the same people).

## 3. The FinClaim solution

A permissioned, regulator-supervised **receivable claim registry**. It records the *financing state* of a receivable, not the full commercial document — actual invoices and business terms stay encrypted off-chain; the ledger stores only the minimum cryptographic evidence needed to prove identity, state, authorization, and available claim capacity.

Four mechanisms, combined around a Bangladesh-specific workflow:

| # | Mechanism | What it does |
|---|---|---|
| 1 | **Legally-aware Receivable Claim Object** | Distinguishes **pledge** (seller still owns the receivable, used as collateral) from **assignment** (ownership of the right to collect is transferred) — tracked as legally distinct events, not treated the same. |
| 2 | **Confidential Partial-Financing Proof** | Before approving a new claim: "do existing claims + this new one stay within the receivable's value?" → returns **TRUE/FALSE only**, without revealing exact amounts to other lenders. Prototype-level crypto: Pedersen commitments + Bulletproofs-style range proofs (full zk-SNARK explicitly deferred to production). |
| 3 | **Linked-entity ("beneficial-ownership contagion") flag** | Flags claims connected via shared directors, signatories, or addresses — not just matching registration numbers. A flag triggers **human review**, not an automatic block. |
| 4 | **Supervisory consortium + public Merkle audit anchor** | Bangladesh Bank anchors the consortium but doesn't run it alone or act unilaterally; a periodic Merkle root is published to a **public** blockchain so outside auditors can verify nothing was secretly altered, without seeing private data. |

## 4. Receivable lifecycle

```
Seller submits receivable (metadata + encrypted invoice)
        │
        ▼
Buyer confirms the debt is real (attestation, tied to e-KYC in production;
mocked in the Olympiad prototype)
        │
        ▼
Oracle checks (identity/BIN/tax where available) — status: PENDING
        │
        ▼
Receivable → ACTIVE
        │
        ▼
Lender requests pledge/assignment → confidential capacity check
        │
   ┌────┴────┐
 TRUE       FALSE
   │           │
Claim written  Rejected — requester learns only "not eligible",
on-chain,      never sees other lenders' amounts
capacity
updated
atomically
        │
        ▼
Settle/release  ──or──  Dispute confirmed → FROZEN/DISPUTED state
                          + linked-entity review triggered
```

### Flagship demo scenario (used throughout the whitepaper as the core proof point)

> Receivable = **BDT 1,000,000**, buyer-attested, status ACTIVE.
> - Bank A requests **400,000** → capacity check → **TRUE** → approved. Capacity remaining: 600,000.
> - Bank B requests **300,000** → **TRUE** → approved. Capacity remaining: 300,000.
> - Bank C requests **500,000** → **FALSE** → rejected (exceeds remaining 300,000).
>
> Bank C never learns Bank A's or Bank B's specific amounts — only that its own request is ineligible, and the aggregate remaining capacity (300,000) is visible to everyone as part of normal ledger state.

## 5. Key features (as listed in the whitepaper)

1. **Receivable Claim Object** — one digital record per verified receivable (status, claim type, cryptographic proof); actual invoice stays off-chain/encrypted.
2. **Pledge vs. Assignment Logic** — see mechanism 1 above.
3. **Confidential Partial-Financing Proof** — see mechanism 2 above.
4. **Buyer Identity Binding & Attestation** — buyer must confirm via verified digital identity (tied to Bangladesh Bank's e-KYC framework in production); Olympiad prototype uses a **clearly labeled mock**.
5. **Lender & Regulator Dashboards** — lenders see only their own claim history/status; regulators see the full consortium picture (flagged vs. clean invoices, on-chain logs, linked-entity alerts) without seeing any lender's pricing or client details.
6. **Validator Participation Bond (proposed, not in MVP)** — lenders running a validating node would stake ~BDT 1,000,000 as a commitment to honest participation. Design proposal only; needs separate regulatory/legal approval.
7. **Beneficial-Ownership Contagion Flag** — see mechanism 3 above.
8. **Public Audit Anchor** — see mechanism 4 above.
9. **Redundant Off-Chain Evidence Storage** — each institution stores its own encrypted copy of invoices, linked by the same cryptographic fingerprint; no single storage provider can lose/withhold evidence during a dispute.
10. **No Public Crypto Asset** — the "claim token" is a registry entry, not a cryptocurrency; not something SMEs buy/trade; not a way around financial regulation.

## 6. Architecture (4 layers)

| Layer | Location | Contents |
|---|---|---|
| 1. Actors & Inputs | Off-chain | SME/Seller portal, Buyer confirmation, Lender dashboard, Regulator supervision view |
| 2. Processing & Middleware | Off-chain | API & routing gateway (REST/GraphQL, access control, request routing), Identity & Oracle gateway (KYC/KYB, tax/trade license checks) |
| 3. Core Protocol | **On-chain** | Smart contracts / permissioned ledger: legally-aware claim object (pledge/assignment), confidential capacity control, linked-entity fraud containment engine, access control & event logs |
| 4. External Services | Off-chain | Encrypted document store (actual invoices/business terms), ZK proof / confidentiality service (privacy layer), public Merkle anchor (independently verifiable audit trail) |

**Module responsibilities:**
- **SME/Seller Portal** — submits receivable metadata + encrypted invoice evidence; tracks verification/settlement status.
- **Buyer Attestation** — confirms the receivable exists and the payment obligation is recognized, before activation.
- **Lender Interface** — banks/NBFIs/fintechs query eligibility and submit pledge/assignment claims without full visibility into competitors' positions.
- **Backend/API Gateway** — authenticated requests, document workflow, integrations, non-consensus logic.
- **Oracle Gateway** — connects identity/BIN/tax/credit checks where legally/technically available (mocked in prototype, clearly labeled as such).
- **Permissioned Ledger + Smart Contracts** — canonical receivable state, signed claim events, status transitions, capacity rules.
- **Encrypted Off-chain Store** — invoices/contracts/notices kept encrypted; only fingerprints/commitments referenced on-chain.
- **ZK/Confidentiality Service** — proves a financing amount is within remaining capacity without disclosing unnecessary values.
- **Public Anchor** — periodic Merkle root/timestamp commitment so outside auditors can verify historical integrity without joining the private network.

## 7. Governance and trust

- Only approved institutions can run participant nodes or submit financing claims; identities tied to institutional certificates.
- Smart contracts enforce one shared lifecycle and atomic capacity updates for every participant.
- **Bangladesh Bank anchors the consortium — it doesn't run it alone**, and isn't a commercial lender on the network. Freezing/unfreezing a claim or resolving a dispute needs Bangladesh Bank **plus** a rotating panel of consortium members — never one institution acting unilaterally.
- No institution can silently delete or rewrite a settled claim; corrections happen only through new signed events that preserve prior history.
- No native coin, no public speculative token. Any institutional participation bond/penalty mechanism is outside the MVP and would need separate regulatory/legal design.
- Disputed claims enter a **FROZEN/DISPUTED** state; release/reversal/write-off requires authorized signatures and a visible audit reason.
- Security model assumes a **bounded number of participating nodes can be faulty/colluding** at any time (standard permissioned-BFT assumption, e.g. tolerating f-of-3f+1) — not that collusion is impossible. Merkle-root anchoring on a fixed cadence (e.g. hourly); history within an unanchored window carries disclosed residual risk.

## 8. Privacy & security (whitepaper's own Q&A)

- **Is business/identity privacy addressed?** Yes, via data minimization, not by publishing the invoice. Raw documents/prices/contracts stay encrypted off-chain; the ledger stores identifiers, hashes/commitments, authorization, state, timestamps. Institution-level access is permissioned.
- **Can a lender verify capacity without seeing competitors' exact positions?** Yes, in the prototype itself — Pedersen commitments + Bulletproofs-style range proofs prove "existing claims + new one ≤ receivable value," returning TRUE/FALSE without revealing numbers. Full zk-SNARK circuit is the stated **production** upgrade, after a pilot.
- **Key management?** Production: enterprise key management/HSMs, certificate rotation, recovery procedures. Demo wallets acceptable **only** for the prototype, and must be labeled as such.
- **Access control?** SMEs view only their own receivables; buyers attest only to obligations involving them; lenders query/claim per role permissions; the supervisor audits/freezes under defined governance; independent auditors need only the public anchor to verify ledger integrity, not private transaction contents.
- **Residual risks acknowledged:** blockchain does not remove phishing, compromised keys, corrupt insiders, bad oracle data, or legal disputes — mitigated via cryptographic controls **combined with** institutional governance, audit, incident response, human review.

## 9. Risks disclosed (whitepaper's own risk register)

| Risk | Description |
|---|---|
| Adoption | Registry only creates value with enough lender participation; a small network leaves fraud paths outside the consortium. |
| Regulatory/Legal | A ledger record doesn't automatically create legal priority or enforceability; factoring/assignment/privacy/evidentiary rules must align with BD law. |
| Oracle & Collusion | A forged or collusive buyer confirmation can still create a bad receivable — blockchain cannot make false real-world data true. |
| Privacy | Even with raw invoices off-chain, transaction timing and repeated entity activity can leak business metadata. |
| Technical Execution | Bulletproofs-style range proofs, smart contracts, key management add implementation complexity; a full zk-SNARK circuit (production) adds further complexity. |
| False-Flag | Linked-entity alerts may produce innocent associations; automatic blocking could unfairly freeze legitimate finance (hence: human review, not auto-block). |

**Mitigations:** phased pilot, minimal on-chain data, independent security review, buyer attestation, role-based access, manual review of contagion alerts. Regulator-led pilot via Bangladesh Bank's RFFO with 3–5 willing banks/NBFIs/fintechs before national rollout. Phased privacy: prototype the capacity logic first, demonstrate a privacy-preserving YES/NO interface, then move to a fully audited ZK circuit before production.

## 10. Competition

- **Contour/Corda-based LC projects** — already used in Bangladesh, but focused on letters of credit, not a domestic receivable claim registry.
- **Bangladesh Bank's CIB** — borrower-level credit info, not asset-level "who has claimed this receivable?" state.
- **MonetaGo (Singapore)** — strongest international benchmark; directly targets duplicate financing + privacy-preserving verification. FinClaim doesn't claim to invent invoice registries — its case rests on the **Bangladesh-specific operating model** plus the four mechanisms above.
- **TReDS, RXIL, M1xchange, Taulia, C2FO** (benchmark table) — receivables/working-capital marketplaces; blockchain and privacy mechanism are explicitly **not** core to their proposition, unlike FinClaim.

## 11. Business model & financials

**Model:** Public Infrastructure (Regulatory SaaS) — FinClaim licenses the platform to Bangladesh Bank; commercial banks and large businesses pay for services.

**Revenue streams:**
- **Verification fees** (primary income) — flat BDT 100–300 per registry query.
- **Penalty & flag-removal fees** — 0.02% of the flagged invoice's value, charged to remove a double-financing flag.
- **Enterprise subscriptions** — large corporate buyers with high-volume ERP-integrated invoice uploads pay a fixed monthly fee.

**2-Year projection (BDT Lakhs, 1 Lakh = 100,000 BDT):**

| | Y1 H1 | Y1 H2 | Y2 H1 | Y2 H2 |
|---|---|---|---|---|
| Invoices verified | 1,000 | 5,000 | 20,000 | 75,000 |
| Total revenue | 8.5 | 26.0 | 87.0 | 245.0 |
| Total expenses | 50.0 | 60.0 | 100.0 | 150.0 |
| Net profit/(loss) | (41.5) | (34.0) | (13.0) | **+95.0** |

**Break-even:** ~Month 21, when a Bangladesh Bank regulatory mandate is assumed to make FinClaim checks mandatory for factoring loans, spiking verification volume.

**Market sizing:** TAM ৳20 crore/year (all BD banks/NBFIs/fintechs/factoring cos/large buyers) · SAM ৳8 crore/year (realistically serviceable near-term) · SOM ৳3.32 crore/year (Year-2 obtainable, early adopters).

**Scaling phases:** (1) Pilot & Proof, months 1–12, 2–3 partner banks; (2) Regulatory Mandate, months 12–24, BB makes the check mandatory; (3) Regional Trade, years 2–4, cross-border export/import invoices.

## 12. Alignment & SDGs

Aligns with the 2026 BNP government's digital-economy roadmap (ICT ~5–10% of GDP by 2036, 1M ICT jobs, national e-wallet, banking-sector discipline) and interoperates with — rather than newly proposes — the existing 2023 Secured Transactions Act mandate. Maps to **SDG 8** (decent work/economic growth via SME liquidity), **SDG 9** (industry/innovation/infrastructure), **SDG 10** (reduced inequalities via lower verification friction), **SDG 16** (peace/justice/strong institutions via immutable logs + audit).

## 13. Why blockchain (the whitepaper's own justification)

A conventional central database *could* solve the basic duplicate-claim problem — if every lender trusted one operator and regulation forced universal participation. The blockchain case is narrower: several **competing** institutions need one shared state machine, no single lender should be able to rewrite history, and the rules for creating/claiming/releasing/settling a receivable must execute identically for every participant. A permissioned ledger with cryptographic accountability per participant removes the *excuse*, not the *requirement*, to cooperate — the consortium model succeeds where the Act's single centrally-administered registry stalled, because no individual bank/NBFI has a competitive incentive to feed a shared system accurate data unilaterally.
