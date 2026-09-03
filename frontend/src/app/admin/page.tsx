"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { CircleDollarSign, FileText, ShieldAlert, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CapacityMeter } from "@/components/claim/CapacityMeter";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { AnchorEventCard } from "@/components/audit/AnchorEventCard";
import { AuditLogList } from "@/components/audit/AuditLogList";
import { FlagReviewCard } from "@/components/flag/FlagReviewCard";
import { RaiseFlagDialog } from "@/components/flag/RaiseFlagDialog";
import { StatCard } from "@/components/admin/StatCard";
import { InstitutionsTable } from "@/components/admin/InstitutionsTable";
import { IncomeLedger } from "@/components/admin/IncomeLedger";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";
import { buildInstitutionDirectory } from "@/lib/institutions";
import { formatBDT } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user } = useSession();
  const { receivables, claims, flags, anchors, auditEvents, setClaimFrozen } = useAppData();

  const totalIncomeBdt = useMemo(
    () => flags.filter((f) => f.status === "CLEARED").reduce((sum, f) => sum + f.penaltyFeeBdt, 0),
    [flags]
  );
  const openFlags = flags.filter((f) => f.status === "PENDING_REVIEW").length;
  const approvedFinancingBdt = useMemo(
    () =>
      claims
        .filter((c) => c.status === "APPROVED" && !c.frozen)
        .reduce((sum, c) => sum + c.amountBdt, 0),
    [claims]
  );
  const institutions = useMemo(
    () => buildInstitutionDirectory(receivables, claims, flags),
    [receivables, claims, flags]
  );

  const handleToggleFreeze = (claimId: string, frozen: boolean) => {
    setClaimFrozen(claimId, frozen, user?.institution ?? "FinClaim");
    toast.success(frozen ? `${claimId} frozen.` : `${claimId} unfrozen.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">FinClaim admin</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide visibility and controls - freeze transactions, flag
          companies, and track flag clearance income.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total income"
              value={formatBDT(totalIncomeBdt)}
              icon={CircleDollarSign}
              accentClassName="text-finclaim-emerald-500"
            />
            <StatCard
              label="Open flags"
              value={String(openFlags)}
              icon={ShieldAlert}
              accentClassName="text-finclaim-amber-600"
            />
            <StatCard
              label="Receivables"
              value={String(receivables.length)}
              icon={FileText}
            />
            <StatCard
              label="Approved financing"
              value={formatBDT(approvedFinancingBdt)}
              icon={Wallet}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Merkle anchors</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {anchors.map((a) => (
                <AnchorEventCard key={a.id} anchor={a} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
            <AuditLogList events={auditEvents.slice(0, 8)} />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 pt-4">
          {receivables.map((r) => (
            <div key={r.id} className="space-y-3">
              <CapacityMeter receivable={r} claims={claims} />
              <ClaimTable
                claims={claims.filter((c) => c.receivableId === r.id)}
                showLender
                onToggleFreeze={handleToggleFreeze}
                emptyMessage="No financing requests against this receivable yet."
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="flags" className="space-y-6 pt-4">
          <div className="flex justify-end">
            <RaiseFlagDialog />
          </div>
          {flags.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No flags raised yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {flags.map((f) => (
                <FlagReviewCard key={f.id} flag={f} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="institutions" className="space-y-6 pt-4">
          <InstitutionsTable rows={institutions} />
        </TabsContent>

        <TabsContent value="income" className="space-y-6 pt-4">
          <IncomeLedger flags={flags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
