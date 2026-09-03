import { USERS } from "@/lib/fixtures/users";
import type { Claim, LinkedEntityFlag, Receivable } from "@/lib/types";

export interface InstitutionRow {
  name: string;
  roleLabel: string;
  contactName?: string;
  contactTitle?: string;
  hasAccount: boolean;
  receivablesSubmitted: number;
  requestsReceived: number;
  requestsApproved: number;
  totalApprovedBdt: number;
  flagsCount: number;
}

const ROLE_LABELS: Record<string, string> = {
  seller: "Seller",
  buyer: "Buyer",
  lender: "Lender",
  regulator: "Regulator",
};

function emptyRow(name: string, roleLabel: string, hasAccount: boolean): InstitutionRow {
  return {
    name,
    roleLabel,
    hasAccount,
    receivablesSubmitted: 0,
    requestsReceived: 0,
    requestsApproved: 0,
    totalApprovedBdt: 0,
    flagsCount: 0,
  };
}

/** Joins the fixed user roster with live receivable/claim/flag data by institution name. */
export function buildInstitutionDirectory(
  receivables: Receivable[],
  claims: Claim[],
  flags: LinkedEntityFlag[]
): InstitutionRow[] {
  const rows = new Map<string, InstitutionRow>();

  for (const u of USERS) {
    if (u.role === "admin") continue;
    const row = emptyRow(u.institution, ROLE_LABELS[u.role] ?? u.role, true);
    row.contactName = u.name;
    row.contactTitle = u.title;
    rows.set(u.institution, row);
  }

  const ensure = (name: string, roleLabel: string) => {
    let row = rows.get(name);
    if (!row) {
      row = emptyRow(name, roleLabel, false);
      rows.set(name, row);
    }
    return row;
  };

  for (const r of receivables) {
    ensure(r.sellerName, "Seller").receivablesSubmitted += 1;
  }
  for (const c of claims) {
    const row = ensure(c.lenderName, "Lender");
    row.requestsReceived += 1;
    if (c.status === "APPROVED") {
      row.requestsApproved += 1;
      row.totalApprovedBdt += c.amountBdt;
    }
  }
  for (const f of flags) {
    ensure(f.claimantName, "Flagged entity").flagsCount += 1;
  }

  return Array.from(rows.values()).sort((a, b) => a.name.localeCompare(b.name));
}
