"use client";

import { ClaimTable } from "@/components/claim/ClaimTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function LenderRequestsPage() {
  const { user } = useSession();
  const { receivables, claims } = useAppData();

  // Requests bundled into a receivable submission sit PENDING even before the
  // buyer attests - hide those until attestation has run the auto-reject check.
  const activeReceivableIds = new Set(
    receivables.filter((r) => r.status === "ACTIVE").map((r) => r.id)
  );
  const ownClaims = claims
    .filter((c) => c.lenderName === user?.institution && activeReceivableIds.has(c.receivableId))
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  const pendingCount = ownClaims.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Financing requests</h1>
        <p className="text-sm text-muted-foreground">
          Every request sellers have directed to {user?.institution}
          {pendingCount > 0 && (
            <> - <span className="font-medium text-finclaim-amber-600">{pendingCount} awaiting your decision</span></>
          )}
          . Click a request to review it and decide.
        </p>
      </div>

      <ClaimTable
        claims={ownClaims}
        showReceivableId
        showLender={false}
        getHref={(c) => `/lender/requests/${c.id}`}
        emptyMessage="No financing requests have been directed to you yet."
      />
    </div>
  );
}
