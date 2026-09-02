import { createContext } from "react";
import type { UserIdentity } from "@/lib/types";

export interface SessionContextValue {
  /** `undefined` = session not resolved yet (still reading localStorage); `null` = definitely logged out. */
  user: UserIdentity | null | undefined;
  login: (user: UserIdentity) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
