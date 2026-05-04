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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axiosSecure from "@/components/hook/axiosSecure";
import { toast } from "sonner";

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [agencies, setAgencies] = useState<{ _id: string; facilityName: string }[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER",
        agencyId: "",
    });

    useEffect(() => {
        if (open) {
            fetchAgencies();
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "USER",
                agencyId: "",
            });
        }
    }, [open]);

    const fetchAgencies = async () => {
        try {
            const response = await axiosSecure.get("/facility");
            if (response.data.success) {
                setAgencies(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching agencies:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.agencyId) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosSecure.post("/user", formData);
            if (response.data.success) {
                toast.success("User created successfully");
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error: any) {
            console.error("Error creating user:", error);
            toast.error(error.response?.data?.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white focus-visible:outline-none">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">Add New User</DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 pb-10 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Email Address <span className="text-red-500">*</span></Label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Password <span className="text-red-500">*</span></Label>
                        <Input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter a secure password"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Role <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.role} 
                                onValueChange={(val) => handleSelectChange("role", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Agency <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.agencyId} 
                                onValueChange={(val) => handleSelectChange("agencyId", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select agency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agencies.map((agency) => (
                                        <SelectItem key={agency._id} value={agency._id}>
                                            {agency.facilityName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create User"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
