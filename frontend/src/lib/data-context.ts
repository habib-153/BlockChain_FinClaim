import { createContext } from "react";
import type {
  AnchorEvent,
  AuditEvent,
  Claim,
  LinkedEntityFlag,
  Receivable,
} from "@/lib/types";
import type { SubmitClaimInput, SubmitReceivableInput } from "@/lib/app-data-store";

export interface AppDataContextValue {
  receivables: Receivable[];
  claims: Claim[];
  flags: LinkedEntityFlag[];
  auditEvents: AuditEvent[];
  anchors: AnchorEvent[];
  submitReceivable: (input: SubmitReceivableInput) => Receivable;
  attestReceivable: (receivableId: string) => void;
  submitClaim: (input: SubmitClaimInput) => Claim;
  clearFlag: (flagId: string, documentName: string) => void;
  setClaimFrozen: (claimId: string, frozen: boolean) => void;
  resetToFixtures: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);
