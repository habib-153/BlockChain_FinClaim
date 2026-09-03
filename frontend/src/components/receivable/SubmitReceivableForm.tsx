"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck, UploadCloud } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/hooks/useAppData";
import { BUYER_NAME } from "@/lib/fixtures/receivables";
import { LENDER_INSTITUTIONS } from "@/lib/fixtures/users";
import { toast } from "sonner";
import type { ClaimType } from "@/lib/types";

export function SubmitReceivableForm() {
  const router = useRouter();
  const { submitReceivable } = useAppData();

  const [buyerName, setBuyerName] = useState(BUYER_NAME);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [targetLenderName, setTargetLenderName] = useState(LENDER_INSTITUTIONS[0] ?? "");
  const [claimType, setClaimType] = useState<ClaimType>("Pledge");
  // Empty until the seller overrides it - defaults to (and tracks) the
  // invoice amount above, without syncing via an effect.
  const [requestedAmountOverride, setRequestedAmountOverride] = useState("");
  const requestedAmount = requestedAmountOverride || amount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setInvoiceFile(null);
    if (!file) return;
    setIsEncrypting(true);
    window.setTimeout(() => {
      setInvoiceFile(file);
      setIsEncrypting(false);
    }, 500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountBdt = Number(amount);
    const requestedAmountBdt = Number(requestedAmount);
    if (!buyerName.trim() || !amountBdt || amountBdt <= 0 || !description.trim()) {
      toast.error("Fill in buyer, amount, and description before submitting.");
      return;
    }
    if (!targetLenderName || !requestedAmountBdt || requestedAmountBdt <= 0) {
      toast.error("Choose a bank and enter a valid requested amount.");
      return;
    }
    if (requestedAmountBdt > amountBdt) {
      toast.error("Requested financing can't exceed the invoice amount.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const receivable = submitReceivable({
        buyerName: buyerName.trim(),
        amountBdt,
        description: description.trim(),
        invoiceFileName: invoiceFile?.name,
        targetLenderName,
        claimType,
        requestedAmountBdt,
      });
      setIsSubmitting(false);
      toast.success(`${receivable.id} submitted - awaiting buyer attestation.`);
      router.push("/seller");
    }, 700);
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight">Invoice details</h2>
            <div className="space-y-1.5">
              <Label htmlFor="buyerName">Buyer</Label>
              <Input
                id="buyerName"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Buyer legal name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Invoice amount (BDT)</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="650000"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shipment or contract details for this receivable"
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoice">Invoice document</Label>
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-3">
                <Input
                  id="invoice"
                  type="file"
                  onChange={handleFileChange}
                  className="h-auto border-none p-0 file:mr-2"
                />
              </div>
              {isEncrypting && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Encrypting and uploading…
                </p>
              )}
              {!isEncrypting && invoiceFile && (
                <p className="flex items-center gap-1.5 text-xs text-finclaim-emerald-500">
                  <ShieldCheck className="size-3.5" />
                  {invoiceFile.name} encrypted and attached.
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight">Financing request</h2>
            <div className="space-y-1.5">
              <Label htmlFor="targetLender">Request financing from</Label>
              <Select value={targetLenderName} onValueChange={setTargetLenderName}>
                <SelectTrigger id="targetLender" className="w-full">
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
              <Label htmlFor="claimType">Financing type</Label>
              <Select value={claimType} onValueChange={(v) => setClaimType(v as ClaimType)}>
                <SelectTrigger id="claimType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pledge">Pledge</SelectItem>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requestedAmount">Requested amount (BDT)</Label>
              <Input
                id="requestedAmount"
                type="number"
                min={1}
                step={1}
                value={requestedAmount}
                onChange={(e) => setRequestedAmountOverride(e.target.value)}
                placeholder="650000"
                required
              />
              <p className="text-xs text-muted-foreground">
                Evaluated once the buyer attests the invoice. Requests exceeding
                what&apos;s available are automatically rejected, with the
                reason shown on your dashboard - otherwise it&apos;s sent to
                the bank for review and approval.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UploadCloud />
            )}
            {isSubmitting ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
