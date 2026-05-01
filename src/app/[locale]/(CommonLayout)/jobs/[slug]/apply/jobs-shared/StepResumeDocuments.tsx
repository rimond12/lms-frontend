// "use client";

// import React from "react";
// import { FormData, EducationEntry, EmploymentEntry } from "./types";
// import { FieldInput, FieldSelect, SectionLabel, AddBtn } from "./ui";
// import { MONTHS, YEARS, PROFICIENCY_LEVELS, ALL_SKILLS } from "./constants";

// export function StepResumeDocuments({
//   data,
//   setData,
// }: {
//   data: FormData;
//   setData: React.Dispatch<React.SetStateAction<FormData>>;
// }) {
//   // ── Education helpers ──
//   const updateEducation = (id: string, updated: EducationEntry) =>
//     setData((p) => ({
//       ...p,
//       educations: p.educations.map((e) => (e.id === id ? updated : e)),
//     }));
//   const removeEducation = (id: string) =>
//     setData((p) => ({
//       ...p,
//       educations: p.educations.filter((e) => e.id !== id),
//     }));
//   const addEducation = () =>
//     setData((p) => ({
//       ...p,
//       educations: [
//         ...p.educations,
//         {
//           id: Date.now().toString(),
//           degree: "",
//           field: "",
//           school: "",
//           completed: "",
//         },
//       ],
//     }));

//   // ── Employment helpers ──
//   const updateEmployment = (id: string, updated: EmploymentEntry) =>
//     setData((p) => ({
//       ...p,
//       employments: p.employments.map((e) => (e.id === id ? updated : e)),
//     }));
//   const removeEmployment = (id: string) =>
//     setData((p) => ({
//       ...p,
//       employments: p.employments.filter((e) => e.id !== id),
//     }));
//   const addEmployment = () =>
//     setData((p) => ({
//       ...p,
//       employments: [
//         ...p.employments,
//         {
//           id: Date.now().toString(),
//           employer: "",
//           jobTitle: "",
//           isCurrent: false,
//           startMonth: "",
//           startYear: "",
//           endMonth: "",
//           endYear: "",
//           description: "",
//         },
//       ],
//     }));

//   const toggleSkill = (skill: string) =>
//     setData((p) => ({
//       ...p,
//       selectedSkills: p.selectedSkills.includes(skill)
//         ? p.selectedSkills.filter((s) => s !== skill)
//         : [...p.selectedSkills, skill],
//     }));

//   const addLanguage = () =>
//     setData((p) => ({
//       ...p,
//       languages: [
//         ...p.languages,
//         { id: Date.now().toString(), language: "", proficiency: "" },
//       ],
//     }));

//   return (
//     <div className="flex flex-col gap-6">
//       <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center">
//         Profile Information
//       </h2>

//       {/* ── Profile ── */}
//       <div>
//         <SectionLabel title="Profile Information" />
//         <div className="flex flex-col gap-3">
//           <div className="grid grid-cols-2 gap-3">
//             <FieldInput
//               placeholder="First name"
//               value={data.firstName}
//               onChange={(v) => setData((p) => ({ ...p, firstName: v }))}
//             />
//             <FieldInput
//               placeholder="Last name"
//               value={data.lastName}
//               onChange={(v) => setData((p) => ({ ...p, lastName: v }))}
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <FieldInput
//               placeholder="Preferred email"
//               type="email"
//               value={data.email}
//               onChange={(v) => setData((p) => ({ ...p, email: v }))}
//             />
//             <FieldInput
//               placeholder="Preferred phone number"
//               type="tel"
//               value={data.phone}
//               onChange={(v) => setData((p) => ({ ...p, phone: v }))}
//             />
//           </div>
//           <FieldInput
//             placeholder="Country or region"
//             value={data.region}
//             onChange={(v) => setData((p) => ({ ...p, region: v }))}
//           />
//           <FieldInput
//             placeholder="Street address"
//             value={data.street}
//             onChange={(v) => setData((p) => ({ ...p, street: v }))}
//           />
//           <div className="grid grid-cols-2 gap-3">
//             <FieldInput
//               placeholder="City"
//               value={data.city}
//               onChange={(v) => setData((p) => ({ ...p, city: v }))}
//             />
//             <FieldInput
//               placeholder="Postal code"
//               value={data.postalCode}
//               onChange={(v) => setData((p) => ({ ...p, postalCode: v }))}
//             />
//           </div>
//           <FieldInput
//             placeholder="Twitter / X handle"
//             value={data.twitter}
//             onChange={(v) => setData((p) => ({ ...p, twitter: v }))}
//           />
//         </div>
//       </div>

//       {/* ── Education ── */}
//       <div>
//         <SectionLabel title="Education" />
//         {data.educations.map((edu) => (
//           <div
//             key={edu.id}
//             className="flex flex-col gap-3 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-3"
//           >
//             <div className="grid grid-cols-2 gap-3">
//               <FieldInput
//                 placeholder="School"
//                 value={edu.school}
//                 onChange={(v) => updateEducation(edu.id, { ...edu, school: v })}
//               />
//               <FieldInput
//                 placeholder="Field of study"
//                 value={edu.field}
//                 onChange={(v) => updateEducation(edu.id, { ...edu, field: v })}
//               />
//             </div>
//             <FieldInput
//               placeholder="Degree"
//               value={edu.degree}
//               onChange={(v) => updateEducation(edu.id, { ...edu, degree: v })}
//             />
//             <div className="flex items-center gap-4">
//               <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
//                 Completed:
//               </span>
//               {["Yes", "No"].map((opt) => (
//                 <label
//                   key={opt}
//                   className="flex items-center gap-1.5 cursor-pointer"
//                 >
//                   <input
//                     type="radio"
//                     name={`comp-${edu.id}`}
//                     checked={edu.completed === opt.toLowerCase()}
//                     onChange={() =>
//                       updateEducation(edu.id, {
//                         ...edu,
//                         completed: opt.toLowerCase() as "yes" | "no",
//                       })
//                     }
//                     className="accent-blue-700 w-3.5 h-3.5"
//                   />
//                   <span className="text-xs text-gray-600 dark:text-gray-300">
//                     {opt}
//                   </span>
//                 </label>
//               ))}
//               {data.educations.length > 1 && (
//                 <button
//                   onClick={() => removeEducation(edu.id)}
//                   className="ml-auto text-[10px] text-red-500 hover:text-red-600 font-semibold"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//         <AddBtn onClick={addEducation} label="Add education" />
//       </div>

//       {/* ── Employment ── */}
//       <div>
//         <SectionLabel title="Employment History" />
//         {data.employments.map((emp) => (
//           <div
//             key={emp.id}
//             className="flex flex-col gap-3 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 mb-3"
//           >
//             <div className="grid grid-cols-2 gap-3">
//               <FieldInput
//                 placeholder="Employer"
//                 value={emp.employer}
//                 onChange={(v) =>
//                   updateEmployment(emp.id, { ...emp, employer: v })
//                 }
//               />
//               <FieldInput
//                 placeholder="Job title"
//                 value={emp.jobTitle}
//                 onChange={(v) =>
//                   updateEmployment(emp.id, { ...emp, jobTitle: v })
//                 }
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
//                 Current employee
//               </span>
//               <button
//                 onClick={() =>
//                   updateEmployment(emp.id, {
//                     ...emp,
//                     isCurrent: !emp.isCurrent,
//                   })
//                 }
//                 className={`relative w-8 h-4 rounded-full transition-colors ${emp.isCurrent ? "bg-blue-700" : "bg-gray-200 dark:bg-gray-600"}`}
//               >
//                 <div
//                   className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${emp.isCurrent ? "translate-x-4" : "translate-x-0.5"}`}
//                 />
//               </button>
//               <span className="text-[11px] text-gray-500">
//                 {emp.isCurrent ? "Yes" : "No"}
//               </span>
//             </div>
//             <div>
//               <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5 block">
//                 Start date
//               </label>
//               <div className="grid grid-cols-2 gap-3">
//                 <FieldSelect
//                   options={MONTHS}
//                   placeholder="Month"
//                   value={emp.startMonth}
//                   onChange={(v) =>
//                     updateEmployment(emp.id, { ...emp, startMonth: v })
//                   }
//                 />
//                 <FieldSelect
//                   options={YEARS}
//                   placeholder="Year"
//                   value={emp.startYear}
//                   onChange={(v) =>
//                     updateEmployment(emp.id, { ...emp, startYear: v })
//                   }
//                 />
//               </div>
//             </div>
//             {!emp.isCurrent && (
//               <div>
//                 <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5 block">
//                   End date
//                 </label>
//                 <div className="grid grid-cols-2 gap-3">
//                   <FieldSelect
//                     options={MONTHS}
//                     placeholder="Month"
//                     value={emp.endMonth}
//                     onChange={(v) =>
//                       updateEmployment(emp.id, { ...emp, endMonth: v })
//                     }
//                   />
//                   <FieldSelect
//                     options={YEARS}
//                     placeholder="Year"
//                     value={emp.endYear}
//                     onChange={(v) =>
//                       updateEmployment(emp.id, { ...emp, endYear: v })
//                     }
//                   />
//                 </div>
//               </div>
//             )}
//             <div>
//               <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5 block">
//                 Job description
//               </label>
//               <textarea
//                 placeholder="Describe your role..."
//                 value={emp.description}
//                 onChange={(e) =>
//                   updateEmployment(emp.id, {
//                     ...emp,
//                     description: e.target.value,
//                   })
//                 }
//                 rows={3}
//                 className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-700 transition-colors resize-none"
//               />
//             </div>
//             {data.employments.length > 1 && (
//               <button
//                 onClick={() => removeEmployment(emp.id)}
//                 className="text-[10px] text-red-500 hover:text-red-600 font-semibold self-start"
//               >
//                 Remove employment
//               </button>
//             )}
//           </div>
//         ))}
//         <AddBtn onClick={addEmployment} label="Add employment" />
//       </div>

//       {/* ── Skills ── */}
//       <div>
//         <SectionLabel title="Skills" />
//         <FieldInput
//           placeholder="Search skills..."
//           value=""
//           onChange={() => {}}
//         />
//         <div className="mt-3 flex flex-wrap gap-2">
//           {ALL_SKILLS.map((skill, i) => (
//             <label key={i} className="flex items-center gap-1.5 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={data.selectedSkills.includes(`${skill}-${i}`)}
//                 onChange={() => toggleSkill(`${skill}-${i}`)}
//                 className="accent-blue-700 w-3 h-3"
//               />
//               <span className="text-[11px] text-gray-600 dark:text-gray-300">
//                 {skill}
//               </span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* ── Languages ── */}
//       <div>
//         <SectionLabel title="Languages" />
//         {data.languages.map((lang) => (
//           <div key={lang.id} className="grid grid-cols-2 gap-3 mb-3">
//             <FieldInput
//               placeholder="Language"
//               value={lang.language}
//               onChange={(v) =>
//                 setData((p) => ({
//                   ...p,
//                   languages: p.languages.map((l) =>
//                     l.id === lang.id ? { ...l, language: v } : l,
//                   ),
//                 }))
//               }
//             />
//             <FieldSelect
//               options={PROFICIENCY_LEVELS}
//               placeholder="Proficiency"
//               value={lang.proficiency}
//               onChange={(v) =>
//                 setData((p) => ({
//                   ...p,
//                   languages: p.languages.map((l) =>
//                     l.id === lang.id ? { ...l, proficiency: v } : l,
//                   ),
//                 }))
//               }
//             />
//           </div>
//         ))}
//         <div className="flex items-center gap-4 mt-1">
//           {["First language", "Other language"].map((opt) => (
//             <label
//               key={opt}
//               className="flex items-center gap-1.5 cursor-pointer"
//             >
//               <input
//                 type="radio"
//                 name="langType"
//                 className="accent-blue-700 w-3.5 h-3.5"
//               />
//               <span className="text-[11px] text-gray-600 dark:text-gray-300">
//                 {opt}
//               </span>
//             </label>
//           ))}
//           <AddBtn onClick={addLanguage} label="Add language" />
//         </div>
//       </div>

//       {/* ── Additional Files ── */}
//       <div>
//         <SectionLabel title="Additional Files" />
//         <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
//           Add a cover letter, a work app, licenses you'd like to link, letters
//           of recommendation and other documents.
//         </p>
//         {data.additionalFiles.length > 0 && (
//           <div className="flex flex-col gap-2 mb-3">
//             {data.additionalFiles.map((file, i) => (
//               <div
//                 key={i}
//                 className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2"
//               >
//                 <div className="flex items-center gap-2">
//                   <svg
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#1d4ed8"
//                     strokeWidth="2"
//                   >
//                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                     <polyline points="14 2 14 8 20 8" />
//                   </svg>
//                   <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
//                     {file.name}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() =>
//                     setData((p) => ({
//                       ...p,
//                       additionalFiles: p.additionalFiles.filter(
//                         (_, j) => j !== i,
//                       ),
//                     }))
//                   }
//                   className="text-gray-400 hover:text-red-500 transition-colors"
//                 >
//                   <svg
//                     width="12"
//                     height="12"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2.5"
//                   >
//                     <line x1="18" y1="6" x2="6" y2="18" />
//                     <line x1="6" y1="6" x2="18" y2="18" />
//                   </svg>
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//         <button
//           onClick={() =>
//             document.getElementById("additionalFileInput")?.click()
//           }
//           className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
//         >
//           <svg
//             width="14"
//             height="14"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//             <polyline points="14 2 14 8 20 8" />
//             <line x1="12" y1="18" x2="12" y2="12" />
//             <line x1="9" y1="15" x2="15" y2="15" />
//           </svg>
//           Upload file
//         </button>
//         <input
//           id="additionalFileInput"
//           type="file"
//           multiple
//           className="hidden"
//           onChange={(e) => {
//             const files = Array.from(e.target.files || []);
//             setData((p) => ({
//               ...p,
//               additionalFiles: [...p.additionalFiles, ...files],
//             }));
//           }}
//         />
//       </div>
//     </div>
//   );
// }
