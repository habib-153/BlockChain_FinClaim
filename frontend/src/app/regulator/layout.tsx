"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";

export default function RegulatorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="regulator">{children}</RoleGuard>;
}
