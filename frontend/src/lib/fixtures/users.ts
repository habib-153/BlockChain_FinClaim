import type { UserIdentity } from "@/lib/types";

/**
 * Login directory (email -> identity). Match on email only, case-insensitive;
 * any non-empty password is accepted. The login page's "Quick access" panel
 * renders role/institution/name from this list for faster access during
 * presentations - email addresses themselves are still never printed in the
 * UI, and an unmatched typed-in email still falls back to a generic
 * "invalid credentials" error rather than hinting at valid ones.
 */
export const USERS: UserIdentity[] = [
  {
    email: "nasrin.sultana@karnaphuligarments.com",
    role: "seller",
    name: "Nasrin Sultana",
    title: "Authorized Signatory",
    institution: "Karnaphuli Garments Ltd.",
  },
  {
    email: "trade@nordicwearsourcing.dk",
    role: "buyer",
    name: "Mette Johansen",
    title: "Trade Finance Officer",
    institution: "Nordicwear Sourcing ApS",
  },
  {
    email: "tradefinance@padmabankplc.com",
    role: "lender",
    name: "Shafiqul Islam",
    title: "Trade Finance Desk",
    institution: "Padma Bank PLC",
  },
  {
    email: "smefinance@jamunacapital.com.bd",
    role: "lender",
    name: "Farhana Yasmin",
    title: "SME Finance Unit",
    institution: "Jamuna Capital & Finance Ltd.",
  },
  {
    email: "receivables@meghnanbfi.com.bd",
    role: "lender",
    name: "Kamrul Hasan",
    title: "Receivables Finance Unit",
    institution: "Meghna NBFI Ltd.",
  },
  {
    email: "supervision@bb.gov.bd",
    role: "regulator",
    name: "Rezaul Karim",
    title: "Reviewer, Financial Institutions Supervision Wing",
    institution: "Bangladesh Bank",
  },
  {
    email: "trust@finclaim.com.bd",
    role: "admin",
    name: "MD Samiul Islam Tamim",
    title: "Head of Trust & Compliance",
    institution: "FinClaim",
  },
];

export function findUserByEmail(email: string): UserIdentity | undefined {
  const normalized = email.trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === normalized);
}

export const LENDER_INSTITUTIONS = USERS.filter((u) => u.role === "lender").map(
  (u) => u.institution
);
