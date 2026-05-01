// Common types used across the application

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
