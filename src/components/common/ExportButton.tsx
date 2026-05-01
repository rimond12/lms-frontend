"use client";

import React from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { toast } from "react-hot-toast";

interface ExportButtonProps {
  data: any[];
  filename?: string;
  className?: string;
  label?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = "export",
  className,
  label = "Export",
}) => {
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create new workbook
      const wb = XLSX.utils.book_new();

      // Convert json to sheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Append sheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Write file
      XLSX.writeFile(
        wb,
        `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      toast.success("Exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium ${className}`}
    >
      <Download size={16} />
      {label}
    </button>
  );
};

export default ExportButton;
