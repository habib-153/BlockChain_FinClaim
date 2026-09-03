import type { LinkedEntityFlag } from "@/lib/types";

const INVOICE_AMOUNT = 800_000;
const PRIOR_INVOICE_AMOUNT = 950_000;

export const FLAGS: LinkedEntityFlag[] = [
  {
    id: "FLAG-2026-0003",
    claimantName: "Shitalakshya Fabrics Ltd.",
    linkedEntityName: "Turag Apparel Solutions Ltd.",
    sharedDirector: "Mohammad Aminul Kabir",
    invoiceAmountBdt: PRIOR_INVOICE_AMOUNT,
    penaltyFeeBdt: Math.round(PRIOR_INVOICE_AMOUNT * 0.0002),
    status: "CLEARED",
    reason:
      "Shares director Mohammad Aminul Kabir with Turag Apparel Solutions Ltd. - the earlier disputed claim referenced in FLAG-2026-0007.",
    raisedAt: "2026-07-14T09:30:00Z",
    raisedBy: "FinClaim",
    clearedAt: "2026-07-21T11:05:00Z",
    clearedDocumentName: "shitalakshya-compliance-cert.pdf",
  },
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
    raisedBy: "FinClaim",
  },
];
