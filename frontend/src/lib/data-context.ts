import { createContext } from "react";
import type {
  AnchorEvent,
  AuditEvent,
  Claim,
  LinkedEntityFlag,
  Receivable,
} from "@/lib/types";
import type {
  RaiseFlagInput,
  SubmitClaimInput,
  SubmitReceivableInput,
} from "@/lib/app-data-store";

export interface AppDataContextValue {
  receivables: Receivable[];
  claims: Claim[];
  flags: LinkedEntityFlag[];
  auditEvents: AuditEvent[];
  anchors: AnchorEvent[];
  submitReceivable: (input: SubmitReceivableInput) => Receivable;
  attestReceivable: (receivableId: string) => void;
  submitClaim: (input: SubmitClaimInput) => Claim;
  decideClaim: (
    claimId: string,
    decision: "APPROVED" | "REJECTED",
    actorName: string
  ) => Claim | null;
  raiseFlag: (input: RaiseFlagInput, actorName: string) => LinkedEntityFlag;
  clearFlag: (flagId: string, documentName: string, actorName: string) => void;
  setClaimFrozen: (claimId: string, frozen: boolean, actorName: string) => void;
  resetToFixtures: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);
