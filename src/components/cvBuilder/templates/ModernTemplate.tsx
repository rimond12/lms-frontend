import React from "react";
import { IUserCv } from "@/types/cvBuilder.types";
import { getImageUrl } from "@/utils/imageUtils";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages as LangIcon,
  User,
  Target,
} from "lucide-react";

interface Props {
  cv: IUserCv;
  primaryColor?: string;
}

export const ModernTemplate: React.FC<Props> = ({ cv, primaryColor = "#1a4da1" }) => {
  const {
    personalInfo = { fullName: "", jobTitle: "", email: "", phone: "", address: "" },
    workExperience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    customSections = [],
  } = cv;

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-6 sm:p-7 shadow-lg aspect-[1/1.414] flex flex-col justify-between overflow-hidden">
      <div>
        {/* Compact Header Banner */}
        <div
          className="p-5 rounded-xl text-white mb-5 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {personalInfo.photoUrl && (
              <img
                src={getImageUrl(personalInfo.photoUrl)}
                alt={personalInfo.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow"
              />
            )}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="text-2xl font-black tracking-tight uppercase truncate">
                {personalInfo.fullName || "Your Full Name"}
              </h1>
              <p className="text-xs font-semibold text-white/90 mt-0.5 tracking-wide uppercase truncate">
                {personalInfo.jobTitle || "Your Target Job Title"}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[10px] font-medium text-white/80 mt-2.5 pt-2 border-t border-white/20">
                {personalInfo.email && (
                  <div className="flex items-center gap-1">
                    <Mail size={11} />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-1">
                    <Phone size={11} />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.address && (
                  <div className="flex items-center gap-1">
                    <MapPin size={11} />
                    <span>{personalInfo.address}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-1">
                    <Globe size={11} />
                    <span>{personalInfo.website}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-1">
                    <Linkedin size={11} />
                    <span>{personalInfo.linkedin}</span>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center gap-1">
                    <Github size={11} />
                    <span>{personalInfo.github}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Left Column (Main Content) - 7 cols */}
          <div className="col-span-7 space-y-4">
            {/* Summary */}
            {personalInfo.summary && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <User size={14} />
                  <span>Professional Summary</span>
                </h2>
                <p className="text-[10.5px] text-slate-600 leading-snug whitespace-pre-line">
                  {personalInfo.summary}
                </p>
              </section>
            )}

            {/* Career Objective */}
            {personalInfo.careerObjective && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <Target size={14} />
                  <span>Career Objective</span>
                </h2>
                <p className="text-[10.5px] text-slate-600 leading-snug whitespace-pre-line">
                  {personalInfo.careerObjective}
                </p>
              </section>
            )}

            {/* Work Experience */}
            {workExperience.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <Briefcase size={14} />
                  <span>Work Experience</span>
                </h2>
                <div className="space-y-2.5">
                  {workExperience.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="relative pl-3 border-l-2 border-slate-200">
                      <div className="flex justify-between items-baseline flex-wrap">
                        <h3 className="text-[11px] font-bold text-slate-900">{exp.position}</h3>
                        <span className="text-[9.5px] font-semibold text-slate-500">
                          {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-700">
                        {exp.company} {exp.location ? `| ${exp.location}` : ""}
                      </p>
                      {exp.responsibilities && (
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug whitespace-pre-line line-clamp-3">
                          {exp.responsibilities}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <Code size={14} />
                  <span>Key Projects</span>
                </h2>
                <div className="space-y-2">
                  {projects.slice(0, 2).map((proj, idx) => (
                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[10.5px] font-bold text-slate-900">{proj.title}</h3>
                        {proj.link && (
                          <span className="text-[9px] font-semibold text-blue-600">Link ↗</span>
                        )}
                      </div>
                      {proj.techStack && (
                        <p className="text-[9.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">Stack:</span> {proj.techStack}
                        </p>
                      )}
                      {proj.description && (
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Sidebar) - 5 cols */}
          <div className="col-span-5 space-y-4">
            {/* Education */}
            {education.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <GraduationCap size={14} />
                  <span>Education</span>
                </h2>
                <div className="space-y-2">
                  {education.slice(0, 2).map((edu, idx) => (
                    <div key={idx}>
                      <h3 className="text-[10.5px] font-bold text-slate-900">{edu.degree}</h3>
                      <p className="text-[10px] text-slate-700 font-medium">{edu.institution}</p>
                      <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                        <span>{edu.startDate} - {edu.isCurrent ? "Present" : edu.endDate}</span>
                        {edu.grade && <span className="font-semibold">Grade: {edu.grade}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <Code size={14} />
                  <span>Skills & Expertise</span>
                </h2>
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 10).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9.5px] font-semibold border border-slate-200"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <Award size={14} />
                  <span>Certifications</span>
                </h2>
                <div className="space-y-1 text-[10px]">
                  {certifications.slice(0, 3).map((cert, idx) => (
                    <div key={idx}>
                      <p className="font-bold text-slate-900">{cert.name}</p>
                      <p className="text-[9px] text-slate-500">{cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ""}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-0.5 border-b"
                  style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                >
                  <LangIcon size={14} />
                  <span>Languages</span>
                </h2>
                <div className="space-y-1">
                  {languages.slice(0, 3).map((lang, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px]">
                      <span className="font-medium text-slate-800">{lang.language}</span>
                      <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {lang.proficiency}
                      </span>
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
