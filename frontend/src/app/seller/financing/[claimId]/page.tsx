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
import { StatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";
import { summarizeCapacity } from "@/lib/capacity";
import { SEED_CLAIM_IDS } from "@/lib/fixtures/seedIds";
import { USERS } from "@/lib/fixtures/users";
import { formatBDT, formatDate } from "@/lib/utils";

export default function SellerFinancingRequestDetailsPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const { user } = useSession();
  const { receivables, claims } = useAppData();

  const claim = claims.find((c) => c.id === claimId);
  const receivable = claim ? receivables.find((r) => r.id === claim.receivableId) : undefined;
  const belongsToViewer = receivable?.sellerName === user?.institution;

  if (!claim || !receivable || !belongsToViewer || SEED_CLAIM_IDS.has(claim.id)) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          This request doesn&apos;t exist or isn&apos;t yours.
        </div>
      </div>
    );
  }

  const lender = USERS.find((u) => u.institution === claim.lenderName && u.role === "lender");
  const capacity = summarizeCapacity(receivable, claims);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{claim.id}</h1>
          <p className="text-sm text-muted-foreground">
            {claim.type} request against {claim.receivableId}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={claim.status} />
          {claim.frozen && <StatusBadge status="FROZEN" />}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Requested amount" value={formatBDT(claim.amountBdt)} />
            <Row label="Financing type" value={claim.type} />
            <Row label="Submitted" value={formatDate(claim.submittedAt)} />
            {claim.status === "APPROVED" && claim.approvedAmountBdt !== undefined && (
              <Row
                label="Approved amount"
                value={
                  <span className="text-finclaim-emerald-500">
                    {formatBDT(claim.approvedAmountBdt)}
                  </span>
                }
              />
            )}
            {claim.status === "REJECTED" && claim.rejectionReason && (
              <Row
                label="Rejection reason"
                value={<span className="text-finclaim-brick-500">{claim.rejectionReason}</span>}
              />
            )}
            {claim.invoiceFileName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-3.5" />
                {claim.invoiceFileName} · encrypted
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-finclaim-teal-700" />
              Lender
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Institution" value={claim.lenderName} />
            {lender && <Row label="Contact" value={`${lender.name}, ${lender.title}`} />}
            <Row label="Buyer" value={receivable.buyerName} />
            <Row label="Invoice" value={receivable.description} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{receivable.id}</span>
            <StatusBadge status={receivable.status} />
          </CardTitle>
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
