// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { 
//   ArrowLeft, 
//   Save, 
//   Plus, 
//   Trash2, 
//   X, 
//   Upload, 
//   Eye,
//   EyeOff,
//   FileText,
//   Users,
//   Clock,
//   BookOpen,
//   AlertCircle
// } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { toast } from "react-hot-toast";
// import {
//   useCreateProgramMutation,
//   useUpdateProgramMutation,
//   useGetProgramByIdQuery,
// } from "@/app/redux/api/ProgramApi/ProgramApi";
// import { IProgram, ICreateProgramRequest, IUpdateProgramRequest } from "@/types/program";
// import { useImageUpload } from "@/hooks";
// import ProgramCurriculumSection from "./ProgramCurriculumSection";
// import ProgramMaterialsSection from "./ProgramMaterialsSection";
// import ProgramExpertsSection from "./ProgramExpertsSection";
// import ProgramCertificateSection from "./ProgramCertificateSection";

// interface CreateEditProgramFormProps {
//   courseId?: string;
// }

// export default function CreateEditProgramForm({
//   courseId,
// }: CreateEditProgramFormProps) {
//   const router = useRouter();
//   const [createProgram] = useCreateProgramMutation();
//   const [updateProgram] = useUpdateProgramMutation();
//   const { data: existingProgram, isLoading: isLoadingProgram } =
//     useGetProgramByIdQuery(courseId || "", {
//       skip: !courseId,
//     });

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<ICreateProgramRequest>({
//     defaultValues: {
//       title: "",
//       slug: "",
//       type: "course",
//       description: "",
//       shortDescription: "",
//       level: "beginner",
//       accessType: "free",
//       capacity: 100,
//       tags: [],
//       duration: "",
//       currency: "BDT",
//       bannerImage: "",
//       startDate: "",
//       endDate: "",
//       isProtected: false,
//       metaDescription: "",
//       metaKeywords: [],
//       price: 0,
//       discountedPrice: 0,
//       accessControl: {
//         accessType: "all-access",
//         accessScope: "all-users",
//       },
//       sponsorTitle: "",
//       sponsorPhotoUrl: "",
//       venueName: "",
//       locations: "",
//     },
//   });

//   // ============================================
//   // STATE MANAGEMENT
//   // ============================================

//   const [tags, setTags] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState("");
//   const [metaKeywordInput, setMetaKeywordInput] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [bannerImage, setBannerImage] = useState<string>("");
//   const [programPhoto, setProgramPhoto] = useState<string>("");
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [locations, setLocations] = useState<string>("");

//   // Image upload hook for banner
//   const banner = useImageUpload({
//     preset: 'BANNER',
//     onSuccess: (imageUrl) => {
//       setBannerImage(imageUrl);
//       toast.success("Banner image uploaded successfully!");
//     },
//     onError: (err) => {
//       toast.error(`Upload failed: ${err.message}`);
//     }
//   });

//   // Image upload hook for program photo
//   const programPhotoUpload = useImageUpload({
//     preset: 'THUMBNAIL',
//     onSuccess: (imageUrl) => {
//       setProgramPhoto(imageUrl);
//       toast.success("Program photo uploaded successfully!");
//     },
//     onError: (err) => {
//       toast.error(`Upload failed: ${err.message}`);
//     }
//   });

//   // ============================================
//   // EFFECTS
//   // ============================================

//   useEffect(() => {
//     if (existingProgram && courseId) {
//       const program = existingProgram;
//       reset({
//         title: program.title,
//         slug: program.slug,
//         type: program.type as any,
//         description: program.description,
//         shortDescription: program.shortDescription,
//         level: program.level,
//         accessType: program.accessType as any,
//         price: program.price,
//         discountedPrice: program.discountedPrice,
//         capacity: program.capacity,
//         tags: program.tags,
//         duration: program.duration,
//         currency: program.currency || "BDT",
//         startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : "",
//         endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : "",
//         isProtected: program.isProtected || false,
//         metaDescription: program.metaDescription,
//         metaKeywords: program.metaKeywords,
//         accessControl: program.accessControl,
//         sponsorTitle: program.sponsorTitle,
//         sponsorPhotoUrl: program.sponsorPhotoUrl,
//         venueName: program.venueName,
//         locations: program.locations,
//       });
//       setTags(program.tags || []);
//       setBannerImage(program.bannerImage || "");
//       setProgramPhoto(program.photoUrl || "");
//       setLocations(program.locations || "");
//     }
//   }, [existingProgram, courseId, reset]);

//   // ============================================
//   // FORM HANDLERS
//   // ============================================

//   const onSubmit = async (data: ICreateProgramRequest) => {
//     // Validate required fields
//     if (!data.title?.trim()) {
//       toast.error("Program title is required");
//       return;
//     }
//     if (!data.description?.trim()) {
//       toast.error("Program description is required");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const formData = {
//         ...data,
//         tags: tags,
//         metaKeywords: watch("metaKeywords") || [],
//         bannerImage: bannerImage || data.bannerImage,
//         photoUrl: programPhoto || "",
//         slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
//       };

//       if (courseId) {
//         await updateProgram({
//           id: courseId,
//           ...formData,
//         }).unwrap();
//         toast.success("Program updated successfully!");
//       } else {
//         await createProgram(formData).unwrap();
//         toast.success("Program created successfully!");
//       }

//       setTimeout(() => {
//         router.push("/dashboard/manage-courses");
//       }, 1500);
//     } catch (error: any) {
//       toast.error(error?.data?.message || "Failed to save program");
//       console.error("Form submission error:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Tag management
//   const addTag = () => {
//     if (tagInput.trim() && !tags.includes(tagInput.trim())) {
//       setTags([...tags, tagInput.trim()]);
//       setTagInput("");
//     }
//   };

//   const removeTag = (tag: string) => {
//     setTags(tags.filter((t) => t !== tag));
//   };

//   // Meta keyword management
//   const addMetaKeyword = () => {
//     const keywords = watch("metaKeywords") || [];
//     if (metaKeywordInput.trim() && !keywords.includes(metaKeywordInput.trim())) {
//       const updatedKeywords = [...keywords, metaKeywordInput.trim()];
//       setValue("metaKeywords", updatedKeywords);
//       setMetaKeywordInput("");
//     }
//   };

//   // Banner image handlers
//   const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) await banner.uploadImage(file);
//   };

//   const handleDeleteBanner = () => {
//     banner.reset();
//     setBannerImage("");
//   };

//   const title = watch("title");
//   const accessType = watch("accessType");

//   if (isLoadingProgram && courseId) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="max-w-6xl mx-auto">
//           <div className="animate-pulse space-y-4">
//             <div className="h-8 bg-gray-200 rounded w-1/3"></div>
//             <div className="bg-white rounded-lg p-6 space-y-4">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} className="h-12 bg-gray-200 rounded"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <Link href="/dashboard/manage-courses">
//             <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium">
//               <ArrowLeft size={16} />
//               Back 
//             </button>
//           </Link>

//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {courseId ? "Edit " : "Create New "}
//           </h1>
//           <p className="text-gray-600">
//             {courseId
//               ? "Update program details, media, and curriculum"
//               : "Create a new training program, seminar, course, or webinar"}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* ============================================ */}
//           {/* SECTION 1: BASIC INFORMATION */}
//           {/* ============================================ */}
//           <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <FileText size={20} className="text-blue-600" />
//               <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Title */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                    Title <span className="text-red-800">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   {...register("title", {
//                     required: "Title is required",
//                     minLength: {
//                       value: 3,
//                       message: "Title must be at least 3 characters",
//                     },
//                   })}
//                   placeholder="e.g., Advanced TypeScript Mastery"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//                 {errors.title && (
//                   <p className="text-red-800 text-xs mt-1">{errors.title.message}</p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
//               </div>

//               {/* Description */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Description <span className="text-red-800">*</span>
//                 </label>
//                 <textarea
//                   {...register("description", {
//                     required: "Description is required",
//                     minLength: {
//                       value: 10,
//                       message: "Description must be at least 10 characters",
//                     },
//                   })}
//                   placeholder="Detailed program description..."
//                   rows={4}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
//                 />
//                 {errors.description && (
//                   <p className="text-red-800 text-xs mt-1">{errors.description.message}</p>
//                 )}
//               </div>

//               {/* Short Description */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Short Description
//                 </label>
//                 <input
//                   type="text"
//                   {...register("shortDescription")}
//                   placeholder="Brief 1-2 sentence summary (max 150 characters)"
//                   maxLength={150}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>

//               {/* Type */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Program Type <span className="text-red-800">*</span>
//                 </label>
//                 <select
//                   {...register("type", { required: "Type is required" })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 >
//                   <option value="course">Course</option>
//                   <option value="training">Training</option>
//                   <option value="seminar">Seminar</option>
//                   <option value="webinar">Webinar</option>
//                   <option value="workshop">Workshop</option>
//                 </select>
//               </div>

//               {/* Level */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Level <span className="text-red-800">*</span>
//                 </label>
//                 <select
//                   {...register("level", { required: "Level is required" })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 >
//                   <option value="beginner">Beginner</option>
//                   <option value="intermediate">Intermediate</option>
//                   <option value="advanced">Advanced</option>
//                   <option value="all-levels">All Levels</option>
//                 </select>
//               </div>

//               {/* Access Type */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Access Type <span className="text-red-800">*</span>
//                 </label>
//                 <select
//                   {...register("accessType", { required: "Access type is required" })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 >
//                   <option value="free">Free</option>
//                   <option value="paid">Paid</option>
//                   <option value="invite-only">Invite Only</option>
//                   <option value="members-only">Members Only</option>
//                 </select>
//               </div>

//               {/* Sponsor Title */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Sponsor Title
//                 </label>
//                 <input
//                   type="text"
//                   {...register("sponsorTitle")}
//                   placeholder="e.g., TechCorp"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>

//               {/* Sponsor Photo URL */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Sponsor Photo URL
//                 </label>
//                 <input
//                   type="url"
//                   {...register("sponsorPhotoUrl")}
//                   placeholder="https://example.com/sponsor-logo.png"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>

//               {/* Venue Name */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Venue Name
//                 </label>
//                 <input
//                   type="text"
//                   {...register("venueName")}
//                   placeholder="e.g., Conference Hall A"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>

//               {/* Locations */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Locations
//                 </label>
//                 <input
//                   type="text"
//                   {...register("locations")}
//                   placeholder="e.g., Dhaka, Bangladesh"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ============================================ */}
//           {/* SECTION 2: MEDIA & DATES */}
//           {/* ============================================ */}
//           <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <Upload size={20} className="text-blue-600" />
//               <h2 className="text-xl font-bold text-gray-900">Media & Schedule</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Banner Image */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Banner Image
//                 </label>

//                 {banner.error && (
//                   <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg">
//                     <p className="text-sm text-red-800">
//                       <span className="font-medium">⚠️ Error:</span> {banner.error}
//                     </p>
//                   </div>
//                 )}

//                 {(banner.preview || bannerImage) && (
//                   <div className="mb-3 relative rounded-lg overflow-hidden border-2 border-blue-300 bg-blue-50 max-w-xs">
//                     <img
//                       src={banner.preview || bannerImage}
//                       alt="Banner preview"
//                       className="w-full h-40 object-cover"
//                     />
//                     {banner.fileName && (
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
//                         <p className="truncate">{banner.fileName}</p>
//                         {banner.fileSize && <p>{banner.fileSize}</p>}
//                       </div>
//                     )}
//                     <button
//                       type="button"
//                       onClick={handleDeleteBanner}
//                       className="absolute top-2 right-2 bg-red-800 text-white p-1 rounded hover:bg-red-800 transition-colors"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 )}

//                 <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all bg-blue-50">
//                   <Upload size={18} className="text-blue-600" />
//                   <span className="text-sm text-blue-600 font-medium">
//                     {banner.isUploading ? '⏳ Uploading...' : '📁 Click to upload banner'}
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleBannerImageChange}
//                     disabled={banner.isUploading}
//                     className="hidden"
//                   />
//                 </label>
//                 <p className="text-xs text-gray-500 mt-2">
//                   JPG, PNG, GIF, WebP (max 5MB) | Recommended: 1200x400px
//                 </p>
//               </div>

//               {/* Program Photo/Thumbnail */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Program Photo/Thumbnail
//                 </label>

//                 {programPhotoUpload.error && (
//                   <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg">
//                     <p className="text-sm text-red-800">
//                       <span className="font-medium">⚠️ Error:</span> {programPhotoUpload.error}
//                     </p>
//                   </div>
//                 )}

//                 {(programPhotoUpload.preview || programPhoto) && (
//                   <div className="mb-3 relative rounded-lg overflow-hidden border-2 border-blue-300 bg-blue-50 max-w-xs">
//                     <img
//                       src={programPhotoUpload.preview || programPhoto}
//                       alt="Program photo preview"
//                       className="w-full h-32 object-cover"
//                     />
//                     {programPhotoUpload.fileName && (
//                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
//                         <p className="truncate">{programPhotoUpload.fileName}</p>
//                         {programPhotoUpload.fileSize && <p>{programPhotoUpload.fileSize}</p>}
//                       </div>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         programPhotoUpload.reset();
//                         setProgramPhoto("");
//                       }}
//                       className="absolute top-2 right-2 bg-red-800 text-white p-1 rounded hover:bg-red-800 transition-colors"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 )}

//                 <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all bg-blue-50">
//                   <Upload size={18} className="text-blue-600" />
//                   <span className="text-sm text-blue-600 font-medium">
//                     {programPhotoUpload.isUploading ? '⏳ Uploading...' : '📁 Click to upload photo'}
//                   </span>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) programPhotoUpload.uploadImage(file);
//                     }}
//                     disabled={programPhotoUpload.isUploading}
//                     className="hidden"
//                   />
//                 </label>
//                 <p className="text-xs text-gray-500 mt-2">
//                   JPG, PNG, GIF, WebP (max 5MB) | Recommended: 400x300px
//                 </p>
//               </div>

//               {/* Start Date */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Start Date
//                 </label>
//                 <input
//                   type="date"
//                   {...register("startDate")}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>

//               {/* End Date */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   End Date
//                 </label>
//                 <input
//                   type="date"
//                   {...register("endDate")}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>

//               {/* Duration */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Duration (e.g., "2 weeks", "20 hours")
//                 </label>
//                 <input
//                   type="text"
//                   {...register("duration")}
//                   placeholder="e.g., 2 weeks"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ============================================ */}
//           {/* SECTION 3: PRICING & CAPACITY */}
//           {/* ============================================ */}
//           <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <Clock size={20} className="text-blue-600" />
//               <h2 className="text-xl font-bold text-gray-900">Pricing & Capacity</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Price */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Price
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     {...register("price")}
//                     placeholder="0.00"
//                     step="0.01"
//                     min="0"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   />
//                   <span className="absolute right-3 top-2 text-gray-500 text-sm">{watch("currency")}</span>
//                 </div>
//               </div>

//               {/* Discounted Price */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Discounted Price
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     {...register("discountedPrice")}
//                     placeholder="0.00"
//                     step="0.01"
//                     min="0"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   />
//                   <span className="absolute right-3 top-2 text-gray-500 text-sm">{watch("currency")}</span>
//                 </div>
//               </div>

//               {/* Currency */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Currency
//                 </label>
//                 <input
//                   type="text"
//                   {...register("currency")}
//                   placeholder="BDT"
//                   maxLength={3}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
//                 />
//               </div>

//               {/* Capacity */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Capacity (Participants) <span className="text-red-800">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   {...register("capacity", {
//                     required: "Capacity is required",
//                     min: { value: 1, message: "Must be at least 1" },
//                   })}
//                   placeholder="100"
//                   min="1"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 />
//                 {errors.capacity && (
//                   <p className="text-red-800 text-xs mt-1">{errors.capacity.message}</p>
//                 )}
//               </div>

//               {/* Password Protection */}
//               <div className="flex items-end">
//                 <label className="flex items-center gap-3 w-full">
//                   <input
//                     type="checkbox"
//                     {...register("isProtected")}
//                     className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
//                   />
//                   <span className="text-sm font-semibold text-gray-700">Password Protected</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* ============================================ */}
//           {/* SECTION 4: ACCESS CONTROL */}
//           {/* ============================================ */}
//           <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <Users size={20} className="text-blue-600" />
//               <h2 className="text-xl font-bold text-gray-900">Access Control</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* What users can access */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   What can users access? <span className="text-red-800">*</span>
//                 </label>
//                 <select
//                   {...register("accessControl.accessType", {
//                     required: "Access type is required",
//                   })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 >
//                   <option value="all-access">All Access (Materials + Quizzes)</option>
//                   <option value="materials-only">Materials Only</option>
//                   <option value="quiz-only">Quiz Only</option>
//                 </select>
//                 <p className="text-gray-600 text-xs mt-2">
//                   Determines what content users can access after enrollment
//                 </p>
//               </div>

//               {/* Who can enroll */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Who can enroll? <span className="text-red-800">*</span>
//                 </label>
//                 <select
//                   {...register("accessControl.accessScope", {
//                     required: "Access scope is required",
//                   })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 >
//                   <option value="all-users">All Users</option>
//                   <option value="members-only">Members Only</option>
//                   <option value="individual-users">Individual Users (Invitation)</option>
//                 </select>
//                 <p className="text-gray-600 text-xs mt-2">
//                   Restricts who is eligible to enroll in this program
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ============================================ */}
//           {/* SECTION 5: TAGS & SEO */}
//           {/* ============================================ */}
//           <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-6">
//               <BookOpen size={20} className="text-blue-600" />
//               <h2 className="text-xl font-bold text-gray-900">Tags & SEO</h2>
//             </div>

//             <div className="space-y-6">
//               {/* Tags */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Tags
//                 </label>
//                 <div className="flex gap-2 mb-3">
//                   <input
//                     type="text"
//                     value={tagInput}
//                     onChange={(e) => setTagInput(e.target.value)}
//                     onKeyPress={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         addTag();
//                       }
//                     }}
//                     placeholder="Add a tag and press Enter..."
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   />
//                   <button
//                     type="button"
//                     onClick={addTag}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium"
//                   >
//                     <Plus size={14} />
//                     Add
//                   </button>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   {tags.map((tag) => (
//                     <div
//                       key={tag}
//                       className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
//                     >
//                       {tag}
//                       <button
//                         type="button"
//                         onClick={() => removeTag(tag)}
//                         className="hover:text-blue-900"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Meta Description */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Meta Description (SEO)
//                 </label>
//                 <textarea
//                   {...register("metaDescription")}
//                   placeholder="Brief SEO description (55-160 characters)"
//                   rows={2}
//                   maxLength={160}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   {watch("metaDescription")?.length || 0}/160 characters
//                 </p>
//               </div>

//               {/* Meta Keywords */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Meta Keywords (SEO)
//                 </label>
//                 <div className="flex gap-2 mb-3">
//                   <input
//                     type="text"
//                     value={metaKeywordInput}
//                     onChange={(e) => setMetaKeywordInput(e.target.value)}
//                     onKeyPress={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         addMetaKeyword();
//                       }
//                     }}
//                     placeholder="Add keyword and press Enter..."
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   />
//                   <button
//                     type="button"
//                     onClick={addMetaKeyword}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium"
//                   >
//                     <Plus size={14} />
//                     Add
//                   </button>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   {(watch("metaKeywords") || []).map((keyword) => (
//                     <div
//                       key={keyword}
//                       className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
//                     >
//                       {keyword}
//                       <button
//                         type="button"
//                         className="hover:text-purple-900"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ============================================ */}
//           {/* SECTION 6: MATERIALS */}
//           {/* ============================================ */}
//           {courseId && (
//             <ProgramMaterialsSection
//               courseId={courseId}
//               materials={existingProgram?.materials || []}
//               onMaterialsChange={() => {}}
//             />
//           )}

//           {/* ============================================ */}
//           {/* SECTION 7: EXPERTS */}
//           {/* ============================================ */}
//           {courseId && (
//             <ProgramExpertsSection
//               courseId={courseId}
//               experts={existingProgram?.experts || []}
//               onExpertsChange={() => {}}
//             />
//           )}

//           {/* ============================================ */}
//           {/* SECTION 8: CURRICULUM */}
//           {/* ============================================ */}
//           {courseId && (
//             <ProgramCurriculumSection
//               courseId={courseId}
//               curriculum={existingProgram?.curriculum || []}
//               onCurriculumChange={() => {}}
//             />
//           )}

//           {/* ============================================ */}
//           {/* SECTION 9: CERTIFICATE SETTINGS */}
//           {/* ============================================ */}
//           {courseId && (
//             <ProgramCertificateSection
//               courseId={courseId}
//               certificateRule={existingProgram?.certificateRule}
//               onCertificateChange={() => {}}
//             />
//           )}

//           {/* ============================================ */}
//           {/* SUBMIT BUTTONS */}
//           {/* ============================================ */}
//           <div className="flex gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-300 rounded-b-lg shadow-lg">
//             <Link href="/dashboard/manage-courses" className="flex-1">
//               <button
//                 type="button"
//                 className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//             </Link>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={isSubmitting}
//               className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
//             >
//               <Save size={16} />
//               {isSubmitting ? "Saving..." : courseId ? "Update Program" : "Create Program"}
//             </motion.button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
