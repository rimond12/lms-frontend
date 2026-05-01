// Contact Types for Client-Side Usage

export interface ContactItem {
  _id: string;
  id: string;
  icon: string; // Icon name (e.g., "Mail", "Phone", "MessageCircle") or image URL
  iconColor: string;
  bgColor: string;
  title: string;
  content: string;
  href?: string;
  isLink?: boolean;
  isExternal?: boolean;
  isMultiline?: boolean;
  category: "contact" | "social";
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactRequest {
  id: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  content: string;
  href?: string;
  isLink?: boolean;
  isExternal?: boolean;
  isMultiline?: boolean;
  category: "contact" | "social";
  order: number;
  isActive: boolean;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface ContactResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ContactItem | ContactItem[] | null;
}
