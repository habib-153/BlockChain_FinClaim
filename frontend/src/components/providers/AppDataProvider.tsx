"use client";

import { useSyncExternalStore } from "react";
import * as appDataStore from "@/lib/app-data-store";
import { AppDataContext, type AppDataContextValue } from "@/lib/data-context";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    appDataStore.subscribe,
    appDataStore.getSnapshot,
    appDataStore.getServerSnapshot
  );

  const value: AppDataContextValue = {
    ...state,
    submitReceivable: appDataStore.submitReceivable,
    attestReceivable: appDataStore.attestReceivable,
    submitClaim: appDataStore.submitClaim,
    decideClaim: appDataStore.decideClaim,
    raiseFlag: appDataStore.raiseFlag,
    clearFlag: appDataStore.clearFlag,
    setClaimFrozen: appDataStore.setClaimFrozen,
    resetToFixtures: appDataStore.resetToFixtures,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
