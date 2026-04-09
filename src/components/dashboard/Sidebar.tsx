"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  UserRound,
  FileSpreadsheet,
  LogOut,
  LucideIcon,
  Shield,
} from "lucide-react";

type IconType = LucideIcon;

const items: Array<{
  href: string;
  label: string;
  Icon: IconType;
}> = [
  { href: "/overview", label: "Overview", Icon: LayoutDashboard },
  { href: "/users", label: "Users", Icon: Users },
  { href: "/patients", label: "Patients", Icon: UserRound },
  { href: "/formularies", label: "Formularies", Icon: FileSpreadsheet },
];

export default function Sidebar({ active }: { active?: string }) {
  const pathname = usePathname();
  const current = active ?? pathname ?? "";
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "SA";

  const displayName = user?.name ?? "Super Admin";
  const displayEmail = user?.email ?? "admin@4sightrx.com";

  return (
    <aside className="h-screen w-64 bg-white text-slate-600 border-r border-slate-200 fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center w-full min-h-[52px]">
          <Image
            src="/logo.png"
            alt="4sightRX Logo"
            width={400}
            height={120}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = current === item.href || current.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 relative rounded-xl mx-0",
                isActive
                  ? "bg-blue-50 text-[#006FC9] font-medium"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#006FC9]" />
              )}
              <item.Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0",
                  isActive ? "text-[#006FC9]" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-4 w-auto" />

      {/* Bottom: User card + Logout */}
      <div className="p-3 space-y-2">
        {/* Mini user card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#006FC9] to-[#00A3A3] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1.5 ring-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
            <div className="flex items-center gap-1">
              <Shield className="h-2.5 w-2.5 text-[#006FC9]" />
              <p className="text-[10px] text-slate-400 truncate">Admin</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group border border-transparent hover:border-red-100"
        >
          <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors duration-200">
            <LogOut className="h-3.5 w-3.5 text-red-500 group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
