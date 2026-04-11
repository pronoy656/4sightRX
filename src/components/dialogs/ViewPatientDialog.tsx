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
        firstName: "",
        lastName: "",
        patientIdMrn: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        medicationAllergies: "",
        admissionDate: "",
        facility: "",
        status: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (patient && open) {
            setFormData({
                firstName: patient.firstName || "",
                lastName: patient.lastName || "",
                patientIdMrn: patient.patientIdMrn || "",
                dateOfBirth: patient.dateOfBirth || "",
                gender: patient.gender || "",
                phoneNumber: patient.phoneNumber || "",
                medicationAllergies: patient.medicationAllergies || "",
                admissionDate: patient.admissionDate ? new Date(patient.admissionDate).toISOString().split('T')[0] : "",
                facility: patient.facility || "",
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
        setFormData({ ...formData, [field]: value });
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
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-semibold text-slate-600">First Name</Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-semibold text-slate-600">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="patientIdMrn" className="text-sm font-semibold text-slate-600">Patient ID</Label>
                                <Input id="patientIdMrn" value={formData.patientIdMrn} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-600">Phone</Label>
                                <Input id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-slate-600">DOB</Label>
                                <Input id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-sm font-semibold text-slate-600">Gender</Label>
                                <Select value={formData.gender} onValueChange={(val) => handleSelectChange(val, "gender")} required>
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Select gender" />
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
                                <Label htmlFor="facility" className="text-sm font-semibold text-slate-600">Facility</Label>
                                <Input id="facility" value={formData.facility} onChange={handleChange} className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admissionDate" className="text-sm font-semibold text-slate-600">Admission Date</Label>
                                <Input id="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} required className="h-11 border-slate-200 rounded-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="medicationAllergies" className="text-sm font-semibold text-slate-600">Allergies</Label>
                                <Input id="medicationAllergies" value={formData.medicationAllergies} onChange={handleChange} className="h-11 border-slate-200 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-slate-600">Status</Label>
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
                                <p className="text-slate-800 font-medium">{new Date(patient.admissionDate).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age / Gender</Label>
                                <p className="text-slate-800 font-medium">{patient.age} / {patient.gender}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</Label>
                                <p className="text-slate-800 font-medium">{patient.phoneNumber || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</Label>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${(patient.status || "").toUpperCase() === "PENDING" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"}`}>
                                        {patient.status || "ACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies</Label>
                            <p className="text-slate-800 font-medium">{patient.medicationAllergies || "N/A"}</p>
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
