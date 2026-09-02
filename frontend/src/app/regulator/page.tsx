"use client";

import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CapacityMeter } from "@/components/claim/CapacityMeter";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { AnchorEventCard } from "@/components/audit/AnchorEventCard";
import { AuditLogList } from "@/components/audit/AuditLogList";
import { useAppData } from "@/hooks/useAppData";

export default function RegulatorDashboardPage() {
  const { receivables, claims, anchors, auditEvents, setClaimFrozen } = useAppData();

  const handleToggleFreeze = (claimId: string, frozen: boolean) => {
    setClaimFrozen(claimId, frozen);
    toast.success(frozen ? `${claimId} frozen.` : `${claimId} unfrozen.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Regulator oversight</h1>
        <p className="text-sm text-muted-foreground">
          Full cross-lender visibility, audit trail, and claim controls for
          Bangladesh Bank supervision.
        </p>
      </div>

      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims">Claims overview</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-6 pt-4">
          {receivables.map((r) => (
            <div key={r.id} className="space-y-3">
              <CapacityMeter receivable={r} claims={claims} />
              <ClaimTable
                claims={claims.filter((c) => c.receivableId === r.id)}
                showLender
                onToggleFreeze={handleToggleFreeze}
                emptyMessage="No claims submitted against this receivable yet."
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="space-y-6 pt-4">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Merkle anchors</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {anchors.map((a) => (
                <AnchorEventCard key={a.id} anchor={a} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Event log</h2>
            <AuditLogList events={auditEvents} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
