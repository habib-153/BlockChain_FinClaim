"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePlus2,
  LayoutDashboard,
  SendHorizonal,
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
    { label: "New financing application", href: "/seller/receivables/new", icon: FilePlus2 },
    { label: "Request more financing", href: "/seller/financing/new", icon: SendHorizonal },
  ],
  buyer: [{ label: "Dashboard", href: "/buyer", icon: LayoutDashboard }],
  lender: [{ label: "Dashboard", href: "/lender", icon: LayoutDashboard }],
  regulator: [{ label: "Dashboard", href: "/regulator", icon: LayoutDashboard }],
  admin: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
};

export const ROLE_LABELS: Record<Role, string> = {
  seller: "Seller",
  buyer: "Buyer",
  lender: "Lender",
  regulator: "Regulator",
  admin: "Admin",
};

export function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col px-5 py-3">
        <Image src="/brand/logo_v2.png" alt="FinClaim" width={200} height={60} />
        {/* <div className="text-[10px] font-medium tracking-widest text-sidebar-foreground/50">
          TRUST · VERIFY · TRANSACT
        </div> */}
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
