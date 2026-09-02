"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/hooks/useAppData";
import { BUYER_NAME } from "@/lib/fixtures/receivables";
import { toast } from "sonner";

export function SubmitReceivableForm() {
  const router = useRouter();
  const { submitReceivable } = useAppData();

  const [buyerName, setBuyerName] = useState(BUYER_NAME);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!buyerName.trim() || !amountBdt || amountBdt <= 0 || !description.trim()) {
      toast.error("Fill in buyer, amount, and description before submitting.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const receivable = submitReceivable({
        buyerName: buyerName.trim(),
        amountBdt,
        description: description.trim(),
        invoiceFileName: invoiceFile?.name,
      });
      setIsSubmitting(false);
      toast.success(`${receivable.id} submitted — awaiting buyer attestation.`);
      router.push("/seller");
    }, 700);
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UploadCloud />
            )}
            {isSubmitting ? "Submitting…" : "Submit receivable"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
