"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

interface APIUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  image: string;
  status: "active" | "blocked";
  verified: boolean;
  specialty: string | null;
  hospitalName: string | null;
  isLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<APIUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosSecure.get("user/all-users", {
        params: {
          page: currentPage,
          limit: limit,
          search: debouncedSearch,
        },
      });
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPage);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: APIUser, isBlocked: boolean) => {
    const newStatus = isBlocked ? "blocked" : "active";
    try {
      const response = await axiosSecure.patch(`user/status/${user._id}`, {
        status: newStatus,
      });
      if (response.data.success) {
        toast.success(`User status updated to ${newStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const startIndex = (currentPage - 1) * limit;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Manage users, roles, and permissions across all facilities
        </p>
      </div>

      {/* Search box card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-100"
          />
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    NAME <ChevronsUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  EMAIL
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                  BLOCKED
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center border border-slate-100">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-blue-600 font-bold text-xs">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-400">Verified: {user.verified ? "Yes" : "No"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-600 font-medium">{user.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-500"
                            : "bg-red-50 text-red-500"
                        )}
                      >
                        {user.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Switch
                        checked={user.status === "blocked"}
                        onCheckedChange={(checked) => handleToggleStatus(user, checked)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination section */}
        <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Showing {users.length > 0 ? startIndex + 1 : 0} to {startIndex + users.length} of {totalRecords} users
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 text-sm font-bold text-[#002B54] border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                } else {
                  pageNum = i + 1;
                }
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl transition-colors",
                      currentPage === pageNum
                        ? "text-white bg-[#002D54]"
                        : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 text-sm font-bold text-[#002B54] border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
