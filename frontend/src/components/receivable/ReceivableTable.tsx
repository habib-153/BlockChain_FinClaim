import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { formatBDT, formatDate } from "@/lib/utils";
import type { Receivable } from "@/lib/types";

export function ReceivableTable({
  receivables,
  emptyMessage = "No receivables to show yet.",
}: {
  receivables: Receivable[];
  emptyMessage?: string;
}) {
  if (receivables.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receivable</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Attested</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receivables.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell className="text-muted-foreground">{r.sellerName}</TableCell>
              <TableCell className="text-muted-foreground">{r.buyerName}</TableCell>
              <TableCell>{formatBDT(r.amountBdt)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(r.submittedAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {r.attestedAt ? formatDate(r.attestedAt) : "-"}
              </TableCell>
              <TableCell>
                <ReceivableStatusBadge status={r.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
