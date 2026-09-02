"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAppData } from "@/hooks/useAppData";
import { formatBDT } from "@/lib/utils";
import type { LinkedEntityFlag } from "@/lib/types";

export function ClearFlagDialog({ flag }: { flag: LinkedEntityFlag }) {
  const { clearFlag } = useAppData();
  const [open, setOpen] = useState(false);
  const [ackFee, setAckFee] = useState(false);
  const [document, setDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canClear = ackFee && !!document;

  const reset = () => {
    setAckFee(false);
    setDocument(null);
  };

  const handleClear = () => {
    if (!canClear || !document) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      clearFlag(flag.id, document.name);
      setIsSubmitting(false);
      setOpen(false);
      reset();
      toast.success(`${flag.id} cleared — ${flag.claimantName} unblocked.`);
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
          <ShieldCheck />
          Clear flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clear linked-entity flag {flag.id}</DialogTitle>
          <DialogDescription>
            Clearing requires both the penalty fee acknowledgment and a supporting
            document. Both are needed — the action stays disabled until then.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-lg border p-3">
            <Checkbox
              id="ackFee"
              checked={ackFee}
              onCheckedChange={(v) => setAckFee(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="ackFee" className="text-sm font-normal leading-snug">
              I acknowledge the penalty fee of{" "}
              <span className="font-medium text-foreground">
                {formatBDT(flag.penaltyFeeBdt)}
              </span>{" "}
              (0.02% of the {formatBDT(flag.invoiceAmountBdt)} flagged invoice).
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supportingDoc">Supporting document</Label>
            <Input
              id="supportingDoc"
              type="file"
              onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
            />
            {document && (
              <p className="text-xs text-finclaim-emerald-500">{document.name} attached.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleClear} disabled={!canClear || isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Clearing…" : "Clear flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
