"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

interface Props {
  previewRef: React.RefObject<HTMLDivElement | null>;
  cvTitle?: string;
}

export const CvExportButton: React.FC<Props> = ({ previewRef, cvTitle = "My_CV" }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!previewRef.current) {
      toast.error("CV preview element not found.");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Generating single-page PDF...");

    try {
      const element = previewRef.current;

      // Render DOM element to high-res PNG data URL
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Single page A4 PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Draw single clean page PDF fitting full A4 dimensions
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const safeTitle = (cvTitle || "Professional_CV").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `${safeTitle}.pdf`;

      // Direct download single-page PDF
      pdf.save(fileName);

      toast.success("Single-Page PDF Downloaded Successfully!", { id: toastId });
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF download.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={isExporting}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download size={16} />
          <span>Download PDF</span>
        </>
      )}
    </button>
  );
};
