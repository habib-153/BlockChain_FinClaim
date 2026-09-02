"use client";

import { useState } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBDT, formatDate } from "@/lib/utils";
import type { Receivable } from "@/lib/types";

export function AttestationCard({
  receivable,
  onConfirm,
}: {
  receivable: Receivable;
  onConfirm: (receivableId: string) => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    window.setTimeout(() => {
      onConfirm(receivable.id);
      setIsConfirming(false);
    }, 600);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{receivable.id}</span>
          <span className="text-finclaim-teal-700">{formatBDT(receivable.amountBdt)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">{receivable.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          {receivable.invoiceFileName ?? "Invoice on file"} · encrypted
        </div>
        <div className="text-xs text-muted-foreground">
          Submitted by {receivable.sellerName} on {formatDate(receivable.submittedAt)}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleConfirm} disabled={isConfirming}>
          <CheckCircle2 />
          {isConfirming ? "Confirming…" : "Confirm obligation"}
        </Button>
      </CardFooter>
    </Card>
  );
}
