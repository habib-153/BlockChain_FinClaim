import type { AnchorEvent, AuditEvent } from "@/lib/types";

export const ANCHORS: AnchorEvent[] = [
  {
    id: "Anchor #128",
    merkleRoot: "0x7f3a9c2e5b1d8a46f0c3e7b92d4a815fce6b0d3a2f9871c4de6a5b3f0912e91c",
    timestamp: "2026-09-03T14:00:00Z",
    eventCount: 42,
  },
  {
    id: "Anchor #127",
    merkleRoot: "0x2c88e14fa736bd905e1c4a7f3b0d8e296c5a1f047db3e82951c0a6f4b7d3e5a1",
    timestamp: "2026-09-02T14:00:00Z",
    eventCount: 37,
  },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "EVT-00041",
    timestamp: "2026-09-02T08:15:00Z",
    actor: "Bangladesh Bank - Financial Institutions Supervision Wing",
    action: "Linked-entity flag raised",
    detail:
      "Turag Apparel Solutions Ltd. flagged for shared directorship with Shitalakshya Fabrics Ltd. (FLAG-2026-0007).",
  },
  {
    id: "EVT-00035",
    timestamp: "2026-08-21T09:50:00Z",
    actor: "Meghna NBFI Ltd.",
    action: "Claim rejected",
    detail:
      "Pledge claim CLM-2026-00933 for BDT 500,000 against RCV-2026-04871 rejected - exceeds available capacity.",
  },
  {
    id: "EVT-00030",
    timestamp: "2026-08-20T11:35:00Z",
    actor: "Jamuna Capital & Finance Ltd.",
    action: "Claim approved",
    detail:
      "Assignment claim CLM-2026-00932 for BDT 300,000 against RCV-2026-04871 approved.",
  },
  {
    id: "EVT-00024",
    timestamp: "2026-08-19T14:10:00Z",
    actor: "Padma Bank PLC",
    action: "Claim approved",
    detail:
      "Pledge claim CLM-2026-00931 for BDT 400,000 against RCV-2026-04871 approved.",
  },
  {
    id: "EVT-00019",
    timestamp: "2026-08-19T13:05:00Z",
    actor: "Nordicwear Sourcing ApS",
    action: "Receivable attested",
    detail: "Buyer confirmed obligation on RCV-2026-04871 (BDT 1,000,000).",
  },
  {
    id: "EVT-00012",
    timestamp: "2026-08-18T09:20:00Z",
    actor: "Karnaphuli Garments Ltd.",
    action: "Receivable submitted",
    detail: "RCV-2026-04871 (BDT 1,000,000) submitted for buyer attestation.",
  },
];
