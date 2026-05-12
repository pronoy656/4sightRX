"use client";
import React, { useState } from "react";
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

interface AddOrganizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddOrganizationDialog({ open, onOpenChange, onSuccess }: AddOrganizationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contactNumber: "",
        address: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosSecure.post("/organizations", formData);
            if (response.data.success) {
                toast.success("Organization created successfully");
                onSuccess?.();
                onOpenChange(false);
                setFormData({
                    name: "",
                    email: "",
                    contactNumber: "",
                    address: "",
                });
            }
        } catch (error: any) {
            console.error("Error creating organization:", error);
            toast.error(error.response?.data?.message || "Failed to create organization");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white focus-visible:outline-none">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">Add New Organization</DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 pb-10 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Organization Name <span className="text-red-500">*</span></Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Health Corp"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Email <span className="text-red-500">*</span></Label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="contact@healthcorp.com"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Contact Number</Label>
                        <Input
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 000-0000"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Address</Label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="123 Main St, Anytown, USA"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
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
                            className="flex-1 h-12 bg-[#002D54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add Organization"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
