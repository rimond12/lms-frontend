import React from "react";
import { IUserCv } from "@/types/cvBuilder.types";
import { getImageUrl } from "@/utils/imageUtils";

interface Props {
  cv: IUserCv;
  primaryColor?: string;
}

export const MinimalistTemplate: React.FC<Props> = ({ cv, primaryColor = "#0f172a" }) => {
  const {
    personalInfo = { fullName: "", jobTitle: "", email: "", phone: "", address: "" },
    workExperience = [],
    education = [],
    skills = [],
    certifications = [],
    languages = [],
  } = cv;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-7 sm:p-8 shadow-lg aspect-[1/1.414] flex flex-col justify-between overflow-hidden border-t-6" style={{ borderColor: primaryColor }}>
      <div>
        {/* Name and Header */}
        <div className="flex items-center gap-4 mb-5">
          {personalInfo.photoUrl && (
            <img
              src={getImageUrl(personalInfo.photoUrl)}
              alt={personalInfo.fullName}
              className="w-14 h-14 rounded-full object-cover border border-slate-300 shadow-sm shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-light text-slate-900 tracking-wide truncate">
              <span className="font-extrabold">{personalInfo.fullName?.split(" ")[0]}</span>{" "}
              {personalInfo.fullName?.split(" ").slice(1).join(" ")}
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5 truncate">
              {personalInfo.jobTitle}
            </p>

            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.address && <span>{personalInfo.address}</span>}
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-4">
            <p className="text-[10px] text-slate-600 leading-snug italic border-l-2 pl-2.5 border-slate-300 line-clamp-3">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
              Experience
            </h2>
            <div className="space-y-3">
              {workExperience.slice(0, 3).map((exp, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <div className="col-span-1 text-[9.5px] text-slate-400 font-medium">
                    {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                    <p className="text-[10px] text-slate-600 font-semibold">{exp.company}</p>
                    {exp.responsibilities && (
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-snug line-clamp-3">
                        {exp.responsibilities}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.slice(0, 2).map((edu, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <div className="col-span-1 text-[9.5px] text-slate-400 font-medium">
                    {edu.startDate} - {edu.isCurrent ? "Present" : edu.endDate}
                  </div>
                  <div className="col-span-3">
                    <h3 className="text-xs font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-[10px] text-slate-600">{edu.institution}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1 text-[9.5px] text-slate-700">
              {skills.slice(0, 10).map((skill, idx) => (
                <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[9.5px] font-medium">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
