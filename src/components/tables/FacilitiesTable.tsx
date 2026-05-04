"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, Plus, Building2, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddFacilityDialog } from "../dialogs/AddFacilityDialog";
import { EditFacilityDialog } from "../dialogs/EditFacilityDialog";
import { DeleteDialog } from "../dialogs/delete-dialog";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

interface APIFacility {
    _id: string;
    facilityName: string;
    type: string;
    location: string;
    address: string;
    phone: string;
    assignAdmin: {
        _id: string;
        name: string;
        email: string;
    } | string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export function FacilitiesTable() {
    const [facilities, setFacilities] = useState<APIFacility[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<APIFacility | null>(null);
    const [facilityToDelete, setFacilityToDelete] = useState<APIFacility | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    const fetchFacilities = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get("/facility", {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: debouncedSearch,
                },
            });
            if (response.data.success) {
                setFacilities(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPage);
                    setTotalRecords(response.data.pagination.total);
                }
            }
        } catch (error) {
            console.error("Error fetching facilities:", error);
            toast.error("Failed to fetch facilities");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    const handleDeleteFacility = async () => {
        if (!facilityToDelete) return;
        
        try {
            const response = await axiosSecure.delete(`/facility/${facilityToDelete._id}`);
            if (response.data.success) {
                toast.success("Facility deleted successfully");
                fetchFacilities();
            }
        } catch (error) {
            console.error("Error deleting facility:", error);
            toast.error("Failed to delete facility");
        } finally {
            setIsDeleteDialogOpen(false);
            setFacilityToDelete(null);
        }
    };

    const getTypeStyles = (type: string) => {
        const t = type?.toUpperCase();
        if (t?.includes("PBM")) return "bg-orange-50 text-orange-600 border-orange-100";
        if (t?.includes("LTC")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
        if (t?.includes("HOSPITAL")) return "bg-blue-50 text-blue-600 border-blue-100";
        if (t?.includes("HOSPICE")) return "bg-purple-50 text-purple-600 border-purple-100";
        if (t?.includes("ECF")) return "bg-amber-50 text-amber-600 border-amber-100";
        return "bg-slate-50 text-slate-600 border-slate-100";
    };

    const getIconColor = (type: string) => {
        const t = type?.toUpperCase();
        if (t?.includes("PBM")) return "bg-orange-100 text-orange-600";
        if (t?.includes("LTC")) return "bg-emerald-100 text-emerald-600";
        if (t?.includes("HOSPITAL")) return "bg-blue-100 text-blue-600";
        if (t?.includes("HOSPICE")) return "bg-purple-100 text-purple-600";
        if (t?.includes("ECF")) return "bg-amber-100 text-amber-600";
        return "bg-slate-100 text-slate-600";
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Facility & Agency Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Manage healthcare facilities and pharmacy benefit managers
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-12 px-6 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                    <Plus className="h-5 w-5" />
                    Add Facility
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search facilities..."
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
                                        FACILITY NAME <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        TYPE <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        ASSIGNED ADMIN <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        PHONE <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        STATUS <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                        Loading facilities...
                                    </td>
                                </tr>
                            ) : facilities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                        No facilities found.
                                    </td>
                                </tr>
                            ) : (
                                facilities.map((facility) => (
                                    <tr key={facility._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", getIconColor(facility.type))}>
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{facility.facilityName}</div>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                                        <span className="opacity-50">📍</span> {facility.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold border", getTypeStyles(facility.type))}>
                                                {facility.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {facility.assignAdmin && typeof facility.assignAdmin === 'object' ? facility.assignAdmin.name : (facility.assignAdmin || "Unassigned")}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {facility.phone}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <span className={cn(
                                                    "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold",
                                                    facility.status === "active" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                                                )}>
                                                    {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedFacility(facility);
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
                                                        setFacilityToDelete(facility);
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
                <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {facilities.length > 0 ? startIndex + 1 : 0} to {startIndex + facilities.length} of {totalRecords} facilities
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
            </div>

            <AddFacilityDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchFacilities}
            />

            <EditFacilityDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                facility={selectedFacility}
                onSuccess={fetchFacilities}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteFacility}
                title="Delete Facility"
                description="Are you sure you want to delete this healthcare facility? This will remove all associated user assignments and records."
                itemName={facilityToDelete?.facilityName}
            />
        </div>
    );
}
