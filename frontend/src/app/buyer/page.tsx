"use client";

import { toast } from "sonner";
import { AttestationCard } from "@/components/receivable/AttestationCard";
import { ReceivableTable } from "@/components/receivable/ReceivableTable";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";

export default function BuyerDashboardPage() {
  const { user } = useSession();
  const { receivables, attestReceivable } = useAppData();

  const own = receivables.filter((r) => r.buyerName === user?.institution);
  const pending = own.filter((r) => r.status === "PENDING");
  const active = own.filter((r) => r.status === "ACTIVE");

  const handleConfirm = (receivableId: string) => {
    attestReceivable(receivableId);
    toast.success(`${receivableId} confirmed - obligation now active.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Awaiting your attestation</h1>
        <p className="text-sm text-muted-foreground">
          Confirm the obligations your suppliers have registered against you.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          Nothing awaiting attestation right now.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pending.map((r) => (
            <AttestationCard key={r.id} receivable={r} onConfirm={handleConfirm} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Confirmed obligations</h2>
        <ReceivableTable
          receivables={active}
          emptyMessage="No confirmed obligations yet."
        />
      </div>
    </div>
  );
}
