"use client";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white sticky top-0 z-10 h-16">
      <div className="text-slate-400 text-sm font-medium">
        Admin Portal
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-sm font-semibold text-slate-700">Super Admin</div>
            <div className="text-[10px] text-slate-400">admin@4sightrx.com</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#00A3A3] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            SA
          </div>
          <button className="text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
