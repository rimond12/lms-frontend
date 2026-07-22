"use client";

import React from "react";
import { IUserCv } from "@/types/cvBuilder.types";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { TechTemplate } from "./templates/TechTemplate";

interface Props {
  cv: IUserCv;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export const CvPreview: React.FC<Props> = ({ cv, previewRef }) => {
  const templateId = cv.templateId || "modern";
  const primaryColor = cv.accentColor || "#1a4da1";

  const renderTemplate = () => {
    switch (templateId) {
      case "executive":
        return <ExecutiveTemplate cv={cv} primaryColor={primaryColor} />;
      case "minimalist":
        return <MinimalistTemplate cv={cv} primaryColor={primaryColor} />;
      case "tech":
        return <TechTemplate cv={cv} primaryColor={primaryColor} />;
      case "modern":
      default:
        return <ModernTemplate cv={cv} primaryColor={primaryColor} />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-200/90 dark:bg-slate-900/90 p-2 sm:p-5 rounded-3xl flex justify-center border border-slate-300/80 dark:border-slate-800/80 shadow-inner">
      <div
        ref={previewRef}
        className="w-full max-w-[850px] shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 transform scale-100 origin-top border border-slate-200/50 dark:border-slate-800"
      >
        {renderTemplate()}
      </div>
    </div>
  );
};
