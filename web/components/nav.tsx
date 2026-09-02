"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, Boxes, LogOut, User } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const TABS = [
  { href: "/panel",    label: "Panel Principal", Icon: LayoutDashboard },
  { href: "/reservas", label: "Reservas",        Icon: Calendar },
  { href: "/stock",    label: "Stock",           Icon: Boxes },
];

export default function Nav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/panel" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center text-sm font-bold">SR</div>
            <div>
              <div className="text-sm font-bold leading-tight">Sistema de Reservas</div>
              <div className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
                Gestión de Materiales
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-[13px] font-semibold leading-tight">{profile.nombre}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{profile.rol}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-6">
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
