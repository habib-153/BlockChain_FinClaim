"use client";

import { toast } from "sonner";
import { CapacityMeter } from "@/components/claim/CapacityMeter";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function LenderDashboardPage() {
  const { user } = useSession();
  const { receivables, claims, decideClaim } = useAppData();

  const activeReceivables = receivables.filter((r) => r.status === "ACTIVE");
  // Requests bundled into a receivable submission sit PENDING even before the
  // buyer attests - hide those from the bank's queue until attestation has
  // run the auto-reject check, same as decideClaim itself requires.
  const activeReceivableIds = new Set(activeReceivables.map((r) => r.id));
  const ownClaims = claims.filter(
    (c) => c.lenderName === user?.institution && activeReceivableIds.has(c.receivableId)
  );

  const handleDecide = (claimId: string, decision: "APPROVED" | "REJECTED") => {
    const result = decideClaim(claimId, decision, user?.institution ?? "");
    if (!result) {
      toast.error(
        decision === "APPROVED"
          ? "No longer enough remaining capacity to approve this request."
          : "Unable to update this request."
      );
      return;
    }
    toast.success(
      decision === "APPROVED" ? `${claimId} approved.` : `${claimId} declined.`
    );
  };

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
        <h2 className="text-sm font-semibold tracking-tight">Financing requests to you</h2>
        <ClaimTable
          claims={ownClaims}
          showReceivableId
          showLender={false}
          onDecide={handleDecide}
          emptyMessage="No financing requests have been directed to you yet."
        />
      </div>
    </div>
  );
}
