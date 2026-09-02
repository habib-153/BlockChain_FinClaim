import { ANCHORS, AUDIT_EVENTS } from "@/lib/fixtures/auditLog";
import { CLAIMS } from "@/lib/fixtures/claims";
import { FLAGS } from "@/lib/fixtures/flags";
import { RECEIVABLES, SELLER_NAME } from "@/lib/fixtures/receivables";
import { evaluateClaim } from "@/lib/capacity";
import { nextClaimId, nextEventId, nextReceivableId } from "@/lib/ids";
import type {
  AnchorEvent,
  AuditEvent,
  Claim,
  ClaimType,
  LinkedEntityFlag,
  Receivable,
} from "@/lib/types";

const STORAGE_KEY = "finclaim.appData.v1";

export interface AppDataState {
  receivables: Receivable[];
  claims: Claim[];
  flags: LinkedEntityFlag[];
  auditEvents: AuditEvent[];
  anchors: AnchorEvent[];
}

export interface SubmitReceivableInput {
  buyerName: string;
  amountBdt: number;
  description: string;
  invoiceFileName?: string;
}

export interface SubmitClaimInput {
  receivableId: string;
  lenderName: string;
  type: ClaimType;
  amountBdt: number;
}

function fixtureDefaults(): AppDataState {
  return {
    receivables: RECEIVABLES,
    claims: CLAIMS,
    flags: FLAGS,
    auditEvents: AUDIT_EVENTS,
    anchors: ANCHORS,
  };
}

function readFromStorage(): AppDataState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppDataState) : fixtureDefaults();
  } catch {
    return fixtureDefaults();
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cached: AppDataState | undefined;

function emit() {
  listeners.forEach((listener) => listener());
}

function persist(next: AppDataState) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
  emit();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reads localStorage once and caches — safe to call on every render. */
export function getSnapshot(): AppDataState {
  if (cached === undefined) cached = readFromStorage();
  return cached;
}

/**
 * Matches the server-rendered (fixture defaults) markup so hydration never
 * mismatches. Must return a stable reference — React re-renders in a loop
 * otherwise — so this is computed once, not on every call.
 */
const SERVER_SNAPSHOT: AppDataState = fixtureDefaults();

export function getServerSnapshot(): AppDataState {
  return SERVER_SNAPSHOT;
}

function appendAuditEvent(
  state: AppDataState,
  actor: string,
  action: string,
  detail: string
): AuditEvent {
  return {
    id: nextEventId(state.auditEvents.map((e) => e.id)),
    timestamp: new Date().toISOString(),
    actor,
    action,
    detail,
  };
}

export function submitReceivable(input: SubmitReceivableInput): Receivable {
  const state = getSnapshot();
  const id = nextReceivableId(state.receivables.map((r) => r.id));
  const created: Receivable = {
    id,
    sellerName: SELLER_NAME,
    buyerName: input.buyerName,
    amountBdt: input.amountBdt,
    description: input.description,
    status: "PENDING",
    submittedAt: new Date().toISOString(),
    invoiceFileName: input.invoiceFileName,
  };
  const event = appendAuditEvent(
    state,
    SELLER_NAME,
    "Receivable submitted",
    `${id} (${input.amountBdt.toLocaleString("en-US")} BDT) submitted for buyer attestation.`
  );
  persist({
    ...state,
    receivables: [...state.receivables, created],
    auditEvents: [event, ...state.auditEvents],
  });
  return created;
}

export function attestReceivable(receivableId: string): void {
  const state = getSnapshot();
  const target = state.receivables.find((r) => r.id === receivableId);
  if (!target || target.status === "ACTIVE") return;

  const event = appendAuditEvent(
    state,
    target.buyerName,
    "Receivable attested",
    `Buyer confirmed obligation on ${receivableId} (${target.amountBdt.toLocaleString("en-US")} BDT).`
  );
  persist({
    ...state,
    receivables: state.receivables.map((r) =>
      r.id === receivableId
        ? { ...r, status: "ACTIVE", attestedAt: new Date().toISOString() }
        : r
    ),
    auditEvents: [event, ...state.auditEvents],
  });
}

export function submitClaim(input: SubmitClaimInput): Claim {
  const state = getSnapshot();
  const receivable = state.receivables.find((r) => r.id === input.receivableId);
  const outcome = receivable
    ? evaluateClaim(receivable, state.claims, input.amountBdt)
    : { status: "REJECTED" as const, rejectionReason: "Receivable not found." };

  const created: Claim = {
    id: nextClaimId(state.claims.map((c) => c.id)),
    receivableId: input.receivableId,
    lenderName: input.lenderName,
    type: input.type,
    amountBdt: input.amountBdt,
    status: outcome.status,
    rejectionReason: outcome.rejectionReason,
    submittedAt: new Date().toISOString(),
    frozen: false,
  };

  const event = appendAuditEvent(
    state,
    input.lenderName,
    outcome.status === "APPROVED" ? "Claim approved" : "Claim rejected",
    `${input.type} claim ${created.id} for ${input.amountBdt.toLocaleString(
      "en-US"
    )} BDT against ${input.receivableId} ${
      outcome.status === "APPROVED" ? "approved" : "rejected — exceeds available capacity"
    }.`
  );

  persist({
    ...state,
    claims: [...state.claims, created],
    auditEvents: [event, ...state.auditEvents],
  });
  return created;
}

export function clearFlag(flagId: string, documentName: string): void {
  const state = getSnapshot();
  const target = state.flags.find((f) => f.id === flagId);
  if (!target) return;

  const event = appendAuditEvent(
    state,
    "Bangladesh Bank — Financial Institutions Supervision Wing",
    "Linked-entity flag cleared",
    `${flagId} (${target.claimantName}) cleared — penalty fee ${target.penaltyFeeBdt.toLocaleString(
      "en-US"
    )} BDT acknowledged, supporting document ${documentName} on file.`
  );

  persist({
    ...state,
    flags: state.flags.map((f) =>
      f.id === flagId
        ? {
            ...f,
            status: "CLEARED",
            clearedAt: new Date().toISOString(),
            clearedDocumentName: documentName,
          }
        : f
    ),
    auditEvents: [event, ...state.auditEvents],
  });
}

export function setClaimFrozen(claimId: string, frozen: boolean): void {
  const state = getSnapshot();
  const target = state.claims.find((c) => c.id === claimId);
  if (!target) return;

  const event = appendAuditEvent(
    state,
    "Bangladesh Bank — Financial Institutions Supervision Wing",
    frozen ? "Claim frozen" : "Claim unfrozen",
    `${claimId} against ${target.receivableId} ${frozen ? "frozen" : "unfrozen"} by the regulator.`
  );

  persist({
    ...state,
    claims: state.claims.map((c) => (c.id === claimId ? { ...c, frozen } : c)),
    auditEvents: [event, ...state.auditEvents],
  });
}

export function resetToFixtures(): void {
  persist(fixtureDefaults());
}
