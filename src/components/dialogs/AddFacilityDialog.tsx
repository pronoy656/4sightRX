"use client";
import React from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AddFacilityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddFacilityDialog({ open, onOpenChange }: AddFacilityDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
                <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 sticky top-0 bg-white z-10">
                    <DialogTitle className="text-xl font-bold text-slate-800">Add New Facility</DialogTitle>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>

                <div className="p-8 pb-10 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Facility Name</Label>
                        <Input
                            placeholder="St. Mary's Hospital"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Type</Label>
                            <Select>
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
                            <Label className="text-sm font-semibold text-slate-600">Location</Label>
                            <Input
                                placeholder="New York, NY"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-600">Address</Label>
                        <Input
                            placeholder="123 Healthcare Ave"
                            className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Phone</Label>
                            <Input
                                placeholder="(555) 123-4567"
                                className="h-11 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-600">Assign Admin</Label>
                            <Select>
                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                    <SelectValue placeholder="Select admin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">John Davis</SelectItem>
                                    <SelectItem value="2">Dr. Emily Chen</SelectItem>
                                    <SelectItem value="3">Sarah Johnson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 h-12 bg-[#002D54] hover:bg-[#002B54]/90 rounded-xl text-white font-bold transition-colors"
                            onClick={() => onOpenChange(false)}
                        >
                            Add Facility
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
