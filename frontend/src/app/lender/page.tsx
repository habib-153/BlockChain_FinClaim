"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CapacityMeter } from "@/components/claim/CapacityMeter";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function LenderDashboardPage() {
  const { user } = useSession();
  const { receivables, claims } = useAppData();

  const activeReceivables = receivables.filter((r) => r.status === "ACTIVE");
  // Requests bundled into a receivable submission sit PENDING even before the
  // buyer attests - hide those from the bank's queue until attestation has
  // run the auto-reject check, same as decideClaim itself requires.
  const activeReceivableIds = new Set(activeReceivables.map((r) => r.id));
  const ownClaims = claims
    .filter((c) => c.lenderName === user?.institution && activeReceivableIds.has(c.receivableId))
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {user?.institution} - capacity view
        </h1>
        <p className="text-sm text-muted-foreground">
          Remaining financing room per receivable, and financing requests
          directed to you - other lenders&apos; positions are never shown here.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Active receivables</h2>
        {activeReceivables.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No active receivables are open for financing yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeReceivables.map((r) => (
              <CapacityMeter key={r.id} receivable={r} claims={claims} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Financing requests to you</h2>
          <Link
            href="/lender/requests"
            className="inline-flex items-center gap-1 text-sm text-finclaim-teal-700 hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <ClaimTable
          claims={ownClaims}
          showReceivableId
          showLender={false}
          getHref={(c) => `/lender/requests/${c.id}`}
          emptyMessage="No financing requests have been directed to you yet."
        />
      </div>
    </div>
  );
}
