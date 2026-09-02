import type { Claim, Receivable } from "@/lib/types";

export interface CapacitySummary {
  totalBdt: number;
  allocatedBdt: number;
  remainingBdt: number;
  allocatedPct: number;
}

/** Sums only APPROVED, non-frozen claims — the same rule fixture data already encodes. */
export function summarizeCapacity(
  receivable: Receivable,
  claims: Claim[]
): CapacitySummary {
  const allocatedBdt = claims
    .filter(
      (c) =>
        c.receivableId === receivable.id &&
        c.status === "APPROVED" &&
        !c.frozen
    )
    .reduce((sum, c) => sum + c.amountBdt, 0);

  const remainingBdt = Math.max(receivable.amountBdt - allocatedBdt, 0);
  const allocatedPct =
    receivable.amountBdt > 0
      ? Math.min((allocatedBdt / receivable.amountBdt) * 100, 100)
      : 0;

  return { totalBdt: receivable.amountBdt, allocatedBdt, remainingBdt, allocatedPct };
}

/** A new claim auto-approves iff it fits within remaining capacity — first-come, first-served. */
export function evaluateClaim(
  receivable: Receivable,
  existingClaims: Claim[],
  requestedAmountBdt: number
): { status: "APPROVED" | "REJECTED"; rejectionReason?: string } {
  const { remainingBdt } = summarizeCapacity(receivable, existingClaims);
  if (requestedAmountBdt <= remainingBdt) {
    return { status: "APPROVED" };
  }
  return {
    status: "REJECTED",
    rejectionReason: "Not eligible — exceeds available capacity.",
  };
}
