import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { summarizeCapacity } from "@/lib/capacity";
import { formatBDT } from "@/lib/utils";
import type { Claim, Receivable } from "@/lib/types";

export function CapacityMeter({
  receivable,
  claims,
}: {
  receivable: Receivable;
  claims: Claim[];
}) {
  const { totalBdt, allocatedBdt, remainingBdt, allocatedPct } = summarizeCapacity(
    receivable,
    claims
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{receivable.id}</span>
          <ReceivableStatusBadge status={receivable.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-finclaim-teal-700 transition-[width]"
            style={{ width: `${allocatedPct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="font-medium">{formatBDT(totalBdt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Allocated</div>
            <div className="font-medium text-finclaim-teal-700">
              {formatBDT(allocatedBdt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Remaining</div>
            <div className="font-medium text-finclaim-emerald-500">
              {formatBDT(remainingBdt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
