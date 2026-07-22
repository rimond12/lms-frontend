import React from "react";
import { IUserCv } from "@/types/cvBuilder.types";
import { getImageUrl } from "@/utils/imageUtils";

interface Props {
  cv: IUserCv;
  primaryColor?: string;
}

export const TechTemplate: React.FC<Props> = ({ cv, primaryColor = "#0284c7" }) => {
  const {
    personalInfo = { fullName: "", jobTitle: "", email: "", phone: "", address: "" },
    workExperience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
  } = cv;

  return (
    <div className="w-full bg-slate-900 text-slate-100 font-mono p-6 sm:p-7 shadow-xl aspect-[1/1.414] flex flex-col justify-between overflow-hidden">
      <div>
        {/* Top Banner */}
        <div className="border-b border-slate-800 pb-4 mb-4">
          <div className="flex justify-between items-center gap-3">
            {personalInfo.photoUrl && (
              <img
                src={getImageUrl(personalInfo.photoUrl)}
                alt={personalInfo.fullName}
                className="w-14 h-14 rounded-lg object-cover border border-sky-500/40 shadow-sm shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-sky-400 truncate">
                &lt;{personalInfo.fullName || "Engineer Name"} /&gt;
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5 font-sans font-semibold uppercase tracking-wider truncate">
                {personalInfo.jobTitle || "Software Engineer / Technical Professional"}
              </p>
            </div>
            <div className="text-[9.5px] text-slate-400 font-sans space-y-0.5 text-right shrink-0">
              {personalInfo.email && <p>email: {personalInfo.email}</p>}
              {personalInfo.phone && <p>phone: {personalInfo.phone}</p>}
              {personalInfo.github && <p className="text-sky-400">github: {personalInfo.github}</p>}
            </div>
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-4 font-sans text-[10px] bg-slate-800/60 p-2.5 rounded-lg border border-slate-800 text-slate-300 leading-snug line-clamp-3">
            <span className="text-sky-400 font-mono text-[9.5px] font-bold block mb-0.5">// Summary</span>
            {personalInfo.summary}
          </div>
        )}

        {/* Technical Skills Highlight */}
        {skills.length > 0 && (
          <div className="mb-4 font-sans">
            <h2 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-1.5">
              // Tech Stack & Competencies
            </h2>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 10).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-sky-300 text-[9.5px] font-mono px-2 py-0.5 rounded border border-slate-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <div className="mb-4 font-sans">
            <h2 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
              // Experience History
            </h2>
            <div className="space-y-2.5">
              {workExperience.slice(0, 2).map((exp, idx) => (
                <div key={idx} className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-[11px] font-bold text-white font-mono">{exp.position}</h3>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-400 font-semibold mt-0.5">{exp.company}</p>
                  {exp.responsibilities && (
                    <p className="text-[10px] text-slate-300 mt-1 leading-snug line-clamp-3">
                      {exp.responsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-4 font-sans">
            <h2 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-2">
              // Major Projects
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {projects.slice(0, 2).map((proj, idx) => (
                <div key={idx} className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                  <h3 className="text-[10px] font-bold text-white font-mono truncate">{proj.title}</h3>
                  {proj.techStack && (
                    <p className="text-[9px] text-sky-300 font-mono mt-0.5 truncate">Stack: {proj.techStack}</p>
                  )}
                  {proj.description && (
                    <p className="text-[9.5px] text-slate-300 mt-1 leading-snug line-clamp-2">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certs Grid */}
        <div className="grid grid-cols-2 gap-4 font-sans">
          {education.length > 0 && (
            <div>
              <h2 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
                // Education
              </h2>
              <div className="space-y-1 text-[10px]">
                {education.slice(0, 1).map((edu, idx) => (
                  <div key={idx} className="bg-slate-800/30 p-2 rounded border border-slate-800">
                    <p className="font-bold text-white truncate">{edu.degree}</p>
                    <p className="text-[9px] text-slate-400 truncate">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
                // Certifications
              </h2>
              <div className="space-y-1 text-[10px]">
                {certifications.slice(0, 1).map((cert, idx) => (
                  <div key={idx} className="bg-slate-800/30 p-2 rounded border border-slate-800">
                    <p className="font-bold text-white truncate">{cert.name}</p>
                    <p className="text-[9px] text-slate-400 truncate">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
