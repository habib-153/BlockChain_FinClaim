export type Role = "seller" | "buyer" | "lender" | "regulator";

export interface UserIdentity {
  email: string;
  role: Role;
  name: string;
  title: string;
  institution: string;
}

export type ReceivableStatus = "PENDING" | "ACTIVE";

export interface Receivable {
  id: string;
  sellerName: string;
  buyerName: string;
  amountBdt: number;
  description: string;
  status: ReceivableStatus;
  submittedAt: string;
  attestedAt?: string;
  invoiceFileName?: string;
}

export type ClaimType = "Pledge" | "Assignment";
export type ClaimStatus = "APPROVED" | "REJECTED";

export interface Claim {
  id: string;
  receivableId: string;
  lenderName: string;
  type: ClaimType;
  amountBdt: number;
  status: ClaimStatus;
  rejectionReason?: string;
  submittedAt: string;
  frozen: boolean;
}

export type FlagStatus = "PENDING_REVIEW" | "CLEARED";

export interface LinkedEntityFlag {
  id: string;
  claimantName: string;
  linkedEntityName: string;
  sharedDirector: string;
  invoiceAmountBdt: number;
  penaltyFeeBdt: number;
  status: FlagStatus;
  reason: string;
  raisedAt: string;
  clearedAt?: string;
  clearedDocumentName?: string;
}

export interface AnchorEvent {
  id: string;
  merkleRoot: string;
  timestamp: string;
  eventCount: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}
