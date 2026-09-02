import { Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { formatBDT, formatDate } from "@/lib/utils";
import type { Claim } from "@/lib/types";

export function ClaimTable({
  claims,
  showReceivableId = false,
  showLender = true,
  onToggleFreeze,
  emptyMessage = "No claims to show yet.",
}: {
  claims: Claim[];
  showReceivableId?: boolean;
  showLender?: boolean;
  onToggleFreeze?: (claimId: string, frozen: boolean) => void;
  emptyMessage?: string;
}) {
  if (claims.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim</TableHead>
            {showReceivableId && <TableHead>Receivable</TableHead>}
            {showLender && <TableHead>Lender</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            {onToggleFreeze && <TableHead className="text-right">Regulator</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.id}</TableCell>
              {showReceivableId && (
                <TableCell className="text-muted-foreground">{c.receivableId}</TableCell>
              )}
              {showLender && (
                <TableCell className="text-muted-foreground">{c.lenderName}</TableCell>
              )}
              <TableCell>{c.type}</TableCell>
              <TableCell>{formatBDT(c.amountBdt)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(c.submittedAt)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={c.status} />
                    {c.frozen && <StatusBadge status="FROZEN" />}
                  </div>
                  {c.status === "REJECTED" && c.rejectionReason && (
                    <span className="text-xs text-finclaim-brick-500">
                      {c.rejectionReason}
                    </span>
                  )}
                </div>
              </TableCell>
              {onToggleFreeze && (
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleFreeze(c.id, !c.frozen)}
                  >
                    <Snowflake />
                    {c.frozen ? "Unfreeze" : "Freeze"}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
