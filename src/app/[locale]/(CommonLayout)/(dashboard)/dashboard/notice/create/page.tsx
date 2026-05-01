"use client";

import React, { useState } from "react";
import {
  useCreateNoticeMutation,
  useGetRecipientsPreviewMutation,
} from "@/app/redux/api/noticeApi";
import { useGetAllBatchesQuery } from "@/app/redux/api/batchApi/batchApi";
import { useGetAllUsersQuery } from "@/app/redux/api/users/userApi";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Loader2,
  X,
  ArrowLeft,
  Search,
  Check,
  Users,
  BookOpen,
  User,
  Send,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import RichTextEditor from "@/components/shared/RichTextEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RECIPIENT_TYPES = [
  {
    value: "ALL_USERS",
    label: "All Users",
    icon: Users,
    description: "Send to everyone",
  },
  {
    value: "BATCH",
    label: "Batches",
    icon: BookOpen,
    description: "Specific batches",
  },
  {
    value: "INDIVIDUAL",
    label: "Individuals",
    icon: User,
    description: "Specific users",
  },
];

export default function CreateNoticePage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    recipientType: "ALL_USERS",
    sendEmail: false,
    image: "",
  });

  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipientsPreview, setRecipientsPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
  const [getRecipientsPreview, { isLoading: isLoadingPreview }] =
    useGetRecipientsPreviewMutation();

  const { data: batchesData, isLoading: isLoadingBatches } =
    useGetAllBatchesQuery({ status: "running" });
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery(
    {},
  );

  const allBatches = batchesData?.data || [];
  const allUsers = usersData?.data || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecipientTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, recipientType: value }));
    setShowPreview(false);
  };

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId],
    );
    setShowPreview(false);
  };

  const handleUserToggle = (user: any) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u._id === user._id);
      return exists
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, { _id: user._id, name: user.name, email: user.email }];
    });
    setShowPreview(false);
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
    setShowPreview(false);
  };

  const onEmailCheckedChange = (checked: boolean | "indeterminate") => {
    setFormData((prev) => ({ ...prev, sendEmail: checked === true }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setImagePreview(base64String);
      setFormData((prev) => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handlePreviewRecipients = async () => {
    let payload: any = { recipientType: formData.recipientType };

    if (formData.recipientType === "BATCH") {
      payload.targetBatches = selectedBatches;
    } else if (formData.recipientType === "INDIVIDUAL") {
      payload.recipientUsers = selectedUsers.map((u) => ({
        userId: u._id,
        email: u.email,
        name: u.name,
      }));
    }

    try {
      const result = (await getRecipientsPreview(payload).unwrap()) as any;
      const previewData =
        result?.data?.preview || result?.data?.recipients || result?.data || [];
      const totalCount = result?.data?.total || previewData?.length || 0;

      setRecipientsPreview(previewData);
      setShowPreview(true);

      if (totalCount === 0) {
        toast.error("No recipients found");
      } else {
        toast.success(`Found ${totalCount} recipient(s)`);
      }
    } catch (error: any) {
      toast.error("Failed to fetch recipients preview");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");
    if (!formData.content.trim()) return toast.error("Content is required");

    try {
      await createNotice({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        recipientType: formData.recipientType,
        targetBatches:
          formData.recipientType === "BATCH" ? selectedBatches : undefined,
        recipientUsers:
          formData.recipientType === "INDIVIDUAL"
            ? selectedUsers.map((u) => ({
                userId: u._id,
                email: u.email,
                name: u.name,
              }))
            : undefined,
        sendEmail: formData.sendEmail,
        image: formData.image || undefined,
      }).unwrap();

      toast.success("Notice created successfully!");
      router.push("/dashboard/notice");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create notice");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/notice">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                New Announcement
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 h-8 px-4 text-xs font-medium rounded-md"
            >
              {isCreating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3" /> Publish
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-8 space-y-4">
            {/* Core Details */}
            <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden bg-white">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="title"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Exam Schedule"
                      className="h-9 text-sm border-gray-200 focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="description"
                      className="text-xs font-semibold text-gray-700"
                    >
                      Summary{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief preview text"
                      className="h-9 text-sm border-gray-200 focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-700">
                    Content <span className="text-red-500">*</span>
                  </Label>
                  <div className="min-h-[280px] rounded-md border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-blue-500/20">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, content: value }))
                      }
                      placeholder="Write your announcement..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Section */}
            <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden bg-white">
              <CardHeader className="px-4 py-3 border-b border-gray-50 bg-gray-50/30 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Target Audience
                </CardTitle>
                <div className="flex bg-gray-100/80 p-0.5 rounded-lg">
                  {RECIPIENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = formData.recipientType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleRecipientTypeChange(type.value)}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                          ${
                            isActive
                              ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                          }
                        `}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {formData.recipientType === "BATCH" && (
                  <div className="p-4 bg-gray-50/50">
                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        placeholder="Search batches..."
                        value={batchSearchTerm}
                        onChange={(e) => setBatchSearchTerm(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white border-gray-200"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 scrollbar-thin scrollbar-thumb-gray-200 p-1">
                      {allBatches
                        .filter((b: any) =>
                          b.batchName
                            .toLowerCase()
                            .includes(batchSearchTerm.toLowerCase()),
                        )
                        .map((batch: any) => {
                          const isSelected = selectedBatches.includes(
                            batch._id,
                          );
                          return (
                            <div
                              key={batch._id}
                              onClick={() => handleBatchToggle(batch._id)}
                              className={`
                                flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all
                                ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : "bg-white border-gray-100 hover:border-blue-100 text-gray-600"
                                }
                              `}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-2.5 h-2.5" />
                                )}
                              </div>
                              <span className="text-xs font-medium truncate">
                                {batch.batchName}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {formData.recipientType === "INDIVIDUAL" && (
                  <div className="p-4 bg-gray-50/50 space-y-3">
                    <div className="relative z-20">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        placeholder="Find users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white border-gray-200"
                      />
                      {userSearchTerm.length > 1 && (
                        <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg border-gray-100 z-50 max-h-48 overflow-y-auto">
                          {isLoadingUsers ? (
                            <div className="p-2 text-center text-xs">
                              Loading...
                            </div>
                          ) : (
                            allUsers
                              .filter(
                                (u: any) =>
                                  u.name
                                    .toLowerCase()
                                    .includes(userSearchTerm.toLowerCase()) ||
                                  u.email
                                    .toLowerCase()
                                    .includes(userSearchTerm.toLowerCase()),
                              )
                              .slice(0, 5)
                              .map((user: any) => (
                                <button
                                  key={user._id}
                                  onClick={() => {
                                    handleUserToggle(user);
                                    setUserSearchTerm("");
                                  }}
                                  disabled={selectedUsers.some(
                                    (u) => u._id === user._id,
                                  )}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex justify-between items-center disabled:opacity-50"
                                >
                                  <div>
                                    <div className="font-medium text-gray-800">
                                      {user.name}
                                    </div>
                                    <div className="text-gray-500">
                                      {user.email}
                                    </div>
                                  </div>
                                  {selectedUsers.some(
                                    (u) => u._id === user._id,
                                  ) && (
                                    <Check className="w-3 h-3 text-green-500" />
                                  )}
                                </button>
                              ))
                          )}
                        </Card>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUsers.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full pl-2 pr-1 py-0.5 shadow-sm"
                          >
                            <span className="text-[10px] font-medium text-gray-700 max-w-[80px] truncate">
                              {user.name}
                            </span>
                            <button
                              onClick={() => removeSelectedUser(user._id)}
                              className="w-4 h-4 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border border-gray-100 shadow-sm rounded-lg overflow-hidden bg-white">
              <CardHeader className="px-4 py-3 border-b border-gray-50 bg-gray-50/30">
                <CardTitle className="text-sm font-semibold text-gray-800">
                  Settings & Media
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Email Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-blue-50/20">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onCheckedChange={onEmailCheckedChange}
                      className="h-4 w-4 data-[state=checked]:bg-blue-600"
                    />
                    <Label
                      htmlFor="sendEmail"
                      className="text-xs font-medium text-gray-700 cursor-pointer"
                    >
                      Send Email Notification
                    </Label>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-gray-400 cursor-help">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Recipients get an email copy
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-gray-700">
                      Cover Image
                    </Label>
                    {imagePreview && (
                      <button
                        onClick={handleRemoveImage}
                        className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>

                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 h-32 group">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-500">
                        Upload Image (Max 5MB)
                      </span>
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>

                {/* Preview Button & Area */}
                <div className="pt-2 border-t border-gray-50 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 bg-gray-50"
                    onClick={handlePreviewRecipients}
                    disabled={isLoadingPreview}
                  >
                    {isLoadingPreview ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1.5" /> CHECK AUDIENCE
                      </>
                    )}
                  </Button>

                  {showPreview && (
                    <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs animation-in fade-in slide-in-from-top-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-blue-900">
                          Recipients
                        </span>
                        <Badge className="h-4 px-1 text-[9px] bg-blue-600">
                          {recipientsPreview.length}
                        </Badge>
                      </div>
                      {recipientsPreview.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {recipientsPreview
                            .slice(0, 10)
                            .map((r: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded-sm bg-white text-blue-700 border border-blue-100 text-[9px] truncate max-w-[80px]"
                              >
                                {r.name}
                              </span>
                            ))}
                          {recipientsPreview.length > 10 && (
                            <span className="text-[9px] text-blue-500 pl-1">
                              +{recipientsPreview.length - 10} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-amber-600 text-[10px]">
                          No recipients found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
