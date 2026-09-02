import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";
import type { AuditEvent } from "@/lib/types";

export function AuditLogList({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
        No audit events recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <ul>
        {events.map((event, i) => (
          <li key={event.id}>
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{event.action}</div>
                <div className="text-sm text-muted-foreground">{event.detail}</div>
                <div className="mt-1 text-xs text-muted-foreground">{event.actor}</div>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                {formatDateTime(event.timestamp)}
              </div>
            </div>
            {i < events.length - 1 && <Separator />}
          </li>
        ))}
      </ul>
    </div>
  );
}
