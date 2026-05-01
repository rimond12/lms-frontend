"use client";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  FileText,
  Download,
  Eye,
  Briefcase,
} from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { getFullDocumentUrl } from "@/utils/imageUtils";
import { useRef } from "react";

const CVPage = () => {
  const { user } = useUser();
  const cvRef = useRef<HTMLDivElement>(null);

  // Download CV as PDF function
  const downloadCV = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${user?.name || "CV"} - Curriculum Vitae</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.5; }
            .cv-container { max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { display: flex; gap: 24px; padding-bottom: 24px; border-bottom: 2px solid #1a1a1a; margin-bottom: 24px; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #1a1a1a; }
            .avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; background: #1a1a1a; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
            .header-info { flex: 1; }
            .name { font-size: 28px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px; }
            .contact-row { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #444; margin-top: 8px; }
            .contact-item { display: flex; align-items: center; gap: 4px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; padding-bottom: 6px; border-bottom: 1px solid #ddd; margin-bottom: 12px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .info-item { }
            .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 2px; }
            .info-value { font-size: 14px; color: #1a1a1a; }
            .exp-item { padding: 12px 0; border-bottom: 1px solid #eee; }
            .exp-item:last-child { border-bottom: none; }
            .exp-header { display: flex; justify-content: space-between; align-items: flex-start; }
            .exp-title { font-weight: 600; font-size: 15px; }
            .exp-company { color: #444; font-size: 14px; }
            .exp-date { font-size: 12px; color: #666; text-align: right; }
            .doc-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .doc-item { font-size: 13px; padding: 4px 12px; background: #f5f5f5; border-radius: 4px; }
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .cv-container { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="cv-container">
            <div class="header">
              ${
                user?.profilePhoto
                  ? `<img src="${user.profilePhoto}" class="avatar" alt="Profile" />`
                  : `<div class="avatar-placeholder">${(user?.name || "U").slice(0, 2).toUpperCase()}</div>`
              }
              <div class="header-info">
                <div class="name">${user?.name || "Your Name"}</div>
                <div class="contact-row">
                  ${user?.email ? `<div class="contact-item">📧 ${user.email}</div>` : ""}
                  ${user?.mobileNumber ? `<div class="contact-item">📱 ${user.mobileNumber}</div>` : ""}
                  ${user?.address ? `<div class="contact-item">📍 ${user.address}</div>` : ""}
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Personal Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${user?.name || "Not provided"}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${user?.email || "Not provided"}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${user?.mobileNumber || "Not provided"}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Age</div>
                  <div class="info-value">${user?.age ? `${user.age} years` : "Not provided"}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">National ID</div>
                  <div class="info-value">${user?.nid || "Not provided"}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Address</div>
                  <div class="info-value">${user?.address || "Not provided"}</div>
                </div>
              </div>
            </div>

            ${
              user?.degreeType || user?.universityName || user?.degreeTitle
                ? `
            <div class="section">
              <div class="section-title">Education</div>
              <div class="info-grid">
                ${user?.degreeType ? `<div class="info-item"><div class="info-label">Degree</div><div class="info-value">${user.degreeType}</div></div>` : ""}
                ${user?.degreeTitle ? `<div class="info-item"><div class="info-label">Field of Study</div><div class="info-value">${user.degreeTitle}</div></div>` : ""}
                ${user?.universityName ? `<div class="info-item"><div class="info-label">Institution</div><div class="info-value">${user.universityName}</div></div>` : ""}
              </div>
            </div>
            `
                : ""
            }

            ${
              user?.jobExperiences && user.jobExperiences.length > 0
                ? `
            <div class="section">
              <div class="section-title">Work Experience</div>
              ${user.jobExperiences
                .map(
                  (job) => `
                <div class="exp-item">
                  <div class="exp-header">
                    <div>
                      <div class="exp-title">${job.position}</div>
                      <div class="exp-company">${job.organizationName}</div>
                    </div>
                    <div class="exp-date">${job.startDate} - ${job.endDate || "Present"}</div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
            `
                : ""
            }

            <div class="section">
              <div class="section-title">Documents</div>
              <div class="doc-list">
                ${user?.cvUrl ? '<div class="doc-item">✓ CV/Resume</div>' : ""}
                ${user?.experienceCertificateUrl ? '<div class="doc-item">✓ Experience Certificate</div>' : ""}
                ${user?.universityCertificateUrl ? '<div class="doc-item">✓ University Certificate</div>' : ""}
                ${!user?.cvUrl && !user?.experienceCertificateUrl && !user?.universityCertificateUrl ? '<div class="doc-item">No documents uploaded</div>' : ""}
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-800 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Curriculum Vitae
            </h1>
            <p className="text-sm text-gray-500">Professional Profile</p>
          </div>
          <button
            onClick={downloadCV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div ref={cvRef} className="bg-white rounded-lg shadow-sm">
          {/* Header Section */}
          <div className="p-6 border-b-2 border-gray-900">
            <div className="flex items-start gap-5">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {user?.profilePhoto ? (
                  <AppImage
                    photoUrl={user.profilePhoto}
                    alt="Profile"
                    width={72}
                    height={72}
                    className="w-[72px] h-[72px] rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-semibold">
                    {(user?.name || "U").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Contact */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {user?.name || "Your Name"}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                  {user?.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user?.mobileNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-gray-400" />
                      <span>{user.mobileNumber}</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate max-w-[200px]">
                        {user.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="divide-y divide-gray-100">
            {/* Personal Information */}
            <section className="p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Full Name
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {user?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Email
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {user?.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Phone
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {user?.mobileNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Age
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {user?.age ? `${user.age} years` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    National ID
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {user?.nid || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium">
                    Address
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5 line-clamp-1">
                    {user?.address || "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Education */}
            {(user?.degreeType ||
              user?.universityName ||
              user?.degreeTitle) && (
              <section className="p-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Education
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user?.degreeType && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">
                        Degree
                      </p>
                      <p className="text-sm text-gray-900 mt-0.5">
                        {user.degreeType}
                      </p>
                    </div>
                  )}
                  {user?.degreeTitle && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">
                        Field of Study
                      </p>
                      <p className="text-sm text-gray-900 mt-0.5">
                        {user.degreeTitle}
                      </p>
                    </div>
                  )}
                  {user?.universityName && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">
                        Institution
                      </p>
                      <p className="text-sm text-gray-900 mt-0.5">
                        {user.universityName}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Work Experience */}
            <section className="p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Work Experience
              </h3>
              {user?.jobExperiences && user.jobExperiences.length > 0 ? (
                <div className="space-y-4">
                  {user.jobExperiences.map((job, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {job.position}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {job.organizationName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {job.startDate} — {job.endDate || "Present"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No work experience added
                </p>
              )}
            </section>

            {/* Documents */}
            <section className="p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Documents
              </h3>
              <div className="flex flex-wrap gap-3">
                {user?.cvUrl && (
                  <a
                    href={getFullDocumentUrl(user.cvUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <FileText size={14} />
                    CV/Resume
                    <Eye size={12} className="text-gray-400" />
                  </a>
                )}
                {user?.experienceCertificateUrl && (
                  <a
                    href={getFullDocumentUrl(user.experienceCertificateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Award size={14} />
                    Experience Certificate
                    <Eye size={12} className="text-gray-400" />
                  </a>
                )}
                {user?.universityCertificateUrl && (
                  <a
                    href={getFullDocumentUrl(user.universityCertificateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Award size={14} />
                    University Certificate
                    <Eye size={12} className="text-gray-400" />
                  </a>
                )}
                {!user?.cvUrl &&
                  !user?.experienceCertificateUrl &&
                  !user?.universityCertificateUrl && (
                    <p className="text-sm text-gray-400">
                      No documents uploaded
                    </p>
                  )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPage;
