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
  Building2,
} from "lucide-react";

type IconType = LucideIcon;

interface NavItem {
  href: string;
  label: string;
  Icon: IconType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { href: "/overview", label: "Overview", Icon: LayoutDashboard },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/users", label: "User Management", Icon: Users },
      { href: "/patients", label: "Patient Records", Icon: UserRound },
      { href: "/facilities", label: "Facilities & Agencies", Icon: Building2 },
      { href: "/formularies", label: "Drug Formularies", Icon: FileSpreadsheet },
    ],
  },
];

export default function Sidebar({ active }: { active?: string }) {
  const pathname = usePathname();
  const current = active ?? pathname ?? "";
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "SA";

  const displayName = user?.name ?? "Super Admin";
  const displayRole = "System Administrator";

  return (
    <aside className="h-screen w-64 bg-white text-slate-600 border-r border-slate-100 fixed left-0 top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50">
      {/* Brand Logo Section */}
      <div className="p-8 pb-6">
        <Link href="/overview" className="block transition-transform duration-300 hover:scale-[1.02]">
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
        </Link>
      </div>

      {/* Main Navigation Scrollable Area */}
      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = current === item.href || current.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3.5 px-4 py-3 text-[13.5px] transition-all duration-300 relative rounded-2xl",
                      isActive
                        ? "bg-[#002B54]/[0.03] text-[#002B54] font-bold shadow-[0_4px_12px_rgba(0,43,84,0.05)]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#002B54] shadow-[2px_0_8px_rgba(0,43,84,0.3)]" />
                    )}
                    <item.Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110",
                        isActive ? "text-[#002B54]" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span className="relative z-10">{item.label}</span>
                    {!isActive && (
                      <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity -z-10 scale-95 group-hover:scale-100 duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: User Profile & Logout */}
      <div className="p-4 mt-auto border-t border-slate-50 bg-slate-50/50">
        <div className="space-y-3">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100 group">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#002B54] to-[#00509E] flex items-center justify-center text-white text-xs font-bold shadow-inner transition-transform duration-500 group-hover:rotate-[360deg]">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield className="h-3 w-3 text-[#002B54]" />
                <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">{displayRole}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] text-red-500 hover:text-red-700 hover:bg-red-50/80 transition-all duration-300 group font-bold"
          >
            <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-all duration-300 shadow-sm group-hover:shadow group-hover:-translate-y-0.5">
              <LogOut className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Scrollbar Customization */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}
