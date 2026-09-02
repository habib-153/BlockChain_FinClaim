import { useContext } from "react";
import { AppDataContext } from "@/lib/data-context";

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
