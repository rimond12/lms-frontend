/**
 * Category Types
 * TypeScript types for Category management - Frontend
 */

// ==================== CATEGORY INTERFACE ====================
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  shortName?: string;
  description?: string;
  photoUrl?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  level: number;
  order: number;
  isActive: boolean;
  courseCount?: number;
  totalCourseCount?: number; // Includes sub-categories
  subCategories?: ICategory[];
  createdAt?: string;
  updatedAt?: string;
}

// ==================== REQUEST INTERFACES ====================
export interface ICreateCategoryRequest {
  name: string;
  slug?: string;
  shortName?: string;
  description?: string;
  photoUrl?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
}

export interface IUpdateCategoryRequest {
  name?: string;
  slug?: string;
  shortName?: string;
  description?: string;
  photoUrl?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
}

export interface IReorderCategoryRequest {
  categories: {
    _id: string;
    order: number;
  }[];
}

// ==================== QUERY INTERFACES ====================
export interface ICategoryQuery {
  page?: number;
  limit?: number;
  level?: number;
  parentId?: string | null;
  isActive?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== RESPONSE INTERFACES ====================
export interface ICategoryResponse {
  success: boolean;
  message: string;
  data: ICategory;
}

export interface ICategoriesResponse {
  success: boolean;
  message: string;
  data: ICategory[];
}

export interface ICategoryListResponse {
  success: boolean;
  message: string;
  data: ICategory[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ICategoryHierarchyResponse {
  success: boolean;
  message: string;
  data: ICategory[]; // Main categories with nested subCategories
}

export interface IUploadCategoryPhotoResponse {
  success: boolean;
  message: string;
  data: {
    photoUrl: string;
    filename: string;
    originalName: string;
    size: number;
  };
}

// ==================== FORM DATA ====================
export interface ICategoryFormData {
  name: string;
  slug: string;
  shortName: string;
  description: string;
  photoUrl: string;
  icon: string;
  color: string;
  parentId: string | null;
  level: number;
  order: number;
  isActive: boolean;
}

// Default form values
export const defaultCategoryFormData: ICategoryFormData = {
  name: '',
  slug: '',
  shortName: '',
  description: '',
  photoUrl: '',
  icon: '',
  color: '#6366f1',
  parentId: null,
  level: 0,
  order: 0,
  isActive: true
};

// ==================== UI TYPES ====================
export interface ICategoryOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  level?: number;
  disabled?: boolean;
}

// ==================== PREDEFINED ICONS ====================
export const CATEGORY_ICONS = [
  '🏗️', '🏛️', '📐', '⚙️', '📊', '🏠', '🔧', '💡', 
  '📚', '🎓', '💻', '🔬', '🎨', '✏️', '📝', '🛠️'
];

// ==================== PREDEFINED COLORS ====================
export const CATEGORY_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
];
