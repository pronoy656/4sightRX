"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, Plus, Building2, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddOrganizationDialog } from "../dialogs/AddOrganizationDialog";
import { EditOrganizationDialog } from "../dialogs/EditOrganizationDialog";
import { DeleteDialog } from "../dialogs/delete-dialog";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

interface APIOrganization {
    _id: string;
    name: string;
    email: string;
    contactNumber: string;
    address: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export function OrganizationsTable() {
    const [organizations, setOrganizations] = useState<APIOrganization[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<APIOrganization | null>(null);
    const [orgToDelete, setOrgToDelete] = useState<APIOrganization | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    const fetchOrganizations = useCallback(async () => {
        setLoading(true);
        try {
            // Adjusting based on common patterns, though the user didn't specify pagination params for orgs
            const response = await axiosSecure.get("/organizations", {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: debouncedSearch,
                },
            });
            if (response.data.success) {
                setOrganizations(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPage);
                    setTotalRecords(response.data.pagination.total);
                } else {
                    setTotalRecords(response.data.data.length);
                    setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
                }
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
            toast.error("Failed to fetch organizations");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const handleDeleteOrg = async () => {
        if (!orgToDelete) return;
        
        try {
            const response = await axiosSecure.delete(`/organizations/${orgToDelete._id}`);
            if (response.data.success) {
                toast.success("Organization deleted successfully");
                fetchOrganizations();
            }
        } catch (error) {
            console.error("Error deleting organization:", error);
            toast.error("Failed to delete organization");
        } finally {
            setIsDeleteDialogOpen(false);
            setOrgToDelete(null);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Organization Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Manage corporate entities and their contact information
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-12 px-6 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                    <Plus className="h-5 w-5" />
                    Add Organization
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-100"
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider h-14">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        ORGANIZATION NAME <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    EMAIL
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    CONTACT
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    STATUS
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                        Loading organizations...
                                    </td>
                                </tr>
                            ) : organizations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                        No organizations found.
                                    </td>
                                </tr>
                            ) : (
                                organizations.map((org) => (
                                    <tr key={org._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#002B54] flex items-center justify-center">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{org.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[200px]">
                                                        {org.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {org.email}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {org.contactNumber}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <span className={cn(
                                                    "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold",
                                                    org.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                                                )}>
                                                    {(org.status || "active").charAt(0).toUpperCase() + (org.status || "active").slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedOrg(org);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                    className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setOrgToDelete(org);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination section */}
                {totalRecords > itemsPerPage && (
                    <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="text-sm text-slate-500 font-medium">
                            Showing {organizations.length > 0 ? startIndex + 1 : 0} to {startIndex + organizations.length} of {totalRecords} organizations
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                className="px-5 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl transition-colors",
                                        currentPage === page
                                            ? "text-white bg-[#002B54]"
                                            : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === totalPages || totalPages === 0 || loading}
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                className="px-5 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddOrganizationDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchOrganizations}
            />

            <EditOrganizationDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                organization={selectedOrg}
                onSuccess={fetchOrganizations}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteOrg}
                title="Delete Organization"
                description="Are you sure you want to delete this organization? This action cannot be undone."
                itemName={orgToDelete?.name}
            />
        </div>
    );
}
