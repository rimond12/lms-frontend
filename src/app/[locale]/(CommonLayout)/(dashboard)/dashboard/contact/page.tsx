"use client";
import { useState } from "react";
import {
  useGetAllContactsAdminQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "@/app/redux/api/contactApi";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { ContactItem, CreateContactRequest } from "@/types/contact";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Clock,
  Upload,
  X,
} from "lucide-react";

// Available Lucide icons for contact/social items
const availableIcons = [
  { name: "Mail", component: Mail, label: "Email" },
  { name: "Phone", component: Phone, label: "Phone" },
  { name: "MessageCircle", component: MessageCircle, label: "WhatsApp" },
  { name: "Facebook", component: Facebook, label: "Facebook" },
  { name: "Instagram", component: Instagram, label: "Instagram" },
  { name: "Twitter", component: Twitter, label: "Twitter" },
  { name: "MapPin", component: MapPin, label: "Location" },
  { name: "Clock", component: Clock, label: "Business Hours" },
];

export default function ContactManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(
    null,
  );
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string>("");
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  const {
    data: contactsData,
    isLoading,
    refetch,
  } = useGetAllContactsAdminQuery({});
  const [createContact] = useCreateContactMutation();
  const [updateContact] = useUpdateContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  const contacts = contactsData?.data || [];

  // Separate contacts and social data
  const contactItems = contacts.filter(
    (c: ContactItem) => c.category === "contact",
  );
  const socialItems = contacts.filter(
    (c: ContactItem) => c.category === "social",
  );

  const [formData, setFormData] = useState<CreateContactRequest>({
    id: "",
    icon: "",
    iconColor: "#6CC062",
    bgColor: "#6CC062",
    title: "",
    content: "",
    href: "",
    isLink: false,
    isExternal: false,
    isMultiline: false,
    category: "contact",
    order: 0,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      id: "",
      icon: "",
      iconColor: "#6CC062",
      bgColor: "#6CC062",
      title: "",
      content: "",
      href: "",
      isLink: false,
      isExternal: false,
      isMultiline: false,
      category: "contact",
      order: 0,
      isActive: true,
    });
    setSelectedIcon("");
    setUploadedIconUrl("");
  };

  const handleIconUpload = async (file: File) => {
    setIsUploadingIcon(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const BACKEND_API =
        process.env.NEXT_PUBLIC_API_URL || "https://api.caddcore.cloud/api";

      const res = await fetch(`${BACKEND_API}/courses/upload-image`, {
        method: "POST",
        body: formDataUpload,
      });

      const result = await res.json();
      if (res.ok && (result?.data?.url || result?.data?.imageUrl)) {
        // Construct full URL for the uploaded image
        const uploadedUrl = result.data.url || result.data.imageUrl;
        const fullUrl = uploadedUrl.startsWith("http")
          ? uploadedUrl
          : `${BACKEND_API.replace("/api", "")}${uploadedUrl}`;
        setUploadedIconUrl(fullUrl);
        setFormData((prev) => ({ ...prev, icon: uploadedUrl }));
        toast.success("Icon uploaded successfully!");
      } else {
        toast.error(
          `Icon upload failed: ${result?.message || "Unknown error"}`,
        );
      }
    } catch {
      toast.error("Icon upload failed.");
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setFormData((prev) => ({ ...prev, icon: iconName }));
    setUploadedIconUrl(""); // Clear uploaded icon when selecting predefined icon
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.icon) {
      toast.error("Please select or upload an icon");
      return;
    }

    try {
      if (editingContact) {
        await updateContact({
          id: editingContact._id,
          contactData: formData,
        }).unwrap();
        toast.success("Contact item updated successfully!");
        setIsEditDialogOpen(false);
      } else {
        await createContact(formData).unwrap();
        toast.success("Contact item created successfully!");
        setIsCreateDialogOpen(false);
      }
      resetForm();
      refetch();
    } catch (error) {
      toast.error((error as Error)?.message || "Operation failed");
    }
  };

  const handleEdit = (contact: ContactItem) => {
    setEditingContact(contact);
    setFormData({
      id: contact.id,
      icon: contact.icon,
      iconColor: contact.iconColor,
      bgColor: contact.bgColor,
      title: contact.title,
      content: contact.content,
      href: contact.href || "",
      isLink: contact.isLink || false,
      isExternal: contact.isExternal || false,
      isMultiline: contact.isMultiline || false,
      category: contact.category,
      order: contact.order,
      isActive: contact.isActive,
    });

    // Check if icon is a URL (uploaded) or icon name (predefined)
    if (contact.icon.startsWith("http")) {
      setUploadedIconUrl(contact.icon);
      setSelectedIcon("");
    } else {
      setSelectedIcon(contact.icon);
      setUploadedIconUrl("");
    }

    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact item?")) {
      try {
        await deleteContact(id).unwrap();
        toast.success("Contact item deleted successfully!");
        refetch();
      } catch (error) {
        toast.error((error as Error)?.message || "Delete failed");
      }
    }
  };

  const renderIcon = (iconName: string, className: string = "") => {
    const iconData = availableIcons.find((icon) => icon.name === iconName);
    if (iconData) {
      const IconComponent = iconData.component;
      return <IconComponent className={className} />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6CC062]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Contact Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage contact information and social media links displayed on your
            website
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="bg-[#6CC062] hover:bg-[#5AB052] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact Item
        </Button>
      </div>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactItems.map((contact: ContactItem) => (
              <div
                key={contact._id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`p-2 rounded-lg ${contact.bgColor.replace(
                    "bg-",
                    "bg-",
                  )}/20`}
                >
                  {contact.icon.startsWith("http") ? (
                    <Image
                      src={contact.icon}
                      alt={contact.title}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  ) : (
                    renderIcon(
                      contact.icon,
                      `w-6 h-6 ${contact.iconColor.replace("text-", "text-")}`,
                    )
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{contact.title}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.content}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contact._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialItems.map((contact: ContactItem) => (
              <div
                key={contact._id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`p-2 rounded-lg ${contact.bgColor.replace(
                    "bg-",
                    "bg-",
                  )}/20`}
                >
                  {contact.icon.startsWith("http") ? (
                    <Image
                      src={contact.icon}
                      alt={contact.title}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  ) : (
                    renderIcon(
                      contact.icon,
                      `w-6 h-6 ${contact.iconColor.replace("text-", "text-")}`,
                    )
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{contact.title}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.content}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contact._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingContact(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Contact Item" : "Add New Contact Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, id: e.target.value }))
                  }
                  placeholder="unique-id"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as "contact" | "social",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact">Contact Information</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Icon</Label>
              <div className="space-y-4">
                {/* Predefined Icons */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Choose from predefined icons:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {availableIcons.map((icon) => {
                      const IconComponent = icon.component;
                      return (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => handleIconSelect(icon.name)}
                          className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedIcon === icon.name
                              ? "border-[#6CC062] bg-[#6CC062]/10"
                              : ""
                          }`}
                        >
                          <IconComponent className="w-6 h-6 mx-auto" />
                          <p className="text-xs mt-1">{icon.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Custom Icon */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Or upload a custom icon:
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleIconUpload(file);
                        }
                      }}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingIcon ? "Uploading..." : "Upload Icon"}
                    </label>
                    {uploadedIconUrl && (
                      <div className="flex items-center gap-2">
                        <Image
                          src={uploadedIconUrl}
                          alt="Uploaded icon"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedIconUrl("");
                            setFormData((prev) => ({ ...prev, icon: "" }));
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iconColor">Icon Color</Label>
                <Input
                  id="iconColor"
                  type="color"
                  value={formData.iconColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      iconColor: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="bgColor">Background Color</Label>
                <Input
                  id="bgColor"
                  type="color"
                  value={formData.bgColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bgColor: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Email, Facebook, Phone"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="e.g., cadcorelms@gmail.com"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="href">Link URL (optional)</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, href: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isLink"
                  checked={formData.isLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isLink: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isLink">Is Link</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isExternal"
                  checked={formData.isExternal}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isExternal: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isExternal">External Link</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMultiline"
                  checked={formData.isMultiline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isMultiline: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isMultiline">Multiline Content</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#6CC062] hover:bg-[#5AB052] text-white"
              >
                {editingContact ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
