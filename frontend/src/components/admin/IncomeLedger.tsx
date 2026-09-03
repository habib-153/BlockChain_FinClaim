import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT, formatDate } from "@/lib/utils";
import type { LinkedEntityFlag } from "@/lib/types";

export function IncomeLedger({ flags }: { flags: LinkedEntityFlag[] }) {
  const cleared = flags
    .filter((f) => f.status === "CLEARED" && f.clearedAt)
    .sort((a, b) => (b.clearedAt ?? "").localeCompare(a.clearedAt ?? ""));
  const total = cleared.reduce((sum, f) => sum + f.penaltyFeeBdt, 0);

  if (cleared.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        No flag clearance fees collected yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flag</TableHead>
            <TableHead>Paid by</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Cleared</TableHead>
            <TableHead>Document on file</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cleared.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">{f.id}</TableCell>
              <TableCell className="text-muted-foreground">{f.claimantName}</TableCell>
              <TableCell className="font-medium text-finclaim-emerald-500">
                {formatBDT(f.penaltyFeeBdt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {f.clearedAt ? formatDate(f.clearedAt) : "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {f.clearedDocumentName ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-medium">
              Total income
            </TableCell>
            <TableCell colSpan={3} className="font-semibold text-finclaim-emerald-500">
              {formatBDT(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
