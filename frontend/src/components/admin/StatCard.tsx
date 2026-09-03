import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accentClassName = "text-finclaim-teal-700",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accentClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
          <Icon className={cn("size-4", accentClassName)} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-semibold", accentClassName)}>{value}</div>
      </CardContent>
    </Card>
  );
}
