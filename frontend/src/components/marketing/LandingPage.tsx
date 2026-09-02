import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Database,
  FileCheck2,
  GitBranch,
  Handshake,
  Landmark,
  Lock,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { RECEIVABLES } from "@/lib/fixtures/receivables";
import { CLAIMS } from "@/lib/fixtures/claims";
import { summarizeCapacity } from "@/lib/capacity";
import { formatBDT } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#roles", label: "Who it's for" },
];

const FEATURES = [
  {
    icon: Lock,
    title: "Confidential capacity proof",
    description:
      "Every new claim is checked against a receivable's remaining value and returns a straight approve/reject - competitors never see each other's exact positions.",
  },
  {
    icon: GitBranch,
    title: "Pledge vs. assignment logic",
    description:
      'Two legally distinct financing events - collateral pledge and outright assignment - tracked as first-class states instead of one generic "loan against invoice" entry.',
  },
  {
    icon: ShieldAlert,
    title: "Linked-entity fraud containment",
    description:
      "Claims connected through a shared director, signatory, or address are flagged for human review, not auto-blocked - clearing one requires a penalty fee and verified documentation.",
  },
  {
    icon: Landmark,
    title: "Regulator-anchored consortium",
    description:
      "Bangladesh Bank anchors the network without running it alone. Freezing a claim or resolving a dispute needs the regulator plus a rotating panel of consortium members.",
  },
  {
    icon: FileCheck2,
    title: "Public Merkle audit anchor",
    description:
      "A periodic Merkle root is published outside the consortium so independent auditors can verify nothing was secretly altered, without seeing any private claim data.",
  },
  {
    icon: Database,
    title: "Redundant off-chain evidence",
    description:
      "Each institution keeps its own encrypted copy of the underlying invoice, linked by the same cryptographic fingerprint - no single storage provider can withhold evidence.",
  },
];

const LIFECYCLE_STEPS = [
  {
    step: "01",
    title: "Submit",
    description:
      "The seller registers a receivable with the buyer, amount, and an encrypted copy of the invoice.",
  },
  {
    step: "02",
    title: "Attest",
    description:
      "The buyer confirms the underlying obligation is real before the receivable can be financed by anyone.",
  },
  {
    step: "03",
    title: "Activate",
    description:
      "Once attested, the receivable moves to ACTIVE and becomes visible to lenders as financeable.",
  },
  {
    step: "04",
    title: "Claim",
    description:
      "A lender requests a pledge or assignment; the registry runs a confidential capacity check and settles it atomically.",
  },
  {
    step: "05",
    title: "Settle or freeze",
    description:
      "Claims resolve normally, or move to a FROZEN/DISPUTED state with a visible audit reason if a dispute arises.",
  },
];

const ROLES = [
  {
    icon: Building2,
    role: "Seller",
    who: "Karnaphuli Garments Ltd.",
    description:
      "Registers receivables, uploads the encrypted invoice, and tracks status from submission through attestation.",
  },
  {
    icon: Handshake,
    role: "Buyer",
    who: "Nordicwear Sourcing ApS",
    description:
      "Confirms the obligation is real before a receivable can be pledged or assigned to any lender.",
  },
  {
    icon: Users,
    role: "Lender",
    who: "Bank / NBFI",
    description:
      "Checks remaining financing capacity and submits claims - seeing only its own claim history, never a competitor's.",
  },
  {
    icon: ScrollText,
    role: "Regulator",
    who: "Bangladesh Bank",
    description:
      "Supervises the full consortium picture: every claim, the audit log, and the linked-entity review queue.",
  },
];

function FlagshipSnippet() {
  const receivable = RECEIVABLES[0];
  const claims = CLAIMS.filter((c) => c.receivableId === receivable.id);
  const { remainingBdt, allocatedPct } = summarizeCapacity(receivable, claims);

  return (
    <Card className="w-full max-w-md shadow-xl shadow-finclaim-navy-900/5 ring-finclaim-navy-900/10">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              {receivable.id}
            </div>
            <div className="text-sm font-semibold">
              {formatBDT(receivable.amountBdt)}
            </div>
          </div>
          <StatusBadge status={receivable.status} />
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-finclaim-teal-700"
            style={{ width: `${allocatedPct}%` }}
          />
        </div>

        <div className="space-y-2">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">{claim.lenderName}</div>
                <div className="text-xs text-muted-foreground">
                  {claim.type} · {formatBDT(claim.amountBdt)}
                </div>
              </div>
              <StatusBadge status={claim.status} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          <span className="text-muted-foreground">Capacity remaining</span>
          <span className="font-semibold text-finclaim-emerald-500">
            {formatBDT(remainingBdt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Image
            src="/brand/logo_v2.png"
            alt="FinClaim"
            width={100}
            height={33}
            priority
          />

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-finclaim-navy-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button asChild size="sm">
            <Link href="/login">
              Sign in
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-finclaim-teal-700/25 bg-finclaim-teal-700/10 px-3 py-1 text-xs font-semibold tracking-wide text-finclaim-teal-700 uppercase">
                <ShieldCheck className="size-3.5" />
                Permissioned receivable-claim registry
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-finclaim-navy-900 sm:text-5xl">
                See who&apos;s already financed an invoice, without asking a
                competitor to open their book.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                FinClaim lets Bangladeshi banks and NBFIs confirm a
                receivable&apos;s financing status and remaining capacity
                instantly, under Bangladesh Bank supervision, without
                exposing client lists, pricing, or exact positions to one
                another.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/login">
                    Sign in to your workspace
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border/60 pt-6">
                <div>
                  <dt className="text-xs text-muted-foreground">Ledger</dt>
                  <dd className="text-sm font-semibold text-finclaim-navy-900">
                    Hyperledger Fabric
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Supervisor</dt>
                  <dd className="text-sm font-semibold text-finclaim-navy-900">
                    Bangladesh Bank
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Audit trail</dt>
                  <dd className="text-sm font-semibold text-finclaim-navy-900">
                    Public Merkle anchor
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-center lg:justify-end">
              <FlagshipSnippet />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-border/60 bg-slate-50/60 py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-finclaim-navy-900 sm:text-3xl">
                Built for a problem competitors can&apos;t solve alone
              </h2>
              <p className="mt-3 text-muted-foreground">
                The same receivable can be presented to multiple lenders before
                any of them can see the other claim. FinClaim closes that gap
                without asking anyone to hand over commercially sensitive data.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="border-border/60">
                  <CardContent className="space-y-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-finclaim-teal-700/10 text-finclaim-teal-700">
                      <feature.icon className="size-4.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-finclaim-navy-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-finclaim-navy-900 sm:text-3xl">
                One receivable, one lifecycle
              </h2>
              <p className="mt-3 text-muted-foreground">
                Every receivable moves through the same five states - enforced
                by the ledger, not a spreadsheet or a phone call between
                institutions.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {LIFECYCLE_STEPS.map((item) => (
                <div key={item.step}>
                  <div className="text-sm font-semibold text-finclaim-teal-700">
                    {item.step}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-finclaim-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section
          id="roles"
          className="border-t border-border/60 bg-slate-50/60 py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-finclaim-navy-900 sm:text-3xl">
                One workspace per participant
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everyone sees exactly what their role needs - nothing a
                competitor or counterparty shouldn&apos;t.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ROLES.map((item) => (
                <Card key={item.role} className="border-border/60">
                  <CardContent className="space-y-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-finclaim-navy-900/5 text-finclaim-navy-900">
                      <item.icon className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-finclaim-navy-900">
                        {item.role}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.who}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-finclaim-navy-900 sm:text-3xl">
              Ready to see the full claim lifecycle?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Sign in to your institution&apos;s workspace to submit a
              receivable, attest an obligation, or check financing capacity.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/login">
                  Sign in to your workspace
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo_v2.png" alt="FinClaim" width={75} height={25} />
            <span className="text-xs text-muted-foreground">
              Confidential claim infrastructure for receivable finance
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FinClaim. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
