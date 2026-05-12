"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axiosSecure from "@/components/hook/axiosSecure";
import { APIPatient } from "../tables/PatientsTable";
import { toast } from "sonner";

interface ViewPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: APIPatient | null;
    isEditMode?: boolean;
    onSuccess?: () => void;
}

export function ViewPatientDialog({ open, onOpenChange, patient, isEditMode = false, onSuccess }: ViewPatientDialogProps) {
    const [formData, setFormData] = useState({
        organizationId: "",
        firstName: "",
        lastName: "",
        dob: "",
        sex: "",
        allergies: [] as any[],
        admissionDate: "",
        lifeExpectancy: "",
        status: "",
        notes: "",
    });
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableAllergies, setAvailableAllergies] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            fetchAllergies();
            fetchOrganizations();
        }
    }, [open]);

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

    const fetchAllergies = async () => {
        try {
            const response = await axiosSecure.get("/allergies");
            if (response.data.success) {
                setAvailableAllergies(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching allergies:", error);
        }
    };

    useEffect(() => {
        if (patient && open) {
            setFormData({
                organizationId: (typeof patient.organizationId === 'object' ? patient.organizationId?._id : patient.organizationId) || "",
                firstName: patient.firstName || "",
                lastName: patient.lastName || "",
                dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : "",
                sex: patient.sex || "",
                allergies: patient.allergies || [] as any,
                admissionDate: patient.admissionDate ? new Date(patient.admissionDate).toISOString().slice(0, 16) : "",
                lifeExpectancy: patient.lifeExpectancy || "",
                status: patient.status || "ACTIVE",
                notes: patient.notes || "",
            });
            setError(null);
        }
    }, [patient, open]);

    if (!patient) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (value: string, field: string) => {
        if (field === "allergies") {
            const selectedAllergy = availableAllergies.find(a => a.name === value);
            if (selectedAllergy) {
                setFormData({
                    ...formData,
                    allergies: [{
                        allergyId: selectedAllergy._id,
                        name: selectedAllergy.name,
                        custom: false
                    }]
                });
            } else if (value === "None") {
                setFormData({ ...formData, allergies: [] });
            }
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axiosSecure.patch(`/patients/${patient._id}`, formData);
            if (onSuccess) onSuccess();
            onOpenChange(false);
            toast.success("Patient updated successfully!");
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.errorMessages?.[0]?.message || "Failed to update patient");
            toast.error("Failed to update patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {isEditMode ? "Edit Patient" : "Patient Details"}
                    </DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                {isEditMode ? (
                    <form onSubmit={handleUpdate} className="p-8 pb-10 space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="organizationId" className="text-sm font-semibold text-slate-600">Organization <span className="text-red-500">*</span></Label>
                            <Select value={formData.organizationId} onValueChange={(val) => handleSelectChange(val, "organizationId")} required>
                                <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                    <SelectValue placeholder="Select organization" />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map((org) => (
                                        <SelectItem key={org._id} value={org._id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-semibold text-slate-600">First Name <span className="text-red-500">*</span></Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-semibold text-slate-600">Last Name <span className="text-red-500">*</span></Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dob" className="text-sm font-semibold text-slate-600">Date of Birth <span className="text-red-500">*</span></Label>
                                <Input id="dob" type="date" value={formData.dob} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sex" className="text-sm font-semibold text-slate-600">Sex <span className="text-red-500">*</span></Label>
                                <Select value={formData.sex} onValueChange={(val) => handleSelectChange(val, "sex")} required>
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="lifeExpectancy" className="text-sm font-semibold text-slate-600">Life Expectancy</Label>
                                <Select value={formData.lifeExpectancy} onValueChange={(val) => handleSelectChange(val, "lifeExpectancy")}>
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select expectancy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-6 days">0-6 days</SelectItem>
                                        <SelectItem value="1-4 weeks">1-4 weeks</SelectItem>
                                        <SelectItem value="1-3 months">1-3 months</SelectItem>
                                        <SelectItem value="4-6 months">4-6 months</SelectItem>
                                        <SelectItem value=">6 months">&gt;6 months</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admissionDate" className="text-sm font-semibold text-slate-600">Admission Date <span className="text-red-500">*</span></Label>
                                <Input id="admissionDate" type="datetime-local" value={formData.admissionDate} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="allergies" className="text-sm font-semibold text-slate-600">Allergies</Label>
                                <Select 
                                    value={formData.allergies.length > 0 ? formData.allergies[0].name : "None"} 
                                    onValueChange={(val) => handleSelectChange(val, "allergies")}
                                >
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select allergy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        {availableAllergies.map((allergy) => (
                                            <SelectItem key={allergy._id} value={allergy.name}>
                                                {allergy.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-slate-600">Status <span className="text-red-500">*</span></Label>
                                <Select value={formData.status} onValueChange={(val) => handleSelectChange(val, "status")} required>
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                        <SelectItem value="PENDING">PENDING</SelectItem>
                                        <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-semibold text-slate-600">Notes (Optional)</Label>
                            <Textarea id="notes" value={formData.notes} onChange={handleChange} placeholder="Additional notes..." className="min-h-[100px] border-slate-200 rounded-xl resize-none" />
                        </div>
                        <div className="flex justify-end pt-4 gap-3">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="px-6 rounded-xl hover:bg-slate-50 transition-colors">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors">
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 pb-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</Label>
                                <p className="text-slate-800 font-bold">{patient.firstName} {patient.lastName}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRN / ID</Label>
                                <p className="text-slate-800 font-medium">{patient.patientIdMrn}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admission Date</Label>
                                <p className="text-slate-800 font-medium">{new Date(patient.admissionDate).toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age / Sex</Label>
                                <p className="text-slate-800 font-medium">{patient.age} / {patient.sex}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization</Label>
                                <p className="text-slate-800 font-medium">{patient.organizationId?.name || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Life Expectancy</Label>
                                <p className="text-slate-800 font-medium">{patient.lifeExpectancy || "N/A"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</Label>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${(patient.status || "").toUpperCase() === "PENDING" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"}`}>
                                        {patient.status || "ACTIVE"}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">DOB</Label>
                                <p className="text-slate-800 font-medium">{new Date(patient.dob).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {patient.allergies && patient.allergies.length > 0 ? (
                                    patient.allergies.map((allergy: any, idx: number) => (
                                        <span key={idx} className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md uppercase">
                                            {allergy.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-slate-800 font-medium text-sm">None</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 pt-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</Label>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {patient.notes || "No additional notes available for this patient."}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                className="h-12 px-8 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
