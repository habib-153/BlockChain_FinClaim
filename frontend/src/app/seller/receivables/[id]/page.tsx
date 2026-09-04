"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClaimTable } from "@/components/claim/ClaimTable";
import { StatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";
import { summarizeCapacity } from "@/lib/capacity";
import { SEED_RECEIVABLE_IDS } from "@/lib/fixtures/seedIds";
import { USERS } from "@/lib/fixtures/users";
import { formatBDT, formatDate } from "@/lib/utils";

export default function SellerReceivableDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const { receivables, claims } = useAppData();

  const receivable = receivables.find((r) => r.id === id);
  const belongsToViewer = receivable?.sellerName === user?.institution;

  if (!receivable || !belongsToViewer || SEED_RECEIVABLE_IDS.has(receivable.id)) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          This receivable doesn&apos;t exist or isn&apos;t yours.
        </div>
      </div>
    );
  }

  const buyer = USERS.find((u) => u.institution === receivable.buyerName && u.role === "buyer");
  const capacity = summarizeCapacity(receivable, claims);
  const ownClaims = claims.filter((c) => c.receivableId === receivable.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{receivable.id}</h1>
          <p className="text-sm text-muted-foreground">{receivable.description}</p>
        </div>
        <StatusBadge status={receivable.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receivable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Face value" value={formatBDT(receivable.amountBdt)} />
            <Row label="Submitted" value={formatDate(receivable.submittedAt)} />
            <Row
              label="Attested"
              value={receivable.attestedAt ? formatDate(receivable.attestedAt) : "-"}
            />
            {receivable.invoiceFileName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-3.5" />
                {receivable.invoiceFileName} · encrypted
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-finclaim-teal-700" />
              Buyer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Institution" value={receivable.buyerName} />
            {buyer && <Row label="Contact" value={`${buyer.name}, ${buyer.title}`} />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financing room pledged against this receivable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-finclaim-teal-700 transition-[width]"
              style={{ width: `${capacity.allocatedPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-medium">{formatBDT(capacity.totalBdt)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Allocated</div>
              <div className="font-medium text-finclaim-teal-700">
                {formatBDT(capacity.allocatedBdt)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Remaining</div>
              <div className="font-medium text-finclaim-emerald-500">
                {formatBDT(capacity.remainingBdt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight">Your financing requests against this receivable</h2>
        <ClaimTable
          claims={ownClaims}
          showLender
          getHref={(c) => `/seller/financing/${c.id}`}
          emptyMessage="You haven't requested financing against this receivable yet."
        />
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/seller"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to dashboard
    </Link>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
