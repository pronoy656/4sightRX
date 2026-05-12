"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronsUpDown, Plus, Eye, Edit, Building2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddPatientDialog } from "@/components/dialogs/AddPatientDialog";
import { ViewPatientDialog } from "@/components/dialogs/ViewPatientDialog";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export interface APIPatient {
    _id: string;
    firstName: string;
    lastName: string;
    patientIdMrn: string;
    dob: string;
    age?: number;
    sex: string;
    admissionDate: string;
    lifeExpectancy?: string;
    status: string;
    // organization?: {
    //     _id: string;
    //     name: string;
    // } | null;
    organizationId?: {
        _id: string;
        name: string;
    } | null;
   
    allergies?: {
        allergyId?: string;
        name: string;
        custom?: boolean;
    }[];
    notes?: string;
    updatedAt: string;
}

export default function PatientsTable() {
    const [patients, setPatients] = useState<APIPatient[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<APIPatient | null>(null);
    const [patientToDelete, setPatientToDelete] = useState<APIPatient | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const limit = 10;

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const url = `/patients?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}${selectedOrgId !== "all" ? `&organizationId=${selectedOrgId}` : ""}`;
            const res = await axiosSecure.get(url);
            if (res.data.success) {
                setPatients(res.data.data);
                setTotalPages(res.data.pagination.totalPage);
                setTotalRecords(res.data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch patients:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, debouncedSearch, selectedOrgId]);

    const fetchOrganizations = async () => {
        try {
            const response = await axiosSecure.get("/organizations");
            if (response.data.success) {
                setOrganizations(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    console.log("patients", patients);

    const handleViewPatient = (patient: APIPatient) => {
        setSelectedPatient(patient);
        setIsEditMode(false);
        setIsViewDialogOpen(true);
    };

    const handleEditPatient = (patient: APIPatient) => {
        setSelectedPatient(patient);
        setIsEditMode(true);
        setIsViewDialogOpen(true);
    };

    const handleDeleteClick = (patient: APIPatient) => {
        setPatientToDelete(patient);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!patientToDelete) return;
        try {
            const response = await axiosSecure.delete(`/patients/${patientToDelete._id}`);
            if (response.data.success) {
                toast.success("Patient deleted successfully");
                fetchPatients();
            }
        } catch (error) {
            console.error("Error deleting patient:", error);
            toast.error("Failed to delete patient");
        } finally {
            setIsDeleteDialogOpen(false);
            setPatientToDelete(null);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getOrganizationName = (patient: APIPatient) => {
        if (patient.organizationId?.name) return patient.organizationId.name;
        if (patient.organizationId) {
            const org = organizations.find(o => o._id === patient.organizationId);
            return org ? org.name : "N/A";
        }
        return "N/A";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Patient Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Manage patient records
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-11 px-6 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Patient
                </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search by name, MRN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-100"
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select value={selectedOrgId} onValueChange={(val) => {
                        setSelectedOrgId(val);
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                            <SelectValue placeholder="All Organizations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Organizations</SelectItem>
                            {organizations.map((org) => (
                                <SelectItem key={org._id} value={org._id}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        PATIENT NAME <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        ADMISSION DATE <ChevronsUpDown className="h-3 w-3" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    ORGANIZATION
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    ALLERGIES
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        AGE / SEX <ChevronsUpDown className="h-3 w-3" />
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
                        <tbody className="divide-y divide-slate-50 relative">
                            {loading && patients.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-500">Loading patients...</td>
                                </tr>
                            )}
                            {!loading && patients.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-500">No patients found.</td>
                                </tr>
                            )}
                            {patients.map((patient) => (
                                <tr key={patient._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{`${patient.firstName} ${patient.lastName}`}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-widest font-medium mt-0.5">ID: {patient.patientIdMrn}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                        {formatDate(patient.admissionDate)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                            {getOrganizationName(patient)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {patient.allergies && patient.allergies.length > 0 ? (
                                                patient.allergies.slice(0, 2).map((allergy, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                                                        {allergy.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">None</span>
                                            )}
                                            {patient.allergies && patient.allergies.length > 2 && (
                                                <span className="text-[10px] font-bold text-slate-400">+{patient.allergies.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                        {patient.age || "N/A"} / {patient.sex}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold",
                                                (patient.status || "").toUpperCase() === "PENDING"
                                                    ? "bg-amber-50 text-amber-500"
                                                    : "bg-emerald-50 text-emerald-500"
                                            )}
                                        >
                                            {patient.status || "ACTIVE"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewPatient(patient)}
                                            className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditPatient(patient)}
                                            className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(patient)}
                                            className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination section */}
                <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {patients.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} users
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="px-5 py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            "h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl transition-colors",
                                            currentPage === page
                                                ? "text-white bg-[#001D3D]"
                                                : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === currentPage - 3 || page === currentPage + 3) {
                                return <span key={page} className="text-slate-400">...</span>;
                            }
                            return null;
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

            <AddPatientDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSuccess={fetchPatients}
            />

            <ViewPatientDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                patient={selectedPatient}
                isEditMode={isEditMode}
                onSuccess={fetchPatients}
            />

            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                itemName={patientToDelete ? `${patientToDelete.firstName} ${patientToDelete.lastName}` : ""}
            />
        </div>
    );
}
