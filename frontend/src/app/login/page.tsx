"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import { findUserByEmail } from "@/lib/fixtures/users";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace(`/${user.role}`);
  }, [user, router]); // `user` is `undefined` while unresolved — the check above naturally skips that case

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
    <div className="flex min-h-screen items-center justify-center bg-finclaim-navy-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/finclaim-logo.png"
            alt="FinClaim"
            width={56}
            height={56}
            // className="size-14"
            priority
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">FinClaim</h1>
            <p className="text-xs font-medium tracking-widest text-white/50">
              TRUST · VERIFY · TRANSACT
            </p>
          </div>
        </div>

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
    </div>
  );
}
