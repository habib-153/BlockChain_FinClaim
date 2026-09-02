# FinClaim — Whitepaper Summary

**Team:** DeluluChain — Meherun Mehnaj Miti, Md. Mahidul Islam Mahi, Khondaker Zarifa Haque, MD. Samiul Islam Tamim, Habibur Rahman, Faiyaz-Ur Rahman
**Institution:** United International University · **Team ID:** 6a8345f5ab2e0
**Source:** `DeluluChain_Whitepaper_Updated.docx.pdf` (updated version; internally still dated 18 August 2026)
**Subtitle used in the updated doc:** "Confidential Claim Infrastructure for Receivable Finance — A privacy-preserving multi-lender protocol for confidential partial financing and cross-entity fraud containment."

> This file tracks the whitepaper's content. See `prototype-plan.md` for what the team is actually building for the Olympiad deadline and where the build intentionally diverges from or simplifies this document.

---

## 1. One-line pitch

A permissioned, regulator-supervised blockchain registry that lets competing banks/NBFIs check *"has this invoice already been pledged elsewhere, and how much financing room is left?"* — without exposing their client lists, pricing, or exact positions to each other.

## 2. The problem

1. The same receivable can be presented to multiple lenders before any of them can see the other claim.
2. A genuine invoice can still become risky if its financing status is hidden across institutions.
3. Simple document hashing doesn't solve partial financing — lenders also need to know whether the *total* claimed amount exceeds the receivable's value.
4. Sharing full invoice values and lender positions creates a confidentiality problem between competitors.
5. Fraud can spread across linked companies or repeated transactions, so checking one invoice at a time can miss a wider pattern.
6. Bangladesh has seen major banking fraud involving falsified documents and multiple related entities (Hallmark-Sonali, Crescent Group, the 2026 Premier Bank case). The whitepaper is careful to note these are **not proof of domestic factoring double-pledging specifically** — they're cited to show why cross-institution verification and auditability matter.
7. The **Secured Transactions (Movable Property) Act, 2023** already legally mandates a national collateral registry for movable assets, including receivables. As recently as weeks before this paper was written, practitioners were still publicly calling for a working registry — three years on. The gap isn't a missing legal mandate; it's the absence of a working implementation.

## 3. The FinClaim solution

A permissioned, regulator-supervised **receivable claim registry**. It records the *financing state* of a receivable, not the full commercial document — actual invoices and business terms stay encrypted off-chain; the ledger stores only the minimum cryptographic evidence needed to prove identity, state, authorization, and available claim capacity.

Four mechanisms, combined around a Bangladesh-specific workflow:

| # | Mechanism | What it does |
|---|---|---|
| 1 | **Legally-aware Receivable Claim Object** | Distinguishes **pledge** (seller still owns the receivable, used as collateral) from **assignment** (ownership of the right to collect is transferred) — tracked as legally distinct events. |
| 2 | **Confidential Partial-Financing Proof** | Before approving a new claim: "do existing claims + this new one stay within the receivable's value?" → returns **TRUE/FALSE only**, without revealing exact amounts to other lenders. Prototype-level crypto: Pedersen commitments + Bulletproofs-style range proofs — described as "a proven, audit-ready cryptographic method" already used "in the prototype itself, not just as a target." Full zk-SNARK explicitly deferred to production. |
| 3 | **Linked-entity ("beneficial-ownership contagion") flag** | Flags claims connected via shared directors, signatories, or addresses — not just matching registration numbers. A flag triggers **human review**, not an automatic block. Clearing a flag now requires **both** a penalty payment (0.02% of the flagged invoice's value) **and** reviewer-verified documentation — payment alone does not clear it. |
| 4 | **Supervisory consortium + public Merkle audit anchor** | Bangladesh Bank anchors the consortium but doesn't run it alone or act unilaterally; a periodic Merkle root is published to a **public** blockchain so outside auditors can verify nothing was secretly altered, without seeing private data. |

## 4. Impact (new section in the updated whitepaper)

The direct beneficiary isn't "blockchain users" — it's an SME that can turn a verified future payment into working capital more safely, and a lender that can verify the asset without asking competitors to reveal client-sensitive details. Four areas of expected impact: safer SME liquidity, lower duplicate-financing risk, better cross-institution auditability, and a reusable digital claim infrastructure that could later support other assets with the same "one right, multiple potential claimants" problem.

## 5. Government alignment & SDGs

The current BNP-led government took office in February 2026. Its technology platform and FY2026-27 budget emphasize: ICT reaching ~5–10% of GDP by 2036, ~1M ICT jobs (including cybersecurity/AI/BPO roles), a national e-wallet, cash-light digital services, financial inclusion, and banking-sector discipline. The whitepaper is explicit that **FinClaim is not a government project and claims no official endorsement** — the alignment section shows where the proposed infrastructure *supports* stated public-policy goals, not that it's mandated by them. It also explicitly interoperates with — rather than newly proposes — the existing 2023 Secured Transactions Act mandate.

Maps to **SDG 8** (SME liquidity/employment), **SDG 9** (shared digital financial infrastructure without surrendering data control), **SDG 10** (lower verification friction for smaller/less-connected borrowers, though inclusion still depends on lender policy/pricing), **SDG 16** (immutable logs + supervisory access + audit anchoring support institutional transparency).

## 6. Why blockchain (the whitepaper's own justification)

A conventional central database *could* solve the basic duplicate-claim problem — if every lender trusted one operator and regulation forced universal participation. The blockchain case is narrower: several **competing** institutions need one shared state machine, no single lender should be able to rewrite history, and the rules for creating/claiming/releasing/settling a receivable must execute identically for every participant.

The updated whitepaper reframes this explicitly as a **regulatory ask, not a novelty pitch**: FinClaim isn't requesting new regulatory attention for an unfamiliar idea — it's proposing to interoperate with, and help fulfil, the existing 2023 Act mandate. The consortium model succeeds where the Act's single centrally-administered registry stalled, because no individual bank/NBFI has a competitive incentive to feed a shared system accurate data unilaterally. A permissioned ledger with cryptographic accountability per participant removes the *excuse*, not the *requirement*, to cooperate.

## 7. Opportunities (new section in the updated whitepaper)

- **National:** Bangladesh Bank already runs modern payment infrastructure, e-KYC guidance, digital-bank guidelines, cybersecurity rules, and a Regulatory FinTech Facilitation Office (RFFO) that accepts pilot proposals. Banks/NBFIs already offer factoring products, and Bangladesh already has live blockchain trade-finance LC experience (HSBC, Standard Chartered, City Bank) — so a receivable-registry pilot doesn't require building institutional readiness from zero.
- **International:** Duplicate financing is an acknowledged global trade-finance risk. ITFA's fraud-prevention work recommends wider use of third-party duplicate-invoice registries; MonetaGo's Secure Financing platform proves shared fraud-prevention registries can work across institutions. These validate the problem while confirming FinClaim isn't globally first — its differentiation is the Bangladesh domestic use case plus privacy-preserving partial claims, pledge-vs-assignment logic, supervisory design, and linked-entity containment.

## 8. Receivable lifecycle

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

### New in the updated whitepaper: why the outcome isn't arbitrary when requests race

If Bank B's (300,000) and Bank C's (500,000) requests arrive close enough together that *processing order*, not eligibility, would decide the winner — e.g. after Bank A's 400,000 is already approved, leaving 600,000 remaining, and both B and C individually fit within 600,000 but not together (800,000 > 600,000) — the contract doesn't need special-case logic. Blockchain transactions are ordered, not simultaneous: whichever request the network confirms first is evaluated against the live balance and approved, atomically updating capacity; the second is then evaluated against the *new* balance and rejected. Whichever of the two is processed first wins — decided purely by processing order, not by who clicked first, and with no race condition because the contract only ever sees one canonical ordered state.

## 9. Key features (as listed in the whitepaper)

1. **Receivable Claim Object** — one digital record per verified receivable (status, claim type, cryptographic proof); actual invoice stays off-chain/encrypted.
2. **Pledge vs. Assignment Logic** — see mechanism 1 above.
3. **Confidential Partial-Financing Proof** — see mechanism 2 above.
4. **Buyer Identity Binding & Attestation** — buyer must confirm via verified digital identity (tied to Bangladesh Bank's e-KYC framework in production), not just a signature — closing the loophole of an invented fake buyer validating a fraudulent invoice. Olympiad prototype uses a **clearly labeled mock**.
5. **Lender & Regulator Dashboards** — lenders see only their own claim history/status; regulators see the full consortium picture (flagged vs. clean invoices, on-chain logs, linked-entity alerts) without seeing any lender's pricing or client details.
6. **Validator Participation Bond (proposed, not in MVP)** — lenders running a validating node would stake ~BDT 1,000,000 as a commitment to honest participation. Design proposal only; needs separate regulatory/legal approval; custody/enforcement/staking mechanics unresolved.
7. **Beneficial-Ownership Contagion Flag** — see mechanism 3 above. **Updated:** clearing a flag requires both the penalty fee *and* reviewer-verified documentation (e.g. corrected buyer attestation, proof of clerical/system error, evidence the claim wasn't fraudulent) — payment alone does not clear it.
8. **Public Audit Anchor** — see mechanism 4 above.
9. **Redundant Off-Chain Evidence Storage** — each institution stores its own encrypted copy of invoices, linked by the same cryptographic fingerprint; no single storage provider can lose/withhold evidence during a dispute.
10. **No Public Crypto Asset** — the "claim token" is a registry entry, not a cryptocurrency; not something SMEs buy/trade; not a way around financial regulation.

## 10. Architecture (4 layers)

| Layer | Location | Contents |
|---|---|---|
| 1. Actors & Inputs | Off-chain | SME/Seller portal, Buyer confirmation, Lender dashboard, Regulator supervision view |
| 2. Processing & Middleware | Off-chain | API & routing gateway (REST/GraphQL, access control, request routing), Identity & Oracle gateway (KYC/KYB, tax/trade license checks) |
| 3. Core Protocol | **On-chain** | Smart contracts / permissioned ledger: legally-aware claim object (pledge/assignment), confidential capacity control, linked-entity fraud containment engine, access control & event logs |
| 4. External Services | Off-chain | Encrypted document store (actual invoices/business terms), ZK proof / confidentiality service (privacy layer), public Merkle anchor (independently verifiable audit trail) |

**Module responsibilities:** SME/Seller Portal (submits metadata + encrypted invoice, tracks status) · Buyer Attestation (confirms obligation before activation) · Lender Interface (queries eligibility, submits claims without full competitor visibility) · Backend/API Gateway (authenticated requests, document workflow, non-consensus logic) · Oracle Gateway (identity/BIN/tax/credit checks, mocked in prototype) · Permissioned Ledger + Smart Contracts (canonical state, signed events, capacity rules) · Encrypted Off-chain Store (fingerprints/commitments referenced on-chain) · ZK/Confidentiality Service (proves capacity without disclosing values) · Public Anchor (periodic Merkle root/timestamp for outside auditors).

### New in the updated whitepaper: "Prototype: Adherence to Decentralized Application Design"

This is a substantial new section that directly targets the guideline's Architecture judging criterion, framed around a litmus test the paper states explicitly: *"If a centralized database or a single trusted operator could resolve the friction without introducing a single point of failure or conflict of interest, the inclusion of a blockchain would be superfluous."* Six claimed adherence points:

1. **Neutral State Management (Consortium Consensus)** — competing lenders and the regulator act as validating nodes; state transitions (e.g. Verified → Pledged) run through consensus rather than a central server dictating truth. *Note: this passage describes FinClaim as "an EVM-compatible permissioned consortium" — this conflicts with the team's actual implementation choice of Hyperledger Fabric (non-EVM, chosen specifically to avoid Solidity). The team decided (3 Sept) to keep Fabric and treat this wording as inaccurate/aspirational phrasing to be corrected in the whitepaper's next revision, not a binding architecture change — see `prototype-plan.md` §0/§3.*
2. **Deterministic Smart Contract Execution** — the pledge/assignment distinction and the atomic capacity check run on-chain, not in backend APIs, removing central administrative bias from the core business logic.
3. **Zero-Knowledge Privacy-by-Design** — Pedersen commitments prove eligibility without exposing competitors' exact positions, client identities, or lending volumes.
4. **Decentralized & Off-Chain Storage Orchestration** — raw invoices/contracts live in encrypted off-chain object storage; only immutable hashes are anchored on-chain.
5. **Trustless External Data via Oracle Gateways** — e-KYC/KYB, trade-license validation, and buyer attestations are bridged on-chain via oracles before a receivable becomes an active claim object.
6. **Public Merkle Anchoring for Verifiability** — permissioned-consortium block root hashes are periodically anchored to a public, permissionless chain, so a colluding consortium majority can't secretly alter history.

## 11. Governance and trust

- Only approved institutions can run participant nodes or submit financing claims; identities tied to institutional certificates.
- Smart contracts enforce one shared lifecycle and atomic capacity updates for every participant.
- **Bangladesh Bank anchors the consortium — it doesn't run it alone**, and isn't a commercial lender on the network. Freezing/unfreezing a claim or resolving a dispute needs Bangladesh Bank **plus** a rotating panel of consortium members — never one institution acting unilaterally.
- No institution can silently delete or rewrite a settled claim; corrections happen only through new signed events that preserve prior history.
- No native coin, no public speculative token. **Updated distinction:** the Validator Participation Bond (custody/enforcement/staking mechanics, separate regulatory/legal design needed) is explicitly **outside the MVP**. This does **not** apply to the Penalty & Flag Removal fee, which the whitepaper now states **is part of the MVP** and does not involve holding institutional collateral — it's a one-off fee tied to clearing a specific flag, not a staked bond.
- Disputed claims enter a **FROZEN/DISPUTED** state; release/reversal/write-off requires authorized signatures and a visible audit reason.
- Security model assumes a **bounded number of participating nodes can be faulty/colluding** at any time (standard permissioned-BFT assumption, e.g. tolerating f-of-3f+1) — not that collusion is impossible. Merkle-root anchoring on a fixed cadence (e.g. hourly); history within an unanchored window carries disclosed residual risk.

## 12. Privacy & security (whitepaper's own Q&A)

- **Is business/identity privacy addressed?** Yes, via data minimization, not by publishing the invoice. Raw documents/prices/contracts stay encrypted off-chain; the ledger stores identifiers, hashes/commitments, authorization, state, timestamps. Institution-level access is permissioned.
- **Can a lender verify capacity without seeing competitors' exact positions?** Yes, "in the prototype itself, not just as a target" — Pedersen commitments + Bulletproofs-style range proofs prove "existing claims + new one ≤ receivable value," returning TRUE/FALSE without revealing numbers. Full zk-SNARK circuit is the stated **production** upgrade, after a pilot.
- **Key management?** Production: enterprise key management/HSMs, certificate rotation, recovery procedures. Demo wallets acceptable **only** for the prototype, and must be labeled as such.
- **Access control?** SMEs view only their own receivables; buyers attest only to obligations involving them; lenders query/claim per role permissions; the supervisor audits/freezes under defined governance; independent auditors need only the public anchor to verify ledger integrity, not private transaction contents.
- **Residual risks acknowledged:** blockchain does not remove phishing, compromised keys, corrupt insiders, bad oracle data, or legal disputes — mitigated via cryptographic controls **combined with** institutional governance, audit, incident response, human review.

## 13. Risks disclosed (whitepaper's own risk register)

| Risk | Description |
|---|---|
| Adoption | Registry only creates value with enough lender participation; a small network leaves fraud paths outside the consortium. |
| Regulatory/Legal | A ledger record doesn't automatically create legal priority or enforceability; factoring/assignment/privacy/evidentiary rules must align with BD law and regulator guidance. |
| Oracle & Collusion | A forged or collusive buyer confirmation can still create a bad receivable — blockchain cannot make false real-world data true. |
| Privacy | Even with raw invoices off-chain, transaction timing and repeated entity activity can leak business metadata. |
| Technical Execution | Bulletproofs-style range proofs, smart contracts, key management add implementation complexity that can itself create new vulnerabilities; a full zk-SNARK circuit (production) adds further complexity on top. |
| False-Flag | Linked-entity alerts may produce innocent associations; automatic blocking could unfairly freeze legitimate finance (hence: human review, not auto-block). |

**Mitigations:** phased pilot, minimal on-chain data, independent security review, buyer attestation via credentialed DID (not a bare signature), role-based access, manual review of contagion alerts, clearly-marked mock data sources. Regulator-led pilot via Bangladesh Bank's RFFO with 3–5 willing banks/NBFIs/fintechs before national rollout. Phased privacy: prototype the capacity logic first, demonstrate a privacy-preserving YES/NO interface, then move to a fully audited ZK circuit before production.

## 14. Competition

- **Contour/Corda-based LC projects** — already used in Bangladesh, but focused on letters of credit, not a domestic receivable claim registry.
- **Bangladesh Bank's CIB** — borrower-level credit info, not asset-level "who has claimed this receivable?" state.
- **MonetaGo (Singapore)** — strongest international benchmark; directly targets duplicate financing + privacy-preserving verification. FinClaim doesn't claim to invent invoice registries — its case rests on the **Bangladesh-specific operating model** plus the four mechanisms above.

## 15. Business model & financials

**Model:** Public Infrastructure (Regulatory SaaS) — FinClaim licenses the platform to Bangladesh Bank; commercial banks and large businesses pay for services. Keeps FinClaim's own costs low (heavy data processing happens on the banks' own nodes) while creating predictable recurring revenue.

**Revenue streams:**
- **Verification fees** (primary income) — flat BDT 100–300 per registry query.
- **Penalty & flag-removal fees** — 0.02% of the flagged invoice's value, **plus** supporting documentation demonstrating good-faith innocence, both required to clear a double-financing flag; payment alone does not clear it.
- **Enterprise subscriptions** — large corporate buyers with high-volume ERP-integrated invoice uploads pay a fixed monthly fee.

**2-Year projection (BDT Lakhs, 1 Lakh = 100,000 BDT) — now broken out by revenue line in the updated whitepaper:**

| | Y1 H1 | Y1 H2 | Y2 H1 | Y2 H2 |
|---|---|---|---|---|
| Invoices verified | 1,000 | 5,000 | 20,000 | 75,000 |
| Active enterprise subscribers | 2 | 5 | 15 | 30 |
| Verification query fees | 2.0 | 10.0 | 40.0 | 150.0 |
| Enterprise ERP subscriptions | 6.0 | 15.0 | 45.0 | 90.0 |
| Penalty & flag-removal fees | 0.5 | 1.0 | 2.0 | 5.0 |
| **Total revenue** | **8.5** | **26.0** | **87.0** | **245.0** |
| Total expenses | 50.0 | 60.0 | 100.0 | 150.0 |
| Net profit/(loss) | (41.5) | (34.0) | (13.0) | **+95.0** |

**Break-even:** ~Month 21, when a Bangladesh Bank regulatory mandate is assumed to make FinClaim checks mandatory for factoring loans, spiking verification volume.

**Scaling phases:** (1) Pilot & Proof, months 1–12, 2–3 partner banks; (2) Regulatory Mandate, months 12–24, BB makes the check mandatory; (3) Regional Trade, years 2–4, cross-border export/import invoices.

## 16. References worth knowing for Q&A

The updated whitepaper's reference list adds several real-world duplicate-financing cases useful for defending "this problem is real, not hypothetical" under questioning: **First Brands Group's** 2025–2026 Chapter 11 collapse amid ~$2.3B in alleged double-pledged receivables; **Stenn's** December 2024 administration after HSBC alleged mismatched invoice-financing recipients; **Tricolor Holdings**, cited alongside First Brands in coverage of duplicate-invoice risk in supply chains. These sit alongside the existing Bangladesh cases (Hallmark-Sonali, Crescent Group, 2026 Premier Bank) and the domestic legal citations (Secured Transactions (Movable Property) Act 2023, Bangladesh Bank RFFO/e-KYC/factoring guidance).

---

**See also:** `prototype-plan.md` for the current build strategy, the disclosed gaps between this document and what's actually being demoed, and the resolution of the Fabric-vs-"EVM-compatible" wording conflict noted in §10 above.
