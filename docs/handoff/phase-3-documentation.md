# Phase 3 Handoff — Judge-Facing Technical Documentation

**Self-contained.** Read `CLAUDE.md` at the repo root first. Can start once Phase 1's data model/fixture roster is settled (doesn't strictly need Phase 1 or 2 fully finished, but needs to know their actual outcomes before finalizing — check `PROJECT_STATUS.md`).

## Goal

A single, polished document (`README.md` at repo root, or `docs/architecture.md` linked from it — pick one primary location and don't split the same content across both) that lets a judge who never sees the live demo still fully answer all four graded criteria. This is a submission requirement, not just nice-to-have — the guideline calls it "technical documentation."

## What it must cover, mapped to the actual rubric

Source: `BLOCKCHAIN OLYMPIAD BANGLADESH Blockchain Guideline (2).pdf`, Prototype Evaluation section. Write one clearly-headed section per criterion:

1. **Problem & Solution (40 pts)** — why blockchain over a conventional DB here specifically (several *competing* institutions needing one shared state machine, no single party trusted to rewrite history). Pull directly from `docs/whitepaper-summary.md` §6 ("Why blockchain") — it's already written for exactly this question. State the flagship scenario as the concrete proof point.
2. **Privacy & Security Risks (20 pts)** — data/identity privacy (data minimization, off-chain encrypted invoices), leak risk, key management, access control. Pull from `docs/whitepaper-summary.md` §12. Be explicit about what's real in this build vs. production-target (Pedersen/Bulletproofs is a production target per the whitepaper; this build's actual privacy enforcement is [state whatever Phase 1/2 actually did — per-lender data scoping in the frontend, and if Phase 2 happened, the hash-commitment approach from `docs/prototype-plan.md` §3]).
3. **Architecture (20 pts)** — name the real consensus setup. Lean heavily on `docs/whitepaper-summary.md` §10's "Prototype: Adherence to Decentralized Application Design" subsection — it already answers "how are transactions verified," "what's on/off-chain," "what's the data model" almost verbatim. **State plainly that this build uses Hyperledger Fabric** (peers/orderers/2-org endorsement policy — Org1 = Lender Consortium, Org2 = Regulator), and that the whitepaper's "EVM-compatible" phrase is being corrected in the next whitepaper revision — don't let a judge catch this inconsistency by reading both documents; get ahead of it in one sentence.
4. **Governance (20 pts)** — Org1/Org2 endorsement policy as the literal enforcement of "no unilateral action," regulator-only freeze/dispute, the linked-entity human-review flag (not auto-block), and the flag-clearing mechanism (penalty fee + verified docs, both required). Pull from `docs/whitepaper-summary.md` §11.

## Also include

- **State the mandatory-gate status honestly**: front-end ✅ (describe it), back-end — describe exactly what Phase 2 achieved (live transaction proof, or documented-but-not-executed — whichever is true by the time this is written). Do not imply a live connection that doesn't exist.
- **A short "what's simplified for this round vs. the whitepaper's full design" list** — reuse `docs/prototype-plan.md` §4 almost directly; judges penalize hidden gaps, not disclosed ones.
- **The demo script** (`docs/prototype-plan.md` §7) as an appendix or walkthrough section, so a reader can mentally trace the same flow the live presentation will show.

## Tone

Match the whitepaper's own voice: plain, confident, willing to say "not built yet" or "deferred to production" without hedging or over-explaining. Avoid marketing language beyond what the whitepaper itself uses.

## When you're done

Update `PROJECT_STATUS.md`: note where the document lives, confirm all four criteria are covered, and state that Phase 4 (`docs/handoff/phase-4-rehearsal.md`) is next.
