import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/lib/utils";
import type { InstitutionRow } from "@/lib/institutions";

export function InstitutionsTable({ rows }: { rows: InstitutionRow[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Institution</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Receivables</TableHead>
            <TableHead>Requests received</TableHead>
            <TableHead>Approved financing</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-muted-foreground">{row.roleLabel}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.contactName ? (
                  <>
                    {row.contactName}
                    {row.contactTitle && (
                      <span className="block text-xs">{row.contactTitle}</span>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="font-normal">
                    No platform account
                  </Badge>
                )}
              </TableCell>
              <TableCell>{row.receivablesSubmitted || "-"}</TableCell>
              <TableCell>{row.requestsReceived || "-"}</TableCell>
              <TableCell>
                {row.requestsApproved
                  ? `${row.requestsApproved} · ${formatBDT(row.totalApprovedBdt)}`
                  : "-"}
              </TableCell>
              <TableCell>{row.flagsCount || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
