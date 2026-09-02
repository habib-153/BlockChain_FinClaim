"use client";

import { useSyncExternalStore } from "react";
import { SessionContext, type SessionContextValue } from "@/lib/session-context";
import * as sessionStore from "@/lib/session-store";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot
  );

  const value: SessionContextValue = {
    user,
    login: sessionStore.login,
    logout: sessionStore.logout,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
