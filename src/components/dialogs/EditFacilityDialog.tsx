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

interface EditFacilityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    facility: any;
    onSuccess?: () => void;
}

interface User {
    _id: string;
    name: string;
}

export function EditFacilityDialog({ open, onOpenChange, facility, onSuccess }: EditFacilityDialogProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        facilityName: "",
        type: "",
        location: "",
        address: "",
        phone: "",
        assignAdmin: "",
        status: "active",
    });

    useEffect(() => {
        if (open) {
            fetchUsers();
            if (facility) {
                setFormData({
                    facilityName: facility.facilityName || "",
                    type: facility.type || "",
                    location: facility.location || "",
                    address: facility.address || "",
                    phone: facility.phone || "",
                    assignAdmin: facility.assignAdmin && typeof facility.assignAdmin === 'object' ? facility.assignAdmin._id : (facility.assignAdmin || ""),
                    status: facility.status || "active",
                });
            }
        }
    }, [open, facility]);

    const fetchUsers = async () => {
        try {
            const response = await axiosSecure.get("user/all-users", {
                params: { limit: 100 }
            });
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
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
        if (!formData.facilityName || !formData.type || !formData.assignAdmin) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosSecure.patch(`/facility/${facility._id}`, formData);
            if (response.data.success) {
                toast.success("Facility updated successfully");
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error: any) {
            console.error("Error updating facility:", error);
            toast.error(error.response?.data?.message || "Failed to update facility");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white focus-visible:outline-none">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">Edit Facility</DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 pb-10 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Facility Name <span className="text-red-500">*</span></Label>
                        <Input
                            name="facilityName"
                            value={formData.facilityName}
                            onChange={handleInputChange}
                            placeholder="St. Mary's Hospital"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Type <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(val) => handleSelectChange("type", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hospital">Hospital</SelectItem>
                                    <SelectItem value="Hospice">Hospice</SelectItem>
                                    <SelectItem value="LTC">LTC (Long-Term Care)</SelectItem>
                                    <SelectItem value="ECF">ECF (Extended Care Facility)</SelectItem>
                                    <SelectItem value="PBM">PBM (Pharmacy Benefits)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Status <span className="text-red-500">*</span></Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(val) => handleSelectChange("status", val)}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Location</Label>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="New York, NY"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Phone</Label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="(555) 123-4567"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Address</Label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="123 Healthcare Ave"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Assign Admin <span className="text-red-500">*</span></Label>
                        <Select 
                            value={formData.assignAdmin} 
                            onValueChange={(val) => handleSelectChange("assignAdmin", val)}
                        >
                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                <SelectValue placeholder="Select admin" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user._id} value={user._id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Facility"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
