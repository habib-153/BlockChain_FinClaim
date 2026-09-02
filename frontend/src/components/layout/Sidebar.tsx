"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePlus2,
  LayoutDashboard,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  seller: [
    { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
    { label: "Submit receivable", href: "/seller/receivables/new", icon: FilePlus2 },
  ],
  buyer: [{ label: "Dashboard", href: "/buyer", icon: LayoutDashboard }],
  lender: [
    { label: "Dashboard", href: "/lender", icon: LayoutDashboard },
    { label: "Submit claim", href: "/lender/claims/new", icon: FilePlus2 },
  ],
  regulator: [
    { label: "Dashboard", href: "/regulator", icon: LayoutDashboard },
    { label: "Review queue", href: "/regulator/flags", icon: ShieldAlert },
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  seller: "Seller",
  buyer: "Buyer",
  lender: "Lender",
  regulator: "Regulator",
};

export function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Image
          src="/brand/finclaim-logo.png"
          alt="FinClaim"
          width={32}
          height={32}
          className="size-8 shrink-0"
        />
        <div className="leading-tight">
          <div className="text-base font-semibold tracking-tight">FinClaim</div>
          <div className="text-[10px] font-medium tracking-widest text-sidebar-foreground/50">
            TRUST · VERIFY · TRANSACT
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase">
          {ROLE_LABELS[role]} workspace
        </div>
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("size-4", active && "text-sidebar-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[11px] text-sidebar-foreground/40">
        Permissioned receivable-claim registry
      </div>
    </div>
  );
}
