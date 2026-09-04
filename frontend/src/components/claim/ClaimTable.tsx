"use client";

import { useRouter } from "next/navigation";
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
  getHref,
  emptyMessage = "No claims to show yet.",
}: {
  claims: Claim[];
  showReceivableId?: boolean;
  showLender?: boolean;
  onToggleFreeze?: (claimId: string, frozen: boolean) => void;
  /** When provided, each row navigates to this URL - used for the request-details pages. */
  getHref?: (claim: Claim) => string;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const showControls = !!onToggleFreeze;
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
            {showControls && <TableHead className="text-right">Controls</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((c) => {
            const href = getHref?.(c);
            const partial =
              c.status === "APPROVED" &&
              c.approvedAmountBdt !== undefined &&
              c.approvedAmountBdt !== c.amountBdt;
            return (
              <TableRow
                key={c.id}
                onClick={href ? () => router.push(href) : undefined}
                className={href ? "cursor-pointer hover:bg-muted/50" : undefined}
              >
                <TableCell className="font-medium">{c.id}</TableCell>
                {showReceivableId && (
                  <TableCell className="text-muted-foreground">{c.receivableId}</TableCell>
                )}
                {showLender && (
                  <TableCell className="text-muted-foreground">{c.lenderName}</TableCell>
                )}
                <TableCell>{c.type}</TableCell>
                <TableCell>
                  {partial ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-finclaim-emerald-500">
                        {formatBDT(c.approvedAmountBdt!)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of {formatBDT(c.amountBdt)} requested
                      </span>
                    </div>
                  ) : (
                    formatBDT(c.amountBdt)
                  )}
                </TableCell>
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
                {showControls && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {onToggleFreeze && c.status !== "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFreeze(c.id, !c.frozen);
                          }}
                        >
                          <Snowflake />
                          {c.frozen ? "Unfreeze" : "Freeze"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
