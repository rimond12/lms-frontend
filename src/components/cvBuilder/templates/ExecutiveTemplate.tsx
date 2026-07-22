import React from "react";
import { IUserCv } from "@/types/cvBuilder.types";
import { getImageUrl } from "@/utils/imageUtils";

interface Props {
  cv: IUserCv;
  primaryColor?: string;
}

export const ExecutiveTemplate: React.FC<Props> = ({ cv, primaryColor = "#0f172a" }) => {
  const {
    personalInfo = { fullName: "", jobTitle: "", email: "", phone: "", address: "" },
    workExperience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
  } = cv;

  return (
    <div className="w-full bg-white text-slate-800 font-serif p-7 sm:p-8 shadow-lg aspect-[1/1.414] flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 mb-5">
          {personalInfo.photoUrl && (
            <img
              src={getImageUrl(personalInfo.photoUrl)}
              alt={personalInfo.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-800 shadow-sm shrink-0"
            />
          )}
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold uppercase tracking-widest text-slate-900 truncate">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <p className="text-xs font-semibold tracking-widest uppercase mt-1 text-slate-600 truncate">
              {personalInfo.jobTitle || "Executive Job Title"}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-sans text-slate-600 mt-2.5">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.address && <span>• {personalInfo.address}</span>}
              {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 font-sans">
          {/* Summary */}
          {personalInfo.summary && (
            <section>
              <h2
                className="text-[11px] font-bold uppercase tracking-widest pb-0.5 border-b border-slate-300 mb-1.5"
                style={{ color: primaryColor }}
              >
                Executive Profile
              </h2>
              <p className="text-[10px] text-slate-700 leading-snug whitespace-pre-line line-clamp-3">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <section>
              <h2
                className="text-[11px] font-bold uppercase tracking-widest pb-0.5 border-b border-slate-300 mb-2"
                style={{ color: primaryColor }}
              >
                Professional Experience
              </h2>
              <div className="space-y-3">
                {workExperience.slice(0, 3).map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[9.5px] font-semibold text-slate-500">
                        {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-700 italic">
                      {exp.company} {exp.location ? `, ${exp.location}` : ""}
                    </p>
                    {exp.responsibilities && (
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug line-clamp-3">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Skills Grid */}
          <div className="grid grid-cols-2 gap-5 pt-1">
            {education.length > 0 && (
              <section>
                <h2
                  className="text-[11px] font-bold uppercase tracking-widest pb-0.5 border-b border-slate-300 mb-1.5"
                  style={{ color: primaryColor }}
                >
                  Education
                </h2>
                <div className="space-y-1.5">
                  {education.slice(0, 2).map((edu, idx) => (
                    <div key={idx}>
                      <h3 className="text-[10.5px] font-bold text-slate-900">{edu.degree}</h3>
                      <p className="text-[9.5px] text-slate-700">{edu.institution}</p>
                      <p className="text-[9px] text-slate-500">
                        {edu.startDate} – {edu.isCurrent ? "Present" : edu.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h2
                  className="text-[11px] font-bold uppercase tracking-widest pb-0.5 border-b border-slate-300 mb-1.5"
                  style={{ color: primaryColor }}
                >
                  Core Competencies
                </h2>
                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                  {skills.slice(0, 8).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-slate-700 truncate">
                      <span className="w-1 h-1 rounded-full bg-slate-800 shrink-0"></span>
                      <span className="font-semibold truncate">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
