"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import { findUserByEmail, USERS } from "@/lib/fixtures/users";
import type { UserIdentity } from "@/lib/types";

const ROLE_LABELS: Record<UserIdentity["role"], string> = {
  seller: "Seller",
  buyer: "Buyer",
  lender: "Lender",
  regulator: "Regulator",
  admin: "Admin",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace(`/${user.role}`);
  }, [user, router]); // `user` is `undefined` while unresolved - the check above naturally skips that case

  const signInAs = (identity: UserIdentity) => {
    setError(null);
    setEmail(identity.email);
    setPassword("finclaim-access");
    setIsSubmitting(true);
    window.setTimeout(() => {
      login(identity);
      router.push(`/${identity.role}`);
    }, 800);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    const identity = findUserByEmail(email);
    if (!identity) {
      setError("Invalid email or password.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      login(identity);
      router.push(`/${identity.role}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-finclaim-navy-900"
        >
          <ArrowLeft className="size-3.5" />
          Back to FinClaim
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="mx-auto w-full max-w-sm space-y-6 lg:mx-0">
            <Image
              src="/brand/logo_v2.png"
              alt="FinClaim"
              width={200}
              height={43}
              priority
            />

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold">Sign in</h2>
                <p className="text-sm text-muted-foreground">
                  Access your institution&apos;s FinClaim workspace.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@institution.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-finclaim-brick-500">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <LogIn />
                    )}
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-slate-50/60">
            <CardHeader>
              <h2 className="text-sm font-semibold text-finclaim-navy-900">Quick access</h2>
              <p className="text-sm text-muted-foreground">
                Jump straight into any participant&apos;s workspace for this session.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {USERS.map((identity) => (
                  <button
                    key={identity.email}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => signInAs(identity)}
                    className="flex flex-col items-start gap-0.5 rounded-lg border border-border/60 bg-white px-3.5 py-3 text-left transition-colors hover:border-finclaim-teal-700/40 hover:bg-finclaim-teal-700/5 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <span className="text-[11px] font-semibold tracking-wide text-finclaim-teal-700 uppercase">
                      {ROLE_LABELS[identity.role]}
                    </span>
                    <span className="text-sm font-medium text-finclaim-navy-900">
                      {identity.institution}
                    </span>
                    <span className="text-xs text-muted-foreground">{identity.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
