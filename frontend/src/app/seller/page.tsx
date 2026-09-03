"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { ReceivableTable } from "@/components/receivable/ReceivableTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function SellerDashboardPage() {
  const { user } = useSession();
  const { receivables, claims } = useAppData();

  const own = receivables.filter((r) => r.sellerName === user?.institution);
  const ownClaims = claims.filter((c) => own.some((r) => r.id === c.receivableId));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Your receivables</h1>
          <p className="text-sm text-muted-foreground">
            Track submission and attestation status for every invoice you&apos;ve
            registered with FinClaim.
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/receivables/new">
            <FilePlus2 />
            New financing application
          </Link>
        </Button>
      </div>

      <ReceivableTable
        receivables={own}
        emptyMessage="You haven't submitted any receivables yet."
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Your financing requests</h2>
        <ClaimTable
          claims={ownClaims}
          showReceivableId
          showLender
          emptyMessage="You haven't requested financing from any bank yet."
        />
      </div>
    </div>
  );
}
