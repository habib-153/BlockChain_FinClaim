import { Link2, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { ClearFlagDialog } from "@/components/flag/ClearFlagDialog";
import { formatBDT, formatDate } from "@/lib/utils";
import type { LinkedEntityFlag } from "@/lib/types";

export function FlagReviewCard({ flag }: { flag: LinkedEntityFlag }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-finclaim-amber-600" />
            {flag.claimantName}
          </span>
          <StatusBadge status={flag.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Link2 className="mt-0.5 size-4 shrink-0" />
          <span>
            Shares director <span className="font-medium text-foreground">{flag.sharedDirector}</span>{" "}
            with <span className="font-medium text-foreground">{flag.linkedEntityName}</span> — an
            entity with a prior disputed claim.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
          <div>
            <div className="text-xs text-muted-foreground">Flagged invoice</div>
            <div className="font-medium">{formatBDT(flag.invoiceAmountBdt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Penalty fee to clear</div>
            <div className="font-medium text-finclaim-amber-600">
              {formatBDT(flag.penaltyFeeBdt)}
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Raised {formatDate(flag.raisedAt)}
          {flag.status === "CLEARED" && flag.clearedAt && (
            <> · Cleared {formatDate(flag.clearedAt)}
              {flag.clearedDocumentName && ` with ${flag.clearedDocumentName}`}
            </>
          )}
        </div>
      </CardContent>
      {flag.status === "PENDING_REVIEW" && (
        <CardFooter className="justify-end">
          <ClearFlagDialog flag={flag} />
        </CardFooter>
      )}
    </Card>
  );
}
