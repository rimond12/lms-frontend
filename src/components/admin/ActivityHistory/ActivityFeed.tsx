'use client';

import React from 'react';
import { useGetAllActivitiesQuery } from '@/app/redux/api/activityHistoryApi';
import type { IActivityHistory, IActivityHistoryFilters } from '@/types/activityHistory';
import { ActivityBadge } from './ActivityBadge';
import { ActivityEntityBadge } from './ActivityEntityBadge';
import { User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  /** Number of items to display. Default 20. */
  limit?: number;
  /** Additional filters to apply. */
  filters?: Partial<IActivityHistoryFilters>;
  /** Show the user avatar initial. Default true. */
  showAvatar?: boolean;
}

function FeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative flex gap-3 pb-5 pl-9">
          {/* timeline line */}
          {i < count - 1 && (
            <span className="absolute left-[18px] top-8 h-full w-px bg-gray-200 dark:bg-gray-700" />
          )}
          <div className="absolute left-0 h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

const ACTION_ICON_COLOR: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export function ActivityFeed({ limit = 20, filters, showAvatar = true }: ActivityFeedProps) {
  const { data, isLoading } = useGetAllActivitiesQuery({
    ...(filters ?? {}),
    limit,
    page: 1,
    sortOrder: 'desc',
    sortBy: 'createdAt',
  });

  const activities = data?.data ?? [];

  if (isLoading) {
    return <FeedSkeleton count={limit < 6 ? limit : 6} />;
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
        <Clock className="h-10 w-10 opacity-30" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((log: IActivityHistory, index: number) => {
        const initials = ((log.performedBy?.name ?? 'U')[0] ?? 'U').toUpperCase();
        const avatarColor = ACTION_ICON_COLOR[log.actionType] ?? 'bg-gray-100 text-gray-600';
        const isLast = index === activities.length - 1;

        return (
          <div key={log._id} className="relative flex gap-3 pb-5 pl-9">
            {/* Vertical timeline line */}
            {!isLast && (
              <span className="absolute left-[18px] top-9 h-full w-px bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Avatar */}
            {showAvatar && (
              <div
                className={`absolute left-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
              >
                {initials}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              {/* Top row: name, role, badge, entity, time */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm dark:text-gray-200">
                  {log.performedBy?.name ?? 'Unknown'}
                </span>
                <span className="rounded bg-gray-100 px-1.5 py-0 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {log.performedBy?.role}
                </span>
                <ActivityBadge actionType={log.actionType} />
                <ActivityEntityBadge entity={log.entity} />
                <span className="ml-auto whitespace-nowrap text-[11px] text-gray-400">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Description */}
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                {log.description}
              </p>

              {/* Email */}
              <p className="mt-1 text-[11px] text-gray-400">
                {log.performedBy?.email}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
