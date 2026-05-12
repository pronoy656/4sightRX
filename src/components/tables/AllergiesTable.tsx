"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, Plus, Shield, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddAllergyDialog } from "../dialogs/AddAllergyDialog";
import { EditAllergyDialog } from "../dialogs/EditAllergyDialog";
import { DeleteDialog } from "../dialogs/delete-dialog";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

interface APIAllergy {
    _id: string;
    name: string;
    type: string;
    aliases: string[];
    createdAt: string;
    updatedAt: string;
}

export function AllergiesTable() {
    const [allergies, setAllergies] = useState<APIAllergy[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAllergy, setSelectedAllergy] = useState<APIAllergy | null>(null);
    const [allergyToDelete, setAllergyToDelete] = useState<APIAllergy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    const fetchAllergies = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (debouncedSearch) {
                // Using the search endpoint provided by user
                response = await axiosSecure.get("/allergies/search", {
                    params: { q: debouncedSearch },
                });
            } else {
                response = await axiosSecure.get("/allergies");
            }

            if (response.data.success) {
                setAllergies(response.data.data);
                // Backend might not return pagination for search, handling manually
                setTotalRecords(response.data.data.length);
                setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
            }
        } catch (error) {
            console.error("Error fetching allergies:", error);
            toast.error("Failed to fetch allergies");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchAllergies();
    }, [fetchAllergies]);

    const handleDeleteAllergy = async () => {
        if (!allergyToDelete) return;
        
        try {
            const response = await axiosSecure.delete(`/allergies/${allergyToDelete._id}`);
            if (response.data.success) {
                toast.success("Allergy deleted successfully");
                fetchAllergies();
            }
        } catch (error) {
            console.error("Error deleting allergy:", error);
            toast.error("Failed to delete allergy");
        } finally {
            setIsDeleteDialogOpen(false);
            setAllergyToDelete(null);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAllergies = allergies.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Allergy Database</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Maintain a comprehensive list of allergies and their aliases
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-12 px-6 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                    <Plus className="h-5 w-5" />
                    Add Allergy
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search allergies..."
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
                                        ALLERGY NAME <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    ALIASES
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    TYPE
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                                        Loading allergies...
                                    </td>
                                </tr>
                            ) : paginatedAllergies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                                        No allergies found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedAllergies.map((allergy) => (
                                    <tr key={allergy._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                                    <Shield className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{allergy.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                        Added on {new Date(allergy.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1">
                                                {allergy.aliases && allergy.aliases.length > 0 ? (
                                                    allergy.aliases.map((alias, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                                            {alias}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400">No aliases</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-500 border border-blue-100 uppercase">
                                                {allergy.type || "Medication"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedAllergy(allergy);
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
                                                        setAllergyToDelete(allergy);
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
                            Showing {paginatedAllergies.length > 0 ? startIndex + 1 : 0} to {startIndex + paginatedAllergies.length} of {totalRecords} allergies
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

            <AddAllergyDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchAllergies}
            />

            <EditAllergyDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                allergy={selectedAllergy}
                onSuccess={fetchAllergies}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDeleteAllergy}
                title="Delete Allergy"
                description="Are you sure you want to delete this allergy from the database? This may affect patient records."
                itemName={allergyToDelete?.name}
            />
        </div>
    );
}
