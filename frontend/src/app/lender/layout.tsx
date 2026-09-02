"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";

export default function LenderLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="lender">{children}</RoleGuard>;
}
