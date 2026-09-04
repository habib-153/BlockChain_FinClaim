import { RECEIVABLES } from "./receivables";
import { CLAIMS } from "./claims";

/**
 * IDs of the pre-seeded flagship-scenario receivables/claims. Seller, buyer,
 * and lender workspaces filter these out of everything they render so a live
 * recording starts from a blank slate; regulator (Bangladesh Bank) and admin
 * keep full visibility since they read the same shared store unfiltered.
 */
export const SEED_RECEIVABLE_IDS = new Set(RECEIVABLES.map((r) => r.id));
export const SEED_CLAIM_IDS = new Set(CLAIMS.map((c) => c.id));
