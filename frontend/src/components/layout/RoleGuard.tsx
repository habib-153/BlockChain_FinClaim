"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useSession } from "@/hooks/useSession";
import type { Role } from "@/lib/types";

export function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user } = useSession();
  const router = useRouter();
  const resolved = user !== undefined;

  useEffect(() => {
    if (!resolved) return;
    if (!user || user.role !== role) {
      router.replace("/login");
    }
  }, [resolved, user, role, router]);

  if (!resolved || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="size-6 animate-spin text-finclaim-teal-700" />
      </div>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
