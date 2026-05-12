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
import axiosSecure from "@/components/hook/axiosSecure";
import { toast } from "sonner";

interface EditAllergyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allergy: any;
    onSuccess?: () => void;
}

export function EditAllergyDialog({ open, onOpenChange, allergy, onSuccess }: EditAllergyDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        aliases: "",
    });

    useEffect(() => {
        if (open && allergy) {
            setFormData({
                name: allergy.name || "",
                aliases: allergy.aliases ? allergy.aliases.join(", ") : "",
            });
        }
    }, [open, allergy]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Please fill in the allergy name");
            return;
        }

        setLoading(true);
        try {
            const aliasesArray = formData.aliases
                ? formData.aliases.split(",").map(a => a.trim()).filter(a => a !== "")
                : [];

            const response = await axiosSecure.patch(`/allergies/${allergy._id}`, {
                name: formData.name,
                aliases: aliasesArray
            });

            if (response.data.success) {
                toast.success("Allergy updated successfully");
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error: any) {
            console.error("Error updating allergy:", error);
            toast.error(error.response?.data?.message || "Failed to update allergy");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white focus-visible:outline-none">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">Edit Allergy</DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 pb-10 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Allergy Name <span className="text-red-500">*</span></Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Peanuts"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Aliases (comma separated)</Label>
                        <Input
                            name="aliases"
                            value={formData.aliases}
                            onChange={handleInputChange}
                            placeholder="Ground nuts, Arachis hypogaea"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                        <p className="text-[10px] text-slate-400 font-medium">
                            Enter multiple aliases separated by commas
                        </p>
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
                            className="flex-1 h-12 bg-[#002D54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Allergy"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
