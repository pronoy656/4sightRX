"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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

export interface HostedFormularyItem {
    _id?: string;
    id?: string;
    tier: string;
    medication: string;
    strength: string;
    route: string;
    frequency: string;
    monthlyCost: number;
    preferredAlternative: string;
}

interface EditHostedFormularyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: HostedFormularyItem | null;
    onSave: (updatedItem: HostedFormularyItem) => void;
}

export function EditHostedFormularyDialog({
    open,
    onOpenChange,
    data,
    onSave,
}: EditHostedFormularyDialogProps) {
    const [formData, setFormData] = useState<HostedFormularyItem>({
        tier: "",
        medication: "",
        strength: "",
        route: "",
        frequency: "",
        monthlyCost: 0,
        preferredAlternative: "",
    });

    useEffect(() => {
        if (open && data) {
            setFormData({ ...data });
        }
    }, [open, data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.id === "monthlyCost" ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.id]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                        Edit Hosted Formulary Item
                    </DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 pb-10 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="medication" className="text-sm font-semibold text-slate-600">Medication Name*</Label>
                        <Input
                            id="medication"
                            placeholder="e.g., Morphine ER"
                            value={formData.medication}
                            onChange={handleChange}
                            required
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="tier" className="text-sm font-semibold text-slate-600">Tier*</Label>
                            <Input
                                id="tier"
                                placeholder="e.g., P"
                                value={formData.tier}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="strength" className="text-sm font-semibold text-slate-600">Strength*</Label>
                            <Input
                                id="strength"
                                placeholder="e.g., 15 mg ER"
                                value={formData.strength}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="route" className="text-sm font-semibold text-slate-600">Route*</Label>
                            <Input
                                id="route"
                                placeholder="e.g., PO"
                                value={formData.route}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frequency" className="text-sm font-semibold text-slate-600">Frequency*</Label>
                            <Input
                                id="frequency"
                                placeholder="e.g., Q12H"
                                value={formData.frequency}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="monthlyCost" className="text-sm font-semibold text-slate-600">Monthly Cost ($)*</Label>
                            <Input
                                id="monthlyCost"
                                type="number"
                                placeholder="e.g., 0"
                                value={formData.monthlyCost}
                                onChange={handleChange}
                                required
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="preferredAlternative" className="text-sm font-semibold text-slate-600">Preferred Alternative</Label>
                            <Input
                                id="preferredAlternative"
                                placeholder="e.g., Morphine ER 15-30 mg"
                                value={formData.preferredAlternative}
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
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 h-12 bg-[#002B54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors"
                        >
                            Update Row
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
