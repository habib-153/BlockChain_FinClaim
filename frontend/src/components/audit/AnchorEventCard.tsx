import { Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { AnchorEvent } from "@/lib/types";

function truncateRoot(root: string): string {
  if (root.length <= 20) return root;
  return `${root.slice(0, 10)}…${root.slice(-6)}`;
}

export function AnchorEventCard({ anchor }: { anchor: AnchorEvent }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-finclaim-teal-700/10 text-finclaim-teal-700">
            <Link2 className="size-4" />
          </div>
          <div>
            <div className="font-medium">{anchor.id}</div>
            <div className="font-mono text-xs text-muted-foreground">
              Root {truncateRoot(anchor.merkleRoot)}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{formatDateTime(anchor.timestamp)}</div>
          <div>{anchor.eventCount} events</div>
        </div>
      </CardContent>
    </Card>
  );
}
