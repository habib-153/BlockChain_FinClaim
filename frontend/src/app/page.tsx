"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";

export default function RootPage() {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    router.replace(user ? `/${user.role}` : "/login");
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Loader2 className="size-6 animate-spin text-finclaim-teal-700" />
    </div>
  );
}
