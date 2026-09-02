"use client";

import Link from "next/link";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CapacityMeter } from "@/components/claim/CapacityMeter";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function LenderDashboardPage() {
  const { user } = useSession();
  const { receivables, claims } = useAppData();

  const activeReceivables = receivables.filter((r) => r.status === "ACTIVE");
  const ownClaims = claims.filter((c) => c.lenderName === user?.institution);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            {user?.institution} — capacity view
          </h1>
          <p className="text-sm text-muted-foreground">
            Remaining financing room per receivable, and your own claim history —
            other lenders&apos; positions are never shown here.
          </p>
        </div>
        <Button asChild>
          <Link href="/lender/claims/new">
            <SendHorizonal />
            Submit claim
          </Link>
        </Button>
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
        <h2 className="text-sm font-semibold tracking-tight">Your claims</h2>
        <ClaimTable
          claims={ownClaims}
          showReceivableId
          showLender={false}
          emptyMessage="You haven't submitted any claims yet."
        />
      </div>
    </div>
  );
}
