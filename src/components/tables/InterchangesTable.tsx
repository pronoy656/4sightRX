"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, Plus, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddInterchangeDialog } from "@/components/dialogs/AddInterchangeDialog";
import { ViewInterchangeDialog } from "@/components/dialogs/ViewInterchangeDialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface APITherapeutic {
    _id: string;
    drugName: string;
    alternative: string;
    drugClass: string;
    estimatedSavings: number;
    dosageEquivalence: string;
    rationale: string;
    createdAt: string;
    updatedAt: string;
}

export function InterchangesTable() {
    const [interchanges, setInterchanges] = useState<APITherapeutic[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedInter, setSelectedInter] = useState<APITherapeutic | null>(null);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [agencies, setAgencies] = useState<{ _id: string; facilityName: string }[]>([]);
    const [selectedAgencyId, setSelectedAgencyId] = useState<string>("all");
    const { user } = useAuth();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const itemsPerPage = 10;

    const fetchAgencies = async () => {
        try {
            const response = await axiosSecure.get("/facility");
            if (response.data.success) {
                setAgencies(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching agencies:", error);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchAgencies();
        }
    }, [isSuperAdmin]);

    const fetchInterchanges = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get("therapeutics", {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    search: debouncedSearch,
                    agencyId: selectedAgencyId === "all" ? undefined : selectedAgencyId,
                },
            });
            if (response.data.success) {
                setInterchanges(response.data.data);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPage);
                    setTotalRecords(response.data.pagination.total);
                }
            }
        } catch (error) {
            console.error("Error fetching therapeutics:", error);
            toast.error("Failed to fetch therapeutic interchanges");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, selectedAgencyId]);

    useEffect(() => {
        fetchInterchanges();
    }, [fetchInterchanges]);

    const handleView = (inter: APITherapeutic) => {
        setSelectedInter(inter);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (inter: APITherapeutic) => {
        setSelectedInter(inter);
        setDialogMode("edit");
        setIsAddDialogOpen(true);
    };

    const handleDelete = (inter: APITherapeutic) => {
        setSelectedInter(inter);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedInter) return;
        try {
            const response = await axiosSecure.delete(`therapeutics/${selectedInter._id}`);
            if (response.data.success) {
                toast.success("Therapeutic interchange deleted");
                fetchInterchanges();
            }
        } catch (error) {
            console.error("Error deleting therapeutic:", error);
            toast.error("Failed to delete therapeutic interchange");
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search interchanges..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-100"
                    />
                </div>
                {isSuperAdmin && (
                    <div className="w-full md:w-64">
                        <Select
                            value={selectedAgencyId}
                            onValueChange={(value) => {
                                setSelectedAgencyId(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus:ring-1 focus:ring-blue-100">
                                <SelectValue placeholder="Filter by Agency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agencies</SelectItem>
                                {agencies.map((agency) => (
                                    <SelectItem key={agency._id} value={agency._id}>
                                        {agency.facilityName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <Button
                    onClick={() => {
                        setDialogMode("add");
                        setSelectedInter(null);
                        setIsAddDialogOpen(true);
                    }}
                    className="h-12 px-6 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                    <Plus className="h-5 w-5" />
                    Add Interchange
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[480px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        CURRENT DRUG <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        ALTERNATIVE <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        COST SAVINGS <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        RATIONALE <ChevronsUpDown className="h-3 w-3" />
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
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading therapeutic interchanges...
                                        </div>
                                    </td>
                                </tr>
                            ) : interchanges.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">
                                        No therapeutic interchanges found.
                                    </td>
                                </tr>
                            ) : (
                                interchanges.map((inter) => (
                                    <tr key={inter._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-800">
                                            {inter.drugName}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {inter.alternative}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-[#006FC9]">
                                            ${inter.estimatedSavings}/year
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-400 break-words max-w-[300px]">
                                            {inter.rationale}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(inter)}
                                                    className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(inter)}
                                                    className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(inter)}
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
                        Showing {interchanges.length > 0 ? startIndex + 1 : 0} to {startIndex + interchanges.length} of {totalRecords} records
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

            <AddInterchangeDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                mode={dialogMode}
                initialData={selectedInter}
                onSuccess={fetchInterchanges}
            />

            <ViewInterchangeDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                interchange={selectedInter}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={selectedInter?.drugName}
            />
        </div>
    );
}
