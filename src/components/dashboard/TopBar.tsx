"use client";
import { Bell, LogOut, ChevronDown, User, Settings, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";

export default function TopBar() {
  const { user, logout } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "SA";

  const displayName = user?.name ?? "Super Admin";
  const displayEmail = user?.email ?? "admin@4sightrx.com";
  const displayRole = user?.role ?? "Administrator";

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 h-16">
      <div className="text-slate-400 text-sm font-medium tracking-wide">
        Admin Portal
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-400 hover:text-slate-600 group">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#00A3A3] ring-2 ring-white animate-pulse" />
        </button>

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all duration-200 outline-none cursor-pointer group border border-transparent hover:border-slate-200">
              {/* Avatar Ring */}
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#006FC9] to-[#00A3A3] flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white">
                  {initials}
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-slate-800 leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">{displayRole}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-[#006FC9] to-[#00A3A3] p-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/30">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-blue-100 truncate">{displayEmail}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-2.5 w-2.5 text-emerald-300" />
                    <span className="text-[10px] text-emerald-300 font-medium">{displayRole}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">My Profile</p>
                  <p className="text-[10px] text-slate-400">View & edit your profile</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Change Password</p>
                  <p className="text-[10px] text-slate-400">Update your account password</p>
                </div>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="my-0" />

            {/* Logout */}
            <div className="p-1.5">
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Log out</p>
                  <p className="text-[10px] text-red-400">End your session securely</p>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangePasswordModal open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
    </div>
  );
}
