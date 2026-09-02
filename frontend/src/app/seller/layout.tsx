"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="seller">{children}</RoleGuard>;
}
