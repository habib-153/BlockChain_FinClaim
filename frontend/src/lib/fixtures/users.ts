import type { UserIdentity } from "@/lib/types";

/**
 * Login directory (email -> identity). Match on email only, case-insensitive;
 * any non-empty password is accepted. Never render this list in the UI.
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
];

export function findUserByEmail(email: string): UserIdentity | undefined {
  const normalized = email.trim().toLowerCase();
  return USERS.find((u) => u.email.toLowerCase() === normalized);
}
