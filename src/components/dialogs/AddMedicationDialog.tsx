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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axiosSecure from "@/components/hook/axiosSecure";
import { toast } from "sonner";
import { APIMedication } from "../tables/MedicationsTable";

interface AddMedicationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: APIMedication | null;
    mode: "add" | "edit";
    onSuccess?: () => void;
}

export function AddMedicationDialog({ open, onOpenChange, initialData, mode, onSuccess }: AddMedicationDialogProps) {
    const [formData, setFormData] = useState({
        medicationName: "",
        strength: "",
        form: "tablet",
        dose: "",
        route: "Oral (PO)",
        frequency: "Once daily (QD)",
        duration: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            if (mode === "edit" && initialData) {
                setFormData({
                    medicationName: initialData.medicationName || "",
                    strength: initialData.strength || "",
                    form: (initialData.form || "tablet").toLowerCase(),
                    dose: initialData.dose || "",
                    route: initialData.route || "Oral (PO)",
                    frequency: initialData.frequency || "Once daily (QD)",
                    duration: initialData.duration || "",
                });
            } else {
                setFormData({
                    medicationName: "",
                    strength: "",
                    form: "tablet",
                    dose: "",
                    route: "Oral (PO)",
                    frequency: "Once daily (QD)",
                    duration: "",
                });
            }
            setError(null);
        }
    }, [open, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (value: string, field: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === "add") {
                await axiosSecure.post("/medications", formData);
                toast.success("Medication added successfully");
            } else {
                await axiosSecure.patch(`/medications/${initialData?._id}`, formData);
                toast.success("Medication updated successfully");
            }
            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error("Error saving medication:", err);
            const msg = err.response?.data?.message || "Failed to save medication";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {mode === "add" ? "Add Medication" : "Edit Medication"}
                    </DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 pb-10 space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="medicationName" className="text-sm font-semibold text-slate-600">Medication Name*</Label>
                        <Input
                            id="medicationName"
                            placeholder="e.g., Omeprazole"
                            value={formData.medicationName}
                            onChange={handleChange}
                            required
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Form*</Label>
                            <Select value={formData.form} onValueChange={(v) => handleSelectChange(v, "form")}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select form" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tablet">tablet</SelectItem>
                                    <SelectItem value="capsule">capsule</SelectItem>
                                    <SelectItem value="liquid">liquid</SelectItem>
                                    <SelectItem value="injection">injection</SelectItem>
                                    <SelectItem value="cream">cream</SelectItem>
                                    <SelectItem value="patch">patch</SelectItem>
                                    <SelectItem value="inhaler">inhaler</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="strength" className="text-sm font-semibold text-slate-600">Strength*</Label>
                            <Input
                                id="strength"
                                placeholder="e.g., 20 mg"
                                value={formData.strength}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="dose" className="text-sm font-semibold text-slate-600">Dose*</Label>
                            <Input
                                id="dose"
                                placeholder="e.g., 1 capsule"
                                value={formData.dose}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Route*</Label>
                            <Select value={formData.route} onValueChange={(v) => handleSelectChange(v, "route")}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select route" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Oral (PO)">Oral (PO)</SelectItem>
                                    <SelectItem value="Sublingual (SL)">Sublingual (SL)</SelectItem>
                                    <SelectItem value="Intravenous (IV)">Intravenous (IV)</SelectItem>
                                    <SelectItem value="Intramuscular (IM)">Intramuscular (IM)</SelectItem>
                                    <SelectItem value="Subcutaneous (SC)">Subcutaneous (SC)</SelectItem>
                                    <SelectItem value="Topical">Topical</SelectItem>
                                    <SelectItem value="Inhaled">Inhaled</SelectItem>
                                    <SelectItem value="Rectal (PR)">Rectal (PR)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Frequency*</Label>
                            <Select value={formData.frequency} onValueChange={(v) => handleSelectChange(v, "frequency")}>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Once daily (QD)">Once daily (QD)</SelectItem>
                                    <SelectItem value="Twice daily (BID)">Twice daily (BID)</SelectItem>
                                    <SelectItem value="Three times daily (TID)">Three times daily (TID)</SelectItem>
                                    <SelectItem value="4 Times daily (QID)">4 Times daily (QID)</SelectItem>
                                    <SelectItem value="Every 4 hours (Q4H)">Every 4 hours (Q4H)</SelectItem>
                                    <SelectItem value="Every 8 hours (Q8H)">Every 8 hours (Q8H)</SelectItem>
                                    <SelectItem value="As needed (PRN)">As needed (PRN)</SelectItem>
                                    <SelectItem value="Once weekly">Once weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-sm font-semibold text-slate-600">Duration</Label>
                            <Input
                                id="duration"
                                placeholder="e.g., 7 days, ongoing"
                                value={formData.duration}
                                onChange={handleChange}
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12 border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Medication"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
