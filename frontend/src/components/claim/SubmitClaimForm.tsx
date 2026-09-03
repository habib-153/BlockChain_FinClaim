"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";
import { summarizeCapacity } from "@/lib/capacity";
import { LENDER_INSTITUTIONS } from "@/lib/fixtures/users";
import { formatBDT } from "@/lib/utils";
import type { ClaimType } from "@/lib/types";

/** Lets the seller request additional financing from a specific bank against
 * one of their own already-ACTIVE receivables (evaluated immediately, since
 * attestation - and any request bundled at submission time - already happened). */
export function SubmitClaimForm() {
  const router = useRouter();
  const { user } = useSession();
  const { receivables, claims, submitClaim } = useAppData();

  const activeReceivables = useMemo(
    () => receivables.filter((r) => r.status === "ACTIVE" && r.sellerName === user?.institution),
    [receivables, user]
  );

  const [receivableId, setReceivableId] = useState(activeReceivables[0]?.id ?? "");
  const [lenderName, setLenderName] = useState(LENDER_INSTITUTIONS[0] ?? "");
  const [type, setType] = useState<ClaimType>("Pledge");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedReceivable = activeReceivables.find((r) => r.id === receivableId);
  const capacity = selectedReceivable
    ? summarizeCapacity(selectedReceivable, claims)
    : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountBdt = Number(amount);
    if (!selectedReceivable || !lenderName || !amountBdt || amountBdt <= 0) {
      toast.error("Choose a receivable, a bank, and enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const claim = submitClaim({
        receivableId: selectedReceivable.id,
        lenderName,
        type,
        amountBdt,
      });
      setIsSubmitting(false);
      if (claim.status === "REJECTED") {
        toast.error(`${claim.id} rejected - ${claim.rejectionReason}`);
      } else {
        toast.success(`${claim.id} submitted - awaiting ${lenderName}'s review.`);
      }
      router.push("/seller");
    }, 700);
  };

  if (activeReceivables.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You don&apos;t have any attested receivables open for financing yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="receivable">Receivable</Label>
            <Select value={receivableId} onValueChange={setReceivableId}>
              <SelectTrigger id="receivable" className="w-full">
                <SelectValue placeholder="Select a receivable" />
              </SelectTrigger>
              <SelectContent>
                {activeReceivables.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.id} - {formatBDT(r.amountBdt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {capacity && (
              <p className="text-xs text-muted-foreground">
                Remaining capacity:{" "}
                <span className="font-medium text-finclaim-emerald-500">
                  {formatBDT(capacity.remainingBdt)}
                </span>{" "}
                of {formatBDT(capacity.totalBdt)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lender">Request financing from</Label>
            <Select value={lenderName} onValueChange={setLenderName}>
              <SelectTrigger id="lender" className="w-full">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {LENDER_INSTITUTIONS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Financing type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ClaimType)}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pledge">Pledge</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Requested amount (BDT)</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="400000"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <SendHorizonal />}
            {isSubmitting ? "Submitting…" : "Request financing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
