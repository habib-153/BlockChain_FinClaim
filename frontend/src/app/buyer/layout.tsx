"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="buyer">{children}</RoleGuard>;
}
