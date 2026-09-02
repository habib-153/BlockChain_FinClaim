import type { LinkedEntityFlag } from "@/lib/types";

const INVOICE_AMOUNT = 800_000;

export const FLAGS: LinkedEntityFlag[] = [
  {
    id: "FLAG-2026-0007",
    claimantName: "Turag Apparel Solutions Ltd.",
    linkedEntityName: "Shitalakshya Fabrics Ltd.",
    sharedDirector: "Mohammad Aminul Kabir",
    invoiceAmountBdt: INVOICE_AMOUNT,
    penaltyFeeBdt: Math.round(INVOICE_AMOUNT * 0.0002),
    status: "PENDING_REVIEW",
    reason:
      "Shares director Mohammad Aminul Kabir with Shitalakshya Fabrics Ltd., an entity with a prior disputed claim.",
    raisedAt: "2026-09-02T08:15:00Z",
  },
];
