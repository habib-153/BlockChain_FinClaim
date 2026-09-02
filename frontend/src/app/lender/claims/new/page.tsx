"use client";

import { SubmitClaimForm } from "@/components/claim/SubmitClaimForm";
import { useSession } from "@/hooks/useSession";

export default function NewClaimPage() {
  const { user } = useSession();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Submit a claim</h1>
        <p className="text-sm text-muted-foreground">
          Pledge or take assignment of an active receivable, within remaining
          capacity.
        </p>
      </div>
      <SubmitClaimForm lenderName={user.institution} />
    </div>
  );
}
