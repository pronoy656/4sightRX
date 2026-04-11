"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddMedicationDialog } from "@/components/dialogs/AddMedicationDialog";
import { ViewMedicationDialog } from "@/components/dialogs/ViewMedicationDialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

export interface APIMedication {
    _id: string;
    medicationName: string;
    strength: string;
    form: string;
    dose: string;
    route: string;
    frequency: string;
    source: string;
    duration: string;
    createdAt: string;
    updatedAt: string;
}

export function MedicationsTable() {
    const [medications, setMedications] = useState<APIMedication[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<APIMedication | null>(null);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    const fetchMedications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get("/medications", {
                params: {
                    page: currentPage,
                    limit: itemsPerPage,
                    searchTerm: debouncedSearch,
                },
            });
            if (response.data.success) {
                setMedications(response.data.data);
                setTotalPages(response.data.pagination.totalPage);
                setTotalItems(response.data.pagination.total);
            }
        } catch (error) {
            console.error("Error fetching medications:", error);
            toast.error("Failed to fetch medications");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        fetchMedications();
    }, [fetchMedications]);

    const handleView = (med: APIMedication) => {
        setSelectedMed(med);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (med: APIMedication) => {
        setSelectedMed(med);
        setDialogMode("edit");
        setIsAddDialogOpen(true);
    };

    const handleDelete = (med: APIMedication) => {
        setSelectedMed(med);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedMed) return;
        try {
            await axiosSecure.delete(`/medications/${selectedMed._id}`);
            toast.success("Medication deleted successfully");
            fetchMedications();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting medication:", error);
            toast.error("Failed to delete medication");
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search medications..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-100"
                    />
                </div>
                <Button
                    onClick={() => {
                        setDialogMode("add");
                        setSelectedMed(null);
                        setIsAddDialogOpen(true);
                    }}
                    className="h-12 px-6 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                    <Plus className="h-5 w-5" />
                    Add Medication
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden min-h-[480px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        MEDICATION NAME <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    STRENGTH
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    FORM
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    ROUTE / FREQ
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                        Loading medications...
                                    </td>
                                </tr>
                            ) : medications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                        No medications found.
                                    </td>
                                </tr>
                            ) : (
                                medications.map((med) => (
                                    <tr key={med._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-slate-800">{med.medicationName}</div>
                                            <div className="text-xs text-slate-400 font-medium mt-0.5">Source: {med.source}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {med.strength}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {med.form}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-slate-700">{med.route}</div>
                                            <div className="text-xs text-slate-400">{med.frequency}</div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(med)}
                                                    className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(med)}
                                                    className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(med)}
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
                        Showing {medications.length > 0 ? startIndex + 1 : 0} to {startIndex + medications.length} of {totalItems} records
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="px-5 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
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
                                            ? "text-white bg-[#001D3D]"
                                            : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
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

            <AddMedicationDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                mode={dialogMode}
                initialData={selectedMed}
                onSuccess={fetchMedications}
            />

            <ViewMedicationDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                medication={selectedMed}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={selectedMed?.medicationName}
            />
        </div>
    );
}
