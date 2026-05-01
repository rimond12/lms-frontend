export type TActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface IActivityPerformedBy {
  name: string;
  email: string;
  userId: string;
  role: string;
}

export interface IActivityHistory {
  _id: string;
  actionType: TActionType;
  entity: string;
  entityId?: string;
  description: string;
  performedBy: IActivityPerformedBy;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityHistoryFilters {
  searchTerm?: string;
  actionType?: TActionType;
  entity?: string;
  userId?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IActivityStats {
  totalCount: number;
  byActionType: { _id: TActionType; count: number }[];
  byEntity: { _id: string; count: number }[];
  topUsers: { _id: string; name: string; email: string; role: string; count: number }[];
  recentActivities: IActivityHistory[];
}

export interface IActivityHistoryResponse {
  data: IActivityHistory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
