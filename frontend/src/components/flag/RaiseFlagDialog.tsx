"use client";

import { useMemo, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/hooks/useAppData";
import { useSession } from "@/hooks/useSession";
import { formatBDT } from "@/lib/utils";

export function RaiseFlagDialog() {
  const { raiseFlag } = useAppData();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [claimantName, setClaimantName] = useState("");
  const [linkedEntityName, setLinkedEntityName] = useState("");
  const [sharedDirector, setSharedDirector] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invoiceAmountBdt = Number(invoiceAmount);
  const feePreview = useMemo(
    () => (invoiceAmountBdt > 0 ? Math.round(invoiceAmountBdt * 0.0002) : 0),
    [invoiceAmountBdt]
  );

  const reset = () => {
    setClaimantName("");
    setLinkedEntityName("");
    setSharedDirector("");
    setInvoiceAmount("");
    setReason("");
  };

  const canSubmit =
    claimantName.trim() && linkedEntityName.trim() && sharedDirector.trim() &&
    invoiceAmountBdt > 0 && reason.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      const flag = raiseFlag(
        {
          claimantName: claimantName.trim(),
          linkedEntityName: linkedEntityName.trim(),
          sharedDirector: sharedDirector.trim(),
          invoiceAmountBdt,
          reason: reason.trim(),
        },
        user?.institution ?? "FinClaim"
      );
      setIsSubmitting(false);
      setOpen(false);
      reset();
      toast.success(`${flag.id} raised against ${flag.claimantName}.`);
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <ShieldAlert />
          Flag company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raise a linked-entity flag</DialogTitle>
          <DialogDescription>
            Flags unusual activity for review. The flagged company must pay a
            clearance fee (0.02% of the invoice amount) and submit supporting
            documentation before the flag can be cleared.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="claimantName">Company being flagged</Label>
            <Input
              id="claimantName"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              placeholder="Turag Apparel Solutions Ltd."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedEntityName">Linked entity</Label>
            <Input
              id="linkedEntityName"
              value={linkedEntityName}
              onChange={(e) => setLinkedEntityName(e.target.value)}
              placeholder="Shitalakshya Fabrics Ltd."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sharedDirector">Shared director / connection</Label>
            <Input
              id="sharedDirector"
              value={sharedDirector}
              onChange={(e) => setSharedDirector(e.target.value)}
              placeholder="Mohammad Aminul Kabir"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invoiceAmount">Related invoice amount (BDT)</Label>
            <Input
              id="invoiceAmount"
              type="number"
              min={1}
              step={1}
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
              placeholder="800000"
            />
            {feePreview > 0 && (
              <p className="text-xs text-muted-foreground">
                Clearance fee: <span className="font-medium text-finclaim-amber-600">
                  {formatBDT(feePreview)}
                </span>{" "}
                (0.02% of the invoice amount)
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Describe the unusual activity or linked-entity risk detected."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Raising…" : "Raise flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
