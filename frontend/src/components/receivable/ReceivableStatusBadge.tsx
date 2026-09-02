import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReceivableStatus } from "@/lib/types";

export type AnyStatus =
  | ReceivableStatus
  | "APPROVED"
  | "REJECTED"
  | "PENDING_REVIEW"
  | "CLEARED"
  | "FROZEN";

const STATUS_STYLES: Record<AnyStatus, string> = {
  ACTIVE:
    "bg-finclaim-emerald-500/15 text-finclaim-emerald-500 border-finclaim-emerald-500/30",
  APPROVED:
    "bg-finclaim-emerald-500/15 text-finclaim-emerald-500 border-finclaim-emerald-500/30",
  CLEARED:
    "bg-finclaim-emerald-500/15 text-finclaim-emerald-500 border-finclaim-emerald-500/30",
  PENDING:
    "bg-finclaim-amber-600/15 text-finclaim-amber-600 border-finclaim-amber-600/30",
  PENDING_REVIEW:
    "bg-finclaim-amber-600/15 text-finclaim-amber-600 border-finclaim-amber-600/30",
  REJECTED:
    "bg-finclaim-brick-500/15 text-finclaim-brick-500 border-finclaim-brick-500/30",
  FROZEN:
    "bg-finclaim-navy-900/10 text-finclaim-navy-900 border-finclaim-navy-900/30 dark:bg-white/10 dark:text-white dark:border-white/20",
};

const STATUS_LABELS: Record<AnyStatus, string> = {
  ACTIVE: "Active",
  APPROVED: "Approved",
  CLEARED: "Cleared",
  PENDING: "Pending",
  PENDING_REVIEW: "Pending review",
  REJECTED: "Rejected",
  FROZEN: "Frozen",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AnyStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function ReceivableStatusBadge({ status }: { status: ReceivableStatus }) {
  return <StatusBadge status={status} />;
}
