"use client";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useMemo } from "react";

// Custom hook for profile completion calculation
export const useProfileCompletion = () => {
  const { user } = useUser();

  return useMemo(() => {
    const fields = [
      {
        key: "basicInfo",
        label: "Basic Information",
        completed: !!(user?.name && user?.email),
        weight: 15,
      },
      {
        key: "contact",
        label: "Contact Number",
        completed: !!user?.mobileNumber,
        weight: 10,
      },
      {
        key: "photo",
        label: "Profile Photo",
        completed: !!user?.profilePhoto,
        weight: 10,
      },
      {
        key: "address",
        label: "Address",
        completed: !!user?.address,
        weight: 10,
      },
      { key: "nid", label: "National ID", completed: !!user?.nid, weight: 8 },
      { key: "age", label: "Age", completed: !!user?.age, weight: 8 },
      { key: "cv", label: "CV/Resume", completed: !!user?.cvUrl, weight: 6 },
      {
        key: "experience",
        label: "Experience Certificate",
        completed: !!user?.experienceCertificateUrl,
        weight: 6,
      },
      {
        key: "university",
        label: "University Certificate",
        completed: !!user?.universityCertificateUrl,
        weight: 6,
      },
      {
        key: "academic",
        label: "Academic Qualifications",
        completed: !!(
          user?.degreeType &&
          user?.universityName &&
          user?.degreeTitle
        ),
        weight: 10,
      },
      {
        key: "jobExperiences",
        label: "Job Experiences",
        completed: !!(
          user?.jobExperiences &&
          user.jobExperiences.length > 0 &&
          user.jobExperiences.some(
            (job) => job.organizationName && job.position && job.startDate,
          )
        ),
        weight: 8,
      },
      {
        key: "iebNo",
        label: "IEB Membership",
        completed: !!user?.iebNo,
        weight: 6,
      },
      {
        key: "affiliation",
        label: "Professional Affiliation",
        completed: !!(user?.affiliationTitle && user?.affiliationInstitution),
        weight: 7,
      },
      // Removed 'documents' field to avoid double-counting individual document fields
    ];

    const completedWeight = fields.reduce(
      (sum, field) => sum + (field.completed ? field.weight : 0),
      0,
    );
    const completedCount = fields.filter((field) => field.completed).length;

    // Calculate percentage based on total possible weight
    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const percentage = Math.min(
      Math.round((completedWeight / totalWeight) * 100),
      100,
    );

    return {
      percentage,
      completedCount,
      totalCount: fields.length,
      fields,
      completedWeight,
      totalWeight,
    };
  }, [user]);
};

// For backward compatibility, export a function that uses the hook
export const getProfileCompletion = () => {
  // This will throw an error if called outside a component
  // Use useProfileCompletion() hook instead
  throw new Error(
    "getProfileCompletion() cannot be called outside a React component. Use useProfileCompletion() hook instead.",
  );
};
