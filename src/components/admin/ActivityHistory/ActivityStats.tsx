'use client';

import React from 'react';
import { useGetActivityStatsQuery } from '@/app/redux/api/activityHistoryApi';
import { Plus, RefreshCcw, Trash2, Activity, TrendingUp } from 'lucide-react';
import type { IActivityHistoryFilters } from '@/types/activityHistory';

interface ActivityStatsProps {
  filters?: Partial<IActivityHistoryFilters>;
}

const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Activities',
    icon: Activity,
    colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    key: 'CREATE',
    label: 'Created',
    icon: Plus,
    colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  {
    key: 'UPDATE',
    label: 'Updated',
    icon: RefreshCcw,
    colorClass: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
  },
  {
    key: 'DELETE',
    label: 'Deleted',
    icon: Trash2,
    colorClass: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
  },
];

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-7 w-12 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export function ActivityStats({ filters }: ActivityStatsProps) {
  const { data, isLoading } = useGetActivityStatsQuery(filters ?? {});
  const stats = data?.data;

  const getCount = (key: string): number => {
    if (!stats) return 0;
    if (key === 'total') return stats.totalCount ?? 0;
    const found = stats.byActionType?.find((b) => b._id === key);
    return found?.count ?? 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((c) => (
          <StatCardSkeleton key={c.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stat Count Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, colorClass, iconBg }) => (
          <div
            key={key}
            className={`flex items-center gap-3 rounded-xl border border-transparent p-4 ${colorClass}`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-2xl font-bold leading-tight">{getCount(key).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Entities */}
      {stats?.byEntity && stats.byEntity.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Entities</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {stats.byEntity.slice(0, 10).map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
              >
                <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{e._id}</span>
                <span className="ml-2 shrink-0 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {e.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
