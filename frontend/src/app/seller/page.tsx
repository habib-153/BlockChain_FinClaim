"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceivableTable } from "@/components/receivable/ReceivableTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function SellerDashboardPage() {
  const { user } = useSession();
  const { receivables } = useAppData();

  const own = receivables.filter((r) => r.sellerName === user?.institution);

  return (
    <div className="space-y-6">
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
            Submit receivable
          </Link>
        </Button>
      </div>

      <ReceivableTable
        receivables={own}
        emptyMessage="You haven't submitted any receivables yet."
      />
    </div>
  );
}
