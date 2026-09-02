"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { LandingPage } from "@/components/marketing/LandingPage";
import { useSession } from "@/hooks/useSession";

export default function RootPage() {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(`/${user.role}`);
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-finclaim-teal-700" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-finclaim-teal-700" />
      </div>
    );
  }

  return <LandingPage />;
}
