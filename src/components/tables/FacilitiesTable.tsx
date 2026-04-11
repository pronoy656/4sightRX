"use client";
import React, { useState } from "react";
import { Search, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddFacilityDialog } from "../dialogs/AddFacilityDialog";

interface Facility {
    id: string;
    name: string;
    location: string;
    type: "PBM" | "LTC" | "Hospital" | "Hospice" | "ECF";
    assignedAdmin: string;
    patients: number;
    users: number;
    status: "Active" | "Inactive";
    iconColor: string;
}

const initialData: Facility[] = [
    {
        id: "1",
        name: "CarePlus Pharmacy Benefits",
        location: "Philadelphia, PA",
        type: "PBM",
        assignedAdmin: "John Davis",
        patients: 0,
        users: 15,
        status: "Active",
        iconColor: "bg-orange-100 text-orange-600",
    },
    {
        id: "2",
        name: "Greenwood Long-Term Care",
        location: "Chicago, IL",
        type: "LTC",
        assignedAdmin: "Nurse Mike Peterson",
        patients: 324,
        users: 45,
        status: "Active",
        iconColor: "bg-emerald-100 text-emerald-600",
    },
    {
        id: "3",
        name: "St. Mary's General Hospital",
        location: "New York, NY",
        type: "Hospital",
        assignedAdmin: "Dr. Emily Chen",
        patients: 842,
        users: 124,
        status: "Active",
        iconColor: "bg-blue-100 text-blue-600",
    },
    {
        id: "4",
        name: "Memorial Medical Center",
        location: "Houston, TX",
        type: "Hospital",
        assignedAdmin: "Dr. Robert Lee",
        patients: 1248,
        users: 186,
        status: "Active",
        iconColor: "bg-blue-100 text-blue-600",
    },
    {
        id: "5",
        name: "Comfort Care Hospice",
        location: "Los Angeles, CA",
        type: "Hospice",
        assignedAdmin: "PharmD Sarah Johnson",
        patients: 156,
        users: 28,
        status: "Active",
        iconColor: "bg-purple-100 text-purple-600",
    },
    {
        id: "6",
        name: "Sunrise Extended Care Facility",
        location: "Phoenix, AZ",
        type: "ECF",
        assignedAdmin: "Linda Martinez",
        patients: 278,
        users: 38,
        status: "Active",
        iconColor: "bg-amber-100 text-amber-600",
    },
];

export function FacilitiesTable() {
    const [facilities] = useState<Facility[]>(initialData);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredData = facilities.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.assignedAdmin.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "PBM": return "bg-orange-50 text-orange-600 border-orange-100";
            case "LTC": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Hospital": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Hospice": return "bg-purple-50 text-purple-600 border-purple-100";
            case "ECF": return "bg-amber-50 text-amber-600 border-amber-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

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
                                        PATIENTS <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        USERS <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        STATUS <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedData.map((facility) => (
                                <tr key={facility.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", facility.iconColor)}>
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800">{facility.name}</div>
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
                                        {facility.assignedAdmin}
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                        {facility.patients.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                        {facility.users.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                         <div className="flex items-center">
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-500">
                                                Active
                                            </span>
                                         </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination section */}
                <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {filteredData.length > 0 ? startIndex + 1 : 0} of {filteredData.length} facilities
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
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
                                        ? "text-white bg-[#002D54]"
                                        : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages || totalPages === 0}
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
            />
        </div>
    );
}
