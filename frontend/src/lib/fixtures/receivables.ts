import type { Receivable } from "@/lib/types";

export const SELLER_NAME = "Karnaphuli Garments Ltd.";
export const BUYER_NAME = "Nordicwear Sourcing ApS";

export const RECEIVABLES: Receivable[] = [
  {
    id: "RCV-2026-04871",
    sellerName: SELLER_NAME,
    buyerName: BUYER_NAME,
    amountBdt: 1_000_000,
    description:
      "Export shipment - knitwear consignment, Q3 2026 production run.",
    status: "ACTIVE",
    submittedAt: "2026-08-18T09:20:00Z",
    attestedAt: "2026-08-19T13:05:00Z",
    invoiceFileName: "KGL-INV-04871.pdf",
  },
  {
    id: "RCV-2026-05102",
    sellerName: SELLER_NAME,
    buyerName: BUYER_NAME,
    amountBdt: 650_000,
    description: "Export shipment - woven outerwear, September dispatch.",
    status: "PENDING",
    submittedAt: "2026-09-02T10:40:00Z",
    invoiceFileName: "KGL-INV-05102.pdf",
  },
];
