"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axiosSecure from "@/components/hook/axiosSecure";
import {
  EditHostedFormularyDialog,
  HostedFormularyItem
} from "@/components/dialogs/EditHostedFormularyDialog";

export default function HostedFormularyPage() {
  const [data, setData] = useState<HostedFormularyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const [editItem, setEditItem] = useState<HostedFormularyItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const fetchFormularies = async () => {
      try {
        setIsLoadingData(true);
        const response = await axiosSecure.get("/medication-tier");
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load hosted formularies.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchFormularies();
  }, []);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Invalid file format. Please upload a .csv or .xlsx file.");
      return;
    }

    const formData = new FormData();
    formData.append("doc", file);

    setIsUploading(true);
    try {
      const response = await axiosSecure.post("/import/trial", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        const resultData = response.data.data;
        // Ensure imported data has a unique ID for local editing
        const dataWithIds = resultData.data.map((item: any, idx: number) => ({
          ...item,
          _id: item._id || `temp-import-${Date.now()}-${idx}`
        }));
        setData(dataWithIds);
        setCurrentPage(1);
        toast.success(`${response.data.message}. Processed ${resultData.processedRecords} of ${resultData.totalRecords} records.`);
      } else {
        toast.error(response.data.message || "Failed to import data.");
      }
    } catch (err: any) {
      console.error("Error uploading file:", err);
      toast.error(err.response?.data?.message || "An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ["Tier", "Medication", "Strength", "Route", "Frequency", "Monthly Cost", "Preferred Alternative"];
    const rows = [
      ["P", "Morphine ER", "15 mg ER", "PO", "Q12H", "0", "—"],
      ["N", "Oxycodone ER", "20 mg ER", "PO", "Q12H", "0", "Morphine ER 15-30 mg PO Q12H ($30/mo)"],
    ];

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "hosted_formulary_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template download initiated!");
  };

  // Action handlers
  const handleEditClick = (item: HostedFormularyItem) => {
    setEditItem(item);
    setIsAddingNew(false);
    setIsEditDialogOpen(true);
  };



  const handleDialogSave = async (updatedItem: HostedFormularyItem) => {
    try {
      const { _id, id, ...rest } = updatedItem;
      const targetId = _id || id;
      const isExistingInDb = targetId && !targetId.startsWith("temp-");

      if (isExistingInDb) {
        // Phase C: Database Data Editing (After Hosting)
        // Only that specific row is updated in the database
        const response = await axiosSecure.patch(`/medication-tier/${targetId}`, rest);

        if (response.data.success && response.data.data) {
          const savedItem = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data;

          setData(prev => prev.map(item => {
            const isMatch =
              (item._id && updatedItem._id && item._id === updatedItem._id) ||
              (item.id && updatedItem.id && item.id === updatedItem.id);
            return isMatch ? savedItem : item;
          }));
          toast.success("Medication details updated in database.");
        } else {
          toast.error(response.data.message || "Failed to update row in database.");
        }
      } else {
        // Phase A: CSV -> Temporary (Staging Mode)
        // All edits are applied only to local state. No API calls are made.
        if (isAddingNew) {
          const itemWithTempId = { ...updatedItem, _id: `temp-${Date.now()}` };
          setData(prev => [itemWithTempId, ...prev]);
          toast.success("New medication added locally.");
        } else {
          setData(prev => prev.map(item => {
            const isMatch =
              (item._id && updatedItem._id && item._id === updatedItem._id) ||
              (item.id && updatedItem.id && item.id === updatedItem.id);
            return isMatch ? updatedItem : item;
          }));
          toast.success("Medication details updated locally.");
        }
      }
    } catch (err: any) {
      console.error("Save row error", err);
      toast.error(err.response?.data?.message || "An error occurred while updating the row.");
    }
  };

  const handleDeleteRow = (id: string | undefined) => {
    if (!id) return;
    setData(prev => prev.filter(item => item._id !== id && item.id !== id));
    toast.success("Item removed from temporary list.");
  };

  const handleClearTable = () => {
    if (confirm("Are you sure you want to clear the table? Unsaved changes will be lost.")) {
      setData([]);
      setCurrentPage(1);
      toast.success("Table cleared.");
    }
  };

  const handleSaveFormulary = async () => {
    if (data.length === 0) {
      toast.error("No data to save.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = data.map(item => {
        const { _id, id, ...rest } = item;
        // Keep the _id if it's a real backend ID to allow updating existing records,
        // otherwise send without _id so the backend treats it as a new creation.
        if (_id && !_id.startsWith("temp-")) {
          return { ...rest, _id };
        }
        return rest;
      });

      const response = await axiosSecure.post("/medication-tier", payload);

      if (response.data.success) {
        toast.success(response.data.message || "Hosted Formulary saved successfully!");
        if (response.data.data) {
          setData(response.data.data);
        }
      } else {
        toast.error(response.data.message || "Failed to save data.");
      }
    } catch (err: any) {
      console.error("Save error", err);
      toast.error(err.response?.data?.message || "An error occurred while saving the formulary.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered rows
  const filteredData = data.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.medication.toLowerCase().includes(query) ||
      item.tier.toLowerCase().includes(query) ||
      item.route.toLowerCase().includes(query) ||
      item.preferredAlternative.toLowerCase().includes(query)
    );
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="py-8 px-4 space-y-8 ">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Hosted Formulary</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Upload custom formulary lists, manage medications, and define tier rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleClearTable}
            variant="outline"
            className="h-12 px-5 border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Data
          </Button>
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            className="h-12 px-5 border-[#002B54]/20 text-[#002B54] hover:bg-[#002B54]/5 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

        </div>
      </div>

      {/* File Upload Section */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative bg-white border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[200px]",
          isDragActive
            ? "border-[#002B54] bg-[#002B54]/[0.02] scale-[1.01]"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        <input
          type="file"
          id="file-input"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-[#002B54] animate-spin" />
            <h3 className="text-base font-bold text-slate-800">Uploading and Processing...</h3>
          </div>
        ) : (
          <>
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm mb-4">
              <Upload className="h-6 w-6 text-[#002B54]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Drag & drop your formulary file here
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-4 leading-normal">
              Supported file format: .csv or .xlsx. Headings should include: <strong>Tier, Medication, Strength, Route, Frequency, Monthly Cost, Preferred Alternative</strong>.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-6 border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-bold transition-all relative z-20 pointer-events-none"
            >
              Select File from Device
            </Button>
          </>
        )}
      </div>

      {/* Search and Table Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search formulary by drug, tier, alternative..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-100"
            />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Total Records: <strong className="text-slate-800">{filteredData.length}</strong>
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[12%]">TIER</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[23%]">MEDICATION</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[12%]">STRENGTH</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">ROUTE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[12%]">FREQ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">MONTHLY COST</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[21%]">PREFERRED ALTERNATIVE</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right w-[10%]">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoadingData ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 text-[#002B54] animate-spin" />
                      <span className="text-slate-500 font-medium">Loading formularies...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400 font-medium">
                    No medications found. Try uploading a CSV/XLSX file or adding a row manually.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                        item.tier.toUpperCase() === "P"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : item.tier.toUpperCase() === "N"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                      )}>
                        {item.tier}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-800 text-sm">
                      {item.medication}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {item.strength}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {item.route}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      ${item.monthlyCost}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                      {item.preferredAlternative === "—" || !item.preferredAlternative ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className="text-slate-600 font-semibold">{item.preferredAlternative}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="h-8 w-8 text-slate-400 hover:text-[#002B54] hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Row"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRow(item._id || item.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-6 py-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="text-sm text-slate-500 font-medium">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} medications
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 text-sm font-bold text-[#002B54] border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl transition-colors",
                    currentPage === idx + 1
                      ? "text-white bg-[#002B54]"
                      : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 text-sm font-bold text-[#002B54] border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button Section (centered/aligned under the table as requested) */}
      <div className="flex items-center justify-center pt-4">
        <Button
          onClick={handleSaveFormulary}
          disabled={isSaving}
          className="h-14 px-12 bg-[#002B54] hover:bg-[#002B54]/90 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving Formulary...
            </div>
          ) : (
            "Save Hosted Formulary"
          )}
        </Button>
      </div>

      {/* Edit Dialog */}
      <EditHostedFormularyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data={editItem}
        onSave={handleDialogSave}
      />
    </div>
  );
}
