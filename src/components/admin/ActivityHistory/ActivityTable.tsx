'use client';

import React, { useState } from 'react';
import { useGetAllActivitiesQuery, useDeleteActivityMutation } from '@/app/redux/api/activityHistoryApi';
import type { IActivityHistory, IActivityHistoryFilters } from '@/types/activityHistory';
import { ActivityBadge } from './ActivityBadge';
import { ActivityEntityBadge } from './ActivityEntityBadge';
import { Button } from '@/components/ui/Button';
import { Trash2, ChevronLeft, ChevronRight, Monitor, Globe } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ActivityTableProps {
  filters: IActivityHistoryFilters;
  onPageChange?: (page: number) => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  USER: 'User',
  HR: 'HR',
  MARKETING_TEAM: 'Marketing',
  CUSTOMER_SERVICE_TEAM: 'Support',
};

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ActivityTable({ filters, onPageChange }: ActivityTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteActivity] = useDeleteActivityMutation();

  const currentPage = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const { data, isLoading, isFetching } = useGetAllActivitiesQuery({
    ...filters,
    page: currentPage,
    limit,
  });

  const activities = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity log entry?')) return;
    setDeletingId(id);
    try {
      await deleteActivity(id).unwrap();
    } catch {
      // Error handled silently
    } finally {
      setDeletingId(null);
    }
  };

  const handlePage = (page: number) => {
    if (onPageChange) onPageChange(page);
  };

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Description
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  IP
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {isLoading || isFetching ? (
                <TableSkeleton />
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    No activity records found.
                  </td>
                </tr>
              ) : (
                activities.map((log: IActivityHistory) => (
                  <ActivityRow
                    key={log._id}
                    log={log}
                    onDelete={handleDelete}
                    isDeleting={deletingId === log._id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, meta.total)} of{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">{meta.total.toLocaleString()}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePage(page)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ActivityRowProps {
  log: IActivityHistory;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function ActivityRow({ log, onDelete, isDeleting }: ActivityRowProps) {
  const roleLabel = ROLE_LABELS[log.performedBy?.role] ?? log.performedBy?.role ?? '-';

  return (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
      {/* Timestamp */}
      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
        <div className="text-xs">{format(new Date(log.createdAt), 'dd MMM yyyy')}</div>
        <div className="text-xs text-gray-400">{format(new Date(log.createdAt), 'HH:mm:ss')}</div>
      </td>

      {/* User */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {log.performedBy?.name ?? 'Unknown'}
          </span>
          <span className="text-xs text-gray-400">{log.performedBy?.email}</span>
          <span className="inline-block w-fit rounded bg-gray-100 px-1.5 py-0 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {roleLabel}
          </span>
        </div>
      </td>

      {/* Action */}
      <td className="whitespace-nowrap px-4 py-3">
        <ActivityBadge actionType={log.actionType} />
      </td>

      {/* Entity */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <ActivityEntityBadge entity={log.entity} />
          {log.entityId && (
            <span className="max-w-[120px] truncate text-[10px] text-gray-400" title={log.entityId}>
              {log.entityId}
            </span>
          )}
        </div>
      </td>

      {/* Description */}
      <td className="max-w-xs px-4 py-3 text-gray-700 dark:text-gray-300">
        <span className="line-clamp-2 text-xs">{log.description}</span>
      </td>

      {/* IP */}
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Globe className="h-3 w-3" />
          {log.ipAddress && log.ipAddress !== 'Unknown' ? log.ipAddress : '—'}
        </div>
      </td>

      {/* Delete */}
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(log._id)}
          disabled={isDeleting}
          className="h-7 w-7 p-0 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          title="Delete log"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}
