# Phase 2 Handoff — Best-Effort Live Blockchain Proof

**Self-contained.** Read `CLAUDE.md` at the repo root first. **Prerequisite: Phase 1 (`docs/handoff/phase-1-frontend.md`) should already be demo-ready before this starts** — check `PROJECT_STATUS.md` to confirm before investing time here.

## Why this phase exists

The BCOLBD guideline's mandatory gate (`BLOCKCHAIN OLYMPIAD BANGLADESH Blockchain Guideline (2).pdf`, Prototype Evaluation §2A) requires: *"Back-end: prototype must write to a blockchain"* — pass/fail, independent of UI quality. Phase 1's frontend runs entirely on static fixtures and does not satisfy this on its own. This phase is a bounded, best-effort attempt to close that gap — not a full production build.

## Goal (minimum bar)

**One real transaction submitted and queried from a live Hyperledger Fabric network, from a Node script.** That alone, captured on video/screenshot, is enough to honestly claim "the back-end writes to a blockchain" — it does not need to be wired into the Phase 1 frontend for this round.

## Starting point already in the repo

- `chaincode/` — a draft Fabric chaincode contract (TypeScript), already has `fabric-contract-api`/`fabric-shim` dependencies installed, builds to `chaincode/dist/`. Treat as an unreviewed draft — check it actually implements a sensible receivable/claim lifecycle before trusting it; it predates the current plan.
- `backend/src/fabric/gateway.ts` — a partial Fabric gateway connection helper.
- `backend/src/services/crypto.ts` — presumably the AES-256-GCM invoice-encryption helper.

## Environment (last known status — verify, don't assume)

- Docker Desktop, Node, Git confirmed installed on the dev machine; WSL2 + Ubuntu distro present.
- Node.js 20 installed inside WSL via the no-sudo tarball method (sudo needs an interactive password unavailable in that session).
- `fabric-samples` (including `test-network`) cloned into WSL's native filesystem at `~/finclaim/fabric-samples` — deliberately kept off `/mnt/c` because Fabric's bootstrap scripts are known to be unreliable over Windows-mounted paths.
- **Unconfirmed as of this doc being written:** whether Docker Desktop's WSL integration toggle for "Ubuntu" was ever enabled, and whether `test-network` was ever actually booted. Check `docker ps` from inside the WSL Ubuntu shell first — don't redo setup that's already done.

## Tasks

1. Confirm/enable Docker Desktop → Settings → Resources → WSL Integration → toggle on for the Ubuntu distro.
2. From inside WSL, boot `test-network` with a channel: `./network.sh up createChannel -ca` (from `~/finclaim/fabric-samples/test-network`).
3. Review `chaincode/src/` against the data model implied by `docs/whitepaper-summary.md` §3 and §8 (receivable states, pledge vs. assignment, capacity check) — fix or trim it if it doesn't match, but don't rewrite it wholesale unless it's fundamentally broken; the goal is one working transaction, not a perfect contract.
4. Deploy it via chaincode-as-a-service or the standard package/install/approve/commit flow.
5. Write (or fix) a small Node script using `backend/src/fabric/gateway.ts` that submits one transaction (e.g. create a receivable, or record a claim) and then queries it back.
6. Capture proof: terminal output or screen recording showing the submit + query succeeding against the live network.

## If time runs out

Stop and document honestly rather than faking it. In the Phase 3 documentation, say plainly: *"The prototype demonstrates the target architecture and a fully clickable frontend; live chaincode integration is implemented and proven via [artifact] but not wired into this build's frontend due to timeline"* — or, if even the minimum bar wasn't reached, *"live chaincode integration is documented in the architecture but not executed in this build."* A disclosed gap reads far better to judges than an unexplained one or, worse, a claim that doesn't hold up under questioning.

## When you're done

Update `PROJECT_STATUS.md`: record whether the minimum bar was hit, link/describe the proof artifact, note any chaincode changes made, and state that Phase 3 (`docs/handoff/phase-3-documentation.md`) is next — which needs to know the outcome of this phase either way.
