"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Building2, Check, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";
import { summarizeCapacity } from "@/lib/capacity";
import { USERS } from "@/lib/fixtures/users";
import { formatBDT, formatDate } from "@/lib/utils";

export default function LenderRequestDetailsPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const { user } = useSession();
  const { receivables, claims, decideClaim } = useAppData();

  const claim = claims.find((c) => c.id === claimId);
  const receivable = claim ? receivables.find((r) => r.id === claim.receivableId) : undefined;
  const belongsToViewer = claim?.lenderName === user?.institution;

  const [amount, setAmount] = useState(() => String(claim?.amountBdt ?? ""));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!claim || !receivable || !belongsToViewer) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          This request doesn&apos;t exist or wasn&apos;t directed to you.
        </div>
      </div>
    );
  }

  const seller = USERS.find((u) => u.institution === receivable.sellerName && u.role === "seller");
  const capacity = summarizeCapacity(receivable, claims);
  const maxApprovable = Math.min(claim.amountBdt, capacity.remainingBdt);

  const handleDecide = (decision: "APPROVED" | "REJECTED") => {
    const approvedAmountBdt = decision === "APPROVED" ? Number(amount) : undefined;

    if (decision === "APPROVED") {
      if (!approvedAmountBdt || approvedAmountBdt <= 0) {
        toast.error("Enter a valid approval amount.");
        return;
      }
      if (approvedAmountBdt > claim.amountBdt) {
        toast.error("Can't approve more than the amount requested.");
        return;
      }
      if (approvedAmountBdt > capacity.remainingBdt) {
        toast.error(`Only ${formatBDT(capacity.remainingBdt)} remains available on this receivable.`);
        return;
      }
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const result = decideClaim(claim.id, decision, user?.institution ?? "", approvedAmountBdt);
      setIsSubmitting(false);
      if (!result) {
        toast.error("Unable to update this request - capacity may have changed. Refresh and try again.");
        return;
      }
      toast.success(
        decision === "APPROVED"
          ? `${claim.id} approved for ${formatBDT(approvedAmountBdt!)}.`
          : `${claim.id} declined.`
      );
    }, 500);
  };

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
              Seller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Institution" value={receivable.sellerName} />
            {seller && <Row label="Contact" value={`${seller.name}, ${seller.title}`} />}
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

      {claim.status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>Decide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="approve-amount">Amount to extend (BDT)</Label>
              <Input
                id="approve-amount"
                type="number"
                min={1}
                max={maxApprovable}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Seller requested {formatBDT(claim.amountBdt)}. You can approve up to{" "}
                <span className="font-medium text-finclaim-emerald-500">
                  {formatBDT(maxApprovable)}
                </span>{" "}
                (the lower of the request and remaining receivable capacity).
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleDecide("REJECTED")}
            >
              <X />
              Reject
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={() => handleDecide("APPROVED")}>
              <Check />
              Approve
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/lender/requests"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to financing requests
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
