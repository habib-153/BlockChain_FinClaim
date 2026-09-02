# Phase 1 Handoff — Frontend Demo (Next.js, mock data, no backend)

**Self-contained.** This doc plus `CLAUDE.md` at the repo root is everything a fresh chat session needs to execute this phase — you should not need the conversation history that produced it.

## Goal

A polished, fully clickable Next.js app that walks through FinClaim's flagship receivable-financing scenario end-to-end, running entirely on in-repo fixture data. No backend calls, no chaincode calls. This is what gets presented to judges — it must look and feel like a finished, live product, not a wireframe or a slideshow.

## Hard constraints (repeated from `CLAUDE.md` — do not skip)

- **Nothing in the UI may say "mock," "demo," "sample," or similar.** No banners, no disclaimers, no `(demo)` suffixes on names. It must read as a real system.
- **No placeholder names anywhere** — no John Doe, Test User, Company A/B/C, Lorem Ipsum, example.com. Use the fixture roster in §3 below exactly; don't invent new placeholder-style names ad hoc.
- **Brand colors are FinClaim's own** (§2 below), extracted from the actual whitepaper logo/diagrams — not `auctra-product`'s colors.
- **`auctra-product` is a structural/UX reference only**: Next.js App Router layout, component folder conventions, and the "enter credential → brief loading state → land on your dashboard" login pattern. Do not carry over its visual branding.
- Frontend and backend are **not connected** this round — everything renders from local fixture modules.

## 1. Tech stack & setup

- Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui, inside the existing (currently empty) `frontend/` directory.
- Package manager: npm (matches `chaincode/`/`backend/` which already use npm — check `package-lock.json` conventions there before introducing pnpm/yarn).
- Init roughly as: `npx create-next-app@latest` (TypeScript, Tailwind, App Router, `src/` directory — say yes to all three) run *inside* `frontend/`, then `npx shadcn@latest init` and add components as needed (`button`, `card`, `table`, `badge`, `dialog`, `input`, `label`, `tabs`, `textarea`, `avatar`, `separator`, `sonner` or `toast`).

## 2. Brand

Source logo (transparent PNG, already in the repo): `frontend/public/brand/logo_v2.png`. Wordmark is "FinClaim", tagline "TRUST · VERIFY · TRANSACT". Extracted directly from the whitepaper's cover page and diagram headers (pixel-sampled, not guessed):

| Token | Hex | Use |
|---|---|---|
| `navy-950` | `#05122A` | darkest backgrounds, hover states on navy elements |
| `navy-900` | `#0B2340` | primary dark — sidebar, headers, primary text on light backgrounds |
| `teal-900` | `#0A3F3D` | dark alternate panel/header (matches the whitepaper diagram's "Users/Actors" header) |
| `teal-700` | `#0F6B67` | **primary brand color** — primary buttons, links, active nav state, "approved" accents |
| `emerald-500` | `#16B587` | accent gradient endpoint (matches the logo's green tip) — success states, "capacity available" indicators |
| `amber-600` | `#C2870A` | pending / in-progress / "awaiting attestation" status badges |
| `brick-500` | `#B5453F` | rejected / flagged / error states — deliberately a muted brick tone, not a bright alarm red, to match the whitepaper's own restrained palette |
| neutrals | Tailwind default `slate` scale | body text, borders, card backgrounds (white/`slate-50`) |

Wire these into `tailwind.config.ts` as named theme colors (e.g. `finclaim.navy900`, `finclaim.teal700`, ...) rather than hardcoding hex values in components. Typography: a clean system/sans stack (e.g. Inter, already shadcn's default) — the whitepaper's own type is a plain sans-serif, nothing distinctive to match there.

## 3. Fixture roster (use exactly this — don't invent alternates)

This is the one dataset every screen should agree with. Keep it in `frontend/src/lib/fixtures/`.

**Seller (SME):** Karnaphuli Garments Ltd., Chittagong. Authorized signatory: Nasrin Sultana. BIN: `002234567-0101`.

**Buyer (obligor):** Nordicwear Sourcing ApS, Copenhagen (export buyer on the flagship invoice).

**Lenders (three institutions — fictional but realistic; river-name convention keeps them clearly fictional without resembling any real BD bank):**
- Padma Bank PLC — Trade Finance Desk
- Jamuna Capital & Finance Ltd. — SME Finance Unit
- Meghna NBFI Ltd. — Receivables Finance Unit

**Regulator:** Bangladesh Bank, Financial Institutions Supervision Wing. Reviewer: Rezaul Karim. (This is the real central bank in its real supervisory role, per the whitepaper's own framing — not a fictional stand-in, so don't rename it.)

**Flagship receivable — `RCV-2026-04871`:** BDT 1,000,000, buyer-attested, status **ACTIVE**.
- Claim from Padma Bank PLC — Pledge — BDT 400,000 — **APPROVED** (submitted first)
- Claim from Jamuna Capital & Finance Ltd. — Assignment — BDT 300,000 — **APPROVED**
- Claim from Meghna NBFI Ltd. — Pledge — BDT 500,000 — **REJECTED**, reason shown to Meghna only: "Not eligible — exceeds available capacity." Meghna's own screen never shows Padma's or Jamuna's amounts.
- Capacity remaining after both approvals: BDT 300,000.

**Second receivable (for the live submit→attest walkthrough) — `RCV-2026-05102`:** Karnaphuli Garments Ltd. → Nordicwear Sourcing ApS, BDT 650,000, status **PENDING** (awaiting buyer attestation) — this is the one the presenter actually clicks through live (submit as Seller, attest as Buyer), while `RCV-2026-04871` demonstrates the already-settled multi-lender capacity story.

**Linked-entity flag (separate storyline, for the Regulator's review queue):** A claim from **Turag Apparel Solutions Ltd.** is flagged — it shares a director, **Mohammad Aminul Kabir**, with **Shitalakshya Fabrics Ltd.**, an entity with a prior disputed claim. Status: **PENDING_REVIEW**, not auto-blocked. Penalty fee to clear: BDT amount equal to 0.02% of the flagged invoice's value (compute from that claim's own invoice amount — pick something concrete, e.g. an BDT 800,000 invoice → BDT 160 fee, shown pre-calculated, not left for the user to compute).

**Audit/anchor log:** at least one Merkle anchor entry, e.g. `Anchor #128 — Root 0x7f3a…e91c — 2026-09-03 14:00 UTC — 42 events`, shown in the Regulator's audit log.

**Login directory (email → role; keep this mapping in a fixture file, never rendered in the UI as a hint list):**
| Email | Role/identity |
|---|---|
| `nasrin.sultana@karnaphuligarments.com` | Seller |
| `trade@nordicwearsourcing.dk` | Buyer |
| `tradefinance@padmabankplc.com` | Lender — Padma Bank PLC |
| `smefinance@jamunacapital.com.bd` | Lender — Jamuna Capital & Finance Ltd. |
| `receivables@meghnanbfi.com.bd` | Lender — Meghna NBFI Ltd. |
| `supervision@bb.gov.bd` | Regulator |

Match on email only (case-insensitive), accept any non-empty password — this keeps the live demo robust if the presenter mistypes a password on stage. Unknown emails should show a normal-looking "invalid credentials" error, not a hint about valid ones.

## 4. Auth flow (mock, but must feel real)

A real-looking login screen: email + password fields, "Sign in" button, maybe a "Forgot password?" link (non-functional, fine to leave as a dead link or omit if it raises questions). On submit: validate the email against §3's directory, show a brief loading state on the button (~700–1000ms, e.g. a spinner + "Signing in…" label — mirrors the `auctra-product` reference's pattern), then client-side redirect to that identity's dashboard route. Store the "session" (which fixture identity is active) in React context backed by `localStorage`, so a refresh doesn't bounce the presenter back to `/login` mid-demo. A logout control should clear it.

No JWT, no real hashing, no backend call — this is explicitly in-scope as a disclosed simplification in `docs/prototype-plan.md`, just never surfaced as such in the UI itself.

## 5. Folder structure (mirrors `monzim/auctra-product`'s Next.js layout conventions)

```
frontend/
  src/
    app/
      layout.tsx
      page.tsx                  # redirects to /login or the active role's dashboard
      login/page.tsx
      seller/
        page.tsx                # dashboard: own receivables + status
        receivables/new/page.tsx
      buyer/
        page.tsx                # pending attestations + confirm action
      lender/
        page.tsx                # capacity view + own claims (scoped to logged-in institution)
        claims/new/page.tsx
      regulator/
        page.tsx                # full claim breakdown, audit log
        flags/page.tsx           # linked-entity review queue + clear-flag flow
      globals.css
    components/
      layout/
        AppShell.tsx             # sidebar + topbar wrapper, role-aware nav
        Sidebar.tsx
      receivable/
        ReceivableTable.tsx
        ReceivableStatusBadge.tsx
        SubmitReceivableForm.tsx
        AttestationCard.tsx
      claim/
        ClaimTable.tsx
        CapacityMeter.tsx
        SubmitClaimForm.tsx
      flag/
        FlagReviewCard.tsx
        ClearFlagDialog.tsx
      audit/
        AuditLogList.tsx
        AnchorEventCard.tsx
      ui/                        # shadcn primitives live here (button, card, table, ...)
    hooks/
      useSession.ts              # current fixture identity, login/logout
    lib/
      fixtures/
        users.ts                 # the login directory from §3
        receivables.ts
        claims.ts
        flags.ts
        auditLog.ts
      types.ts                   # Receivable, Claim, Flag, Role, etc.
      utils.ts
  public/
    brand/logo_v2.png      # already present
  tailwind.config.ts
  components.json
  package.json
```

## 6. What each dashboard must actually show

- **Seller (Karnaphuli Garments Ltd.):** table of its own receivables (both fixture ones) with status; a "Submit receivable" form (buyer name, amount, description, "upload invoice" file input — accepting a file and showing it as "encrypted" is enough, no real encryption needed) that adds `RCV-2026-05102`-style entries to local state; status tracker per receivable.
- **Buyer (Nordicwear Sourcing ApS):** list of receivables awaiting its attestation (`RCV-2026-05102`), with a "Confirm obligation" action that flips it to ACTIVE.
- **Lender (whichever of the three institutions logged in):** its own capacity view and claim history only — **never** another lender's amounts, even in fixture data (this is a graded privacy point, not just a UI nicety); a "Submit claim" form (pledge or assignment, amount) against an ACTIVE receivable, which should evaluate against remaining capacity the same way the fixture data already encodes (so a fresh request behaves consistently with §3's numbers).
- **Regulator (Bangladesh Bank):** full cross-lender claim breakdown for every receivable, the audit/anchor log, and the linked-entity review queue with the Turag Apparel Solutions Ltd. flag — including the **clear-flag dialog** requiring both a penalty-fee acknowledgment (pre-calculated amount, §3) *and* a document upload before the "Clear flag" action becomes enabled. Also: freeze/unfreeze controls on any claim.

## 7. Done criteria

Everything in `docs/prototype-plan.md` §7 (demo script) must be clickable start to finish using only this fixture data, with visual polish comparable to `auctra.vercel.app`. Specifically: login as each of the six identities works; the flagship scenario's three claims display with correct approve/reject outcomes and correct per-lender visibility; the live submit→attest walkthrough on the second receivable works; the flag-clearing two-step (fee + doc) visibly cannot be bypassed with just one of the two; a Merkle anchor entry is visible in the audit log.

## When you're done

Update `PROJECT_STATUS.md`: mark Phase 1 complete (or partially complete, listing what's left), log any deviations from this spec and why, and state that Phase 2 (`docs/handoff/phase-2-backend.md`) is next.
