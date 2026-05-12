"use client";
import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import axiosSecure from "@/components/hook/axiosSecure";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddInterchangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    mode: "add" | "edit";
    onSuccess?: () => void;
}

export function AddInterchangeDialog({ open, onOpenChange, initialData, mode, onSuccess }: AddInterchangeDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        drugName: "",
        alternative: "",
        drugClass: "",
        dosageEquivalence: "",
        estimatedSavings: 0,
        rationale: "",
    });

    const { user } = useAuth();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";



    useEffect(() => {
        if (open) {
            if (mode === "edit" && initialData) {
                setFormData({
                    drugName: initialData.drugName || "",
                    alternative: initialData.alternative || "",
                    drugClass: initialData.drugClass || "",
                    dosageEquivalence: initialData.dosageEquivalence || "",
                    estimatedSavings: initialData.estimatedSavings || 0,
                    rationale: initialData.rationale || "",
                });
            } else {
                setFormData({
                    drugName: "",
                    alternative: "",
                    drugClass: "",
                    dosageEquivalence: "",
                    estimatedSavings: 0,
                    rationale: "",
                });
            }
        }
    }, [open, mode, initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "estimatedSavings" ? Number(value) : value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.drugName || !formData.alternative || !formData.drugClass) {
            toast.error("Please fill in all required fields (Drug Name, Alternative, Drug Class)");
            return;
        }

        setLoading(true);
        try {
            let response;
            if (mode === "add") {
                response = await axiosSecure.post("/therapeutics", formData);
            } else {
                response = await axiosSecure.patch(`/therapeutics/${initialData._id}`, formData);
            }

            if (response.data.success) {
                toast.success(mode === "add" ? "Therapeutic interchange created" : "Therapeutic interchange updated");
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error: any) {
            console.error("Error saving therapeutic:", error);
            toast.error(error.response?.data?.message || "Failed to save therapeutic interchange");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white focus-visible:outline-none">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        {mode === "add" ? "Add Therapeutic Interchange" : "Edit Therapeutic Interchange"}
                    </DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 pb-10 space-y-5">

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Current Drug <span className="text-red-500">*</span></Label>
                            <Input
                                name="drugName"
                                value={formData.drugName}
                                onChange={handleInputChange}
                                placeholder="e.g., Norvasc 5mg"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Alternative Drug <span className="text-red-500">*</span></Label>
                            <Input
                                name="alternative"
                                value={formData.alternative}
                                onChange={handleInputChange}
                                placeholder="e.g., Amlodipine 5mg"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Drug Class <span className="text-red-500">*</span></Label>
                        <Input
                            name="drugClass"
                            value={formData.drugClass}
                            onChange={handleInputChange}
                            placeholder="e.g., Statin, ACE Inhibitor"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Dosage Equivalence</Label>
                            <Input
                                name="dosageEquivalence"
                                value={formData.dosageEquivalence}
                                onChange={handleInputChange}
                                placeholder="e.g., 1:1, 20mg equivalent"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Cost Savings (Annual)</Label>
                            <Input
                                name="estimatedSavings"
                                type="number"
                                value={formData.estimatedSavings}
                                onChange={handleInputChange}
                                placeholder="45"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Rationale</Label>
                        <Textarea
                            name="rationale"
                            value={formData.rationale}
                            onChange={handleInputChange}
                            placeholder="Explain the clinical rationale for this interchange..."
                            className="min-h-[120px] border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100 resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-12 bg-[#002D54] hover:bg-[#002D54]/90 rounded-xl text-white font-bold transition-colors"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "add" ? "Add Interchange" : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
