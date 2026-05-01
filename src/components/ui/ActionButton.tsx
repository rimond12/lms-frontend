"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export type ActionButtonVariant =
  | "view"
  | "edit"
  | "delete"
  | "positive"
  | "warning";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  variant?: ActionButtonVariant;
  showLabel?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  className?: string;
}

const variantStyles = {
  view: {
    button: "hover:bg-blue-50 hover:text-blue-600",
    icon: "text-gray-500",
  },
  edit: {
    button: "hover:bg-gray-100 hover:text-gray-900",
    icon: "text-gray-500",
  },
  delete: {
    button: "hover:bg-red-50 hover:text-red-600",
    icon: "text-gray-500",
  },
  positive: {
    button: "hover:bg-green-50 hover:text-green-600",
    icon: "text-gray-500",
  },
  warning: {
    button: "hover:bg-orange-50 hover:text-orange-600",
    icon: "text-gray-500",
  },
};

export function ActionButton({
  icon: Icon,
  label,
  variant = "view",
  showLabel = false,
  onClick,
  disabled = false,
  href,
  className = "",
}: ActionButtonProps) {
  const styles = variantStyles[variant];

  const buttonContent = (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 p-2 rounded-lg transition-all
        ${styles.button}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <Icon size={18} className={styles.icon} />
      {showLabel && (
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      )}
    </motion.button>
  );

  // If showing label, no need for tooltip
  if (showLabel) {
    return buttonContent;
  }

  // Show tooltip for icon-only buttons
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-900 text-white border-gray-800 text-xs px-3 py-1.5"
        >
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
