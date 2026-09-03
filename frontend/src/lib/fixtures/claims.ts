import type { Claim } from "@/lib/types";

/**
 * Flagship scenario for RCV-2026-04871 (BDT 1,000,000):
 * Padma (400,000, approved) + Jamuna (300,000, approved) = 700,000 allocated,
 * leaving 300,000 remaining capacity - which is why Meghna's 500,000 pledge
 * is rejected. See docs/handoff/phase-1-frontend.md §3.
 */
export const CLAIMS: Claim[] = [
  {
    id: "CLM-2026-00931",
    receivableId: "RCV-2026-04871",
    lenderName: "Padma Bank PLC",
    type: "Pledge",
    amountBdt: 400_000,
    status: "APPROVED",
    submittedAt: "2026-08-19T14:10:00Z",
    frozen: false,
  },
  {
    id: "CLM-2026-00932",
    receivableId: "RCV-2026-04871",
    lenderName: "Jamuna Capital & Finance Ltd.",
    type: "Assignment",
    amountBdt: 300_000,
    status: "APPROVED",
    submittedAt: "2026-08-20T11:35:00Z",
    frozen: false,
  },
  {
    id: "CLM-2026-00933",
    receivableId: "RCV-2026-04871",
    lenderName: "Meghna NBFI Ltd.",
    type: "Pledge",
    amountBdt: 500_000,
    status: "REJECTED",
    rejectionReason: "Not eligible - exceeds available capacity.",
    submittedAt: "2026-08-21T09:50:00Z",
    frozen: false,
  },
  {
    id: "CLM-2026-00934",
    receivableId: "RCV-2026-05102",
    lenderName: "Meghna NBFI Ltd.",
    type: "Pledge",
    amountBdt: 400_000,
    status: "PENDING",
    submittedAt: "2026-09-02T10:40:00Z",
    frozen: false,
    invoiceFileName: "KGL-INV-05102.pdf",
  },
];
