import { ANCHORS, AUDIT_EVENTS } from "@/lib/fixtures/auditLog";
import { CLAIMS } from "@/lib/fixtures/claims";
import { FLAGS } from "@/lib/fixtures/flags";
import { RECEIVABLES, SELLER_NAME } from "@/lib/fixtures/receivables";
import { evaluateClaim, summarizeCapacity } from "@/lib/capacity";
import { nextClaimId, nextEventId, nextFlagId, nextReceivableId } from "@/lib/ids";
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
  targetLenderName: string;
  claimType: ClaimType;
  requestedAmountBdt: number;
}

export interface SubmitClaimInput {
  receivableId: string;
  lenderName: string;
  type: ClaimType;
  amountBdt: number;
  invoiceFileName?: string;
}

export interface RaiseFlagInput {
  claimantName: string;
  linkedEntityName: string;
  sharedDirector: string;
  invoiceAmountBdt: number;
  reason: string;
  relatedReceivableId?: string;
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

/** Reads localStorage once and caches - safe to call on every render. */
export function getSnapshot(): AppDataState {
  if (cached === undefined) cached = readFromStorage();
  return cached;
}

/**
 * Matches the server-rendered (fixture defaults) markup so hydration never
 * mismatches. Must return a stable reference - React re-renders in a loop
 * otherwise - so this is computed once, not on every call.
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
  const claim: Claim = {
    id: nextClaimId(state.claims.map((c) => c.id)),
    receivableId: id,
    lenderName: input.targetLenderName,
    type: input.claimType,
    amountBdt: input.requestedAmountBdt,
    status: "PENDING",
    submittedAt: new Date().toISOString(),
    frozen: false,
    invoiceFileName: input.invoiceFileName,
  };
  const receivableEvent = appendAuditEvent(
    state,
    SELLER_NAME,
    "Receivable submitted",
    `${id} (${input.amountBdt.toLocaleString("en-US")} BDT) submitted for buyer attestation.`
  );
  const claimEvent = appendAuditEvent(
    { ...state, auditEvents: [receivableEvent, ...state.auditEvents] },
    SELLER_NAME,
    "Financing request submitted",
    `${input.claimType} request ${claim.id} for ${input.requestedAmountBdt.toLocaleString(
      "en-US"
    )} BDT to ${input.targetLenderName} against ${id} - pending buyer attestation.`
  );
  persist({
    ...state,
    receivables: [...state.receivables, created],
    claims: [...state.claims, claim],
    auditEvents: [claimEvent, receivableEvent, ...state.auditEvents],
  });
  return created;
}

export function attestReceivable(receivableId: string): void {
  const state = getSnapshot();
  const target = state.receivables.find((r) => r.id === receivableId);
  if (!target || target.status === "ACTIVE") return;

  const activatedReceivable: Receivable = {
    ...target,
    status: "ACTIVE",
    attestedAt: new Date().toISOString(),
  };
  const attestEvent = appendAuditEvent(
    state,
    target.buyerName,
    "Receivable attested",
    `Buyer confirmed obligation on ${receivableId} (${target.amountBdt.toLocaleString("en-US")} BDT).`
  );

  // Requests bundled at submission time only get the auto-reject check now
  // that attestation has happened - none of them auto-approve, so each is
  // evaluated independently against the same (unaffected-by-this-loop)
  // APPROVED-claims capacity snapshot.
  const events: AuditEvent[] = [];
  const claims = state.claims.map((c) => {
    if (c.status !== "PENDING" || c.receivableId !== receivableId) return c;
    const outcome = evaluateClaim(activatedReceivable, state.claims, c.amountBdt);
    events.push(
      appendAuditEvent(
        { ...state, auditEvents: [...events, attestEvent, ...state.auditEvents] },
        c.lenderName,
        outcome.status === "REJECTED" ? "Financing request rejected" : "Financing request pending review",
        `${c.type} request ${c.id} for ${c.amountBdt.toLocaleString("en-US")} BDT against ${receivableId} ${
          outcome.status === "REJECTED"
            ? "rejected - exceeds available capacity"
            : `sent to ${c.lenderName} for review`
        }.`
      )
    );
    return outcome.status === "REJECTED"
      ? { ...c, status: outcome.status, rejectionReason: outcome.rejectionReason }
      : c;
  });

  persist({
    ...state,
    receivables: state.receivables.map((r) => (r.id === receivableId ? activatedReceivable : r)),
    claims,
    auditEvents: [...events.reverse(), attestEvent, ...state.auditEvents],
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
    invoiceFileName: input.invoiceFileName,
  };

  const event = appendAuditEvent(
    state,
    SELLER_NAME,
    outcome.status === "REJECTED" ? "Financing request rejected" : "Financing request submitted",
    `${input.type} request ${created.id} for ${input.amountBdt.toLocaleString(
      "en-US"
    )} BDT to ${input.lenderName} against ${input.receivableId} ${
      outcome.status === "REJECTED"
        ? "rejected - exceeds available capacity"
        : `sent to ${input.lenderName} for review`
    }.`
  );

  persist({
    ...state,
    claims: [...state.claims, created],
    auditEvents: [event, ...state.auditEvents],
  });
  return created;
}

/**
 * The bank's own manual decision on a PENDING financing request - approval
 * is never automatic. Returns null (no-op, nothing persisted) if the claim
 * isn't PENDING, or if approving it would now exceed remaining capacity
 * (capacity is re-checked at decision time, not just at submission time,
 * since other requests may have been approved in the meantime) - the caller
 * should surface that as an error rather than silently rejecting the claim.
 */
export function decideClaim(
  claimId: string,
  decision: "APPROVED" | "REJECTED",
  actorName: string
): Claim | null {
  const state = getSnapshot();
  const target = state.claims.find((c) => c.id === claimId);
  if (!target || target.status !== "PENDING") return null;
  const receivable = state.receivables.find((r) => r.id === target.receivableId);
  if (!receivable) return null;

  if (decision === "APPROVED") {
    const { remainingBdt } = summarizeCapacity(receivable, state.claims);
    if (target.amountBdt > remainingBdt) return null;
  }

  const updated: Claim = {
    ...target,
    status: decision,
    rejectionReason: decision === "REJECTED" ? `Declined by ${actorName}.` : undefined,
  };

  const event = appendAuditEvent(
    state,
    actorName,
    decision === "APPROVED" ? "Financing request approved" : "Financing request rejected",
    `${target.type} request ${claimId} for ${target.amountBdt.toLocaleString(
      "en-US"
    )} BDT against ${target.receivableId} ${decision === "APPROVED" ? "approved" : "rejected"} by ${actorName}.`
  );

  persist({
    ...state,
    claims: state.claims.map((c) => (c.id === claimId ? updated : c)),
    auditEvents: [event, ...state.auditEvents],
  });
  return updated;
}

export function raiseFlag(input: RaiseFlagInput, actorName: string): LinkedEntityFlag {
  const state = getSnapshot();
  const created: LinkedEntityFlag = {
    id: nextFlagId(state.flags.map((f) => f.id)),
    claimantName: input.claimantName,
    linkedEntityName: input.linkedEntityName,
    sharedDirector: input.sharedDirector,
    invoiceAmountBdt: input.invoiceAmountBdt,
    penaltyFeeBdt: Math.round(input.invoiceAmountBdt * 0.0002),
    status: "PENDING_REVIEW",
    reason: input.reason,
    raisedAt: new Date().toISOString(),
    raisedBy: actorName,
    relatedReceivableId: input.relatedReceivableId,
  };

  const event = appendAuditEvent(
    state,
    actorName,
    "Linked-entity flag raised",
    `${input.claimantName} flagged (${created.id}) - shares director ${input.sharedDirector} with ${input.linkedEntityName}.`
  );

  persist({
    ...state,
    flags: [...state.flags, created],
    auditEvents: [event, ...state.auditEvents],
  });
  return created;
}

export function clearFlag(flagId: string, documentName: string, actorName: string): void {
  const state = getSnapshot();
  const target = state.flags.find((f) => f.id === flagId);
  if (!target) return;

  const event = appendAuditEvent(
    state,
    actorName,
    "Linked-entity flag cleared",
    `${flagId} (${target.claimantName}) cleared - flag clearance fee ${target.penaltyFeeBdt.toLocaleString(
      "en-US"
    )} BDT paid, supporting document ${documentName} on file.`
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

export function setClaimFrozen(claimId: string, frozen: boolean, actorName: string): void {
  const state = getSnapshot();
  const target = state.claims.find((c) => c.id === claimId);
  if (!target) return;

  const event = appendAuditEvent(
    state,
    actorName,
    frozen ? "Transaction frozen" : "Transaction unfrozen",
    `${claimId} against ${target.receivableId} ${frozen ? "frozen" : "unfrozen"} by ${actorName}.`
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
