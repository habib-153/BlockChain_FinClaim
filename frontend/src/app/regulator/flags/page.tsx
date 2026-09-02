"use client";

import { FlagReviewCard } from "@/components/flag/FlagReviewCard";
import { useAppData } from "@/hooks/useAppData";

export default function FlagsReviewPage() {
  const { flags } = useAppData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Linked-entity review queue</h1>
        <p className="text-sm text-muted-foreground">
          Claims flagged for shared directorship or other linked-entity risk.
          Nothing here is auto-blocked - each flag needs an explicit review.
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          No flags in the review queue.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {flags.map((f) => (
            <FlagReviewCard key={f.id} flag={f} />
          ))}
        </div>
      )}
    </div>
  );
}
