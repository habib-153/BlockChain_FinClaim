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
import { summarizeCapacity } from "@/lib/capacity";
import { formatBDT } from "@/lib/utils";
import type { ClaimType } from "@/lib/types";

export function SubmitClaimForm({ lenderName }: { lenderName: string }) {
  const router = useRouter();
  const { receivables, claims, submitClaim } = useAppData();

  const activeReceivables = useMemo(
    () => receivables.filter((r) => r.status === "ACTIVE"),
    [receivables]
  );

  const [receivableId, setReceivableId] = useState(activeReceivables[0]?.id ?? "");
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
    if (!selectedReceivable || !amountBdt || amountBdt <= 0) {
      toast.error("Choose a receivable and enter a valid amount.");
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
      if (claim.status === "APPROVED") {
        toast.success(`${claim.id} approved — ${formatBDT(claim.amountBdt)} allocated.`);
      } else {
        toast.error(`${claim.id} rejected — ${claim.rejectionReason}`);
      }
      router.push("/lender");
    }, 700);
  };

  if (activeReceivables.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No active receivables are currently open for claims.
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
                    {r.id} — {formatBDT(r.amountBdt)}
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
            <Label htmlFor="type">Claim type</Label>
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
            <Label htmlFor="amount">Claim amount (BDT)</Label>
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
            {isSubmitting ? "Submitting…" : "Submit claim"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
