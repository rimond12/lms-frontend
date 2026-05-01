"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface CompletionChecklistProps {
  programData: any;
  curriculum: any[];
  experts: any[];
  materials: any[];
  quizzes: any[];
}

/**
 * Completion Checklist
 * Shows real-time status of what's been added and what's still needed
 */
export const CompletionChecklist: React.FC<CompletionChecklistProps> = ({
  programData,
  curriculum,
  experts,
  materials,
  quizzes,
}) => {
  const checks = [
    { label: " Title", completed: !!programData.title },
    { label: "Description", completed: !!programData.description },
    { label: "Curriculum", completed: curriculum.length > 0 },
    { label: "Experts Added", completed: experts.length > 0 },
    { label: "Materials Added", completed: materials.length > 0 },
    { label: "Quizzes Added", completed: quizzes.length > 0 },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const completionPercentage = Math.round(
    (completedCount / checks.length) * 100
  );

  return (
    <div className="bg-red-50 rounded-lg p-5 border-2 border-red-200">
      
    


     
    </div>
  );
};

export default CompletionChecklist;
