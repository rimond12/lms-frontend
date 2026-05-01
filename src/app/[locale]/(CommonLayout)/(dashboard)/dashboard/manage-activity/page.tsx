'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  TableIcon,
  Rss,
  Trash2,
  RefreshCcw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useDeleteActivitiesBulkMutation } from '@/app/redux/api/activityHistoryApi';
import {
  ActivityStats,
  ActivityFilters,
  ActivityTable,
  ActivityFeed,
} from '@/components/admin/ActivityHistory';
import type { IActivityHistoryFilters } from '@/types/activityHistory';

const DEFAULT_FILTERS: IActivityHistoryFilters = {
  page: 1,
  limit: 20,
};

export default function ManageActivityPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialView = (searchParams.get('view') as 'table' | 'feed') ?? 'table';
  const [activeView, setActiveView] = useState<'table' | 'feed'>(initialView);

  const [filters, setFilters] = useState<IActivityHistoryFilters>(DEFAULT_FILTERS);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [deleteActivitiesBulk, { isLoading: isBulkDeleting }] = useDeleteActivitiesBulkMutation();

  const handleViewChange = (view: string) => {
    setActiveView(view as 'table' | 'feed');
    router.replace(`?view=${view}`, { scroll: false });
  };

  const handleFiltersChange = useCallback((next: IActivityHistoryFilters) => {
    setFilters(next);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleBulkDelete = async () => {
    try {
      const filterPayload: Partial<IActivityHistoryFilters> = {};
      if (filters.actionType) filterPayload.actionType = filters.actionType;
      if (filters.entity) filterPayload.entity = filters.entity;
      if (filters.startDate) filterPayload.startDate = filters.startDate;
      if (filters.endDate) filterPayload.endDate = filters.endDate;

      await deleteActivitiesBulk(filterPayload).unwrap();
      setFilters(DEFAULT_FILTERS);
      setConfirmBulkDelete(false);
    } catch {
      // Error handled silently; RTK Query provides error state if needed
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Activity Log
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full audit trail of all admin &amp; user actions across the platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Button>
          </Link>

          {/* Bulk delete */}
          {!confirmBulkDelete ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmBulkDelete(true)}
              className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Bulk Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 font-medium">
                {filters.actionType || filters.entity || filters.startDate
                  ? 'Delete filtered logs?'
                  : 'Delete ALL logs?'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmBulkDelete(false)}
                className="h-7 px-2 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="h-7 gap-1 bg-red-600 px-2 text-xs text-white hover:bg-red-700"
              >
                {isBulkDeleting ? (
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Confirm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-5">
        <ActivityStats filters={filters} />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ActivityFilters filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
      </div>

      {/* Tabs: Table | Feed */}
      <Tabs value={activeView} onValueChange={handleViewChange}>
        <TabsList className="mb-4 bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-900 h-10">
          <TabsTrigger value="table" className="gap-1.5 text-xs font-semibold">
            <TableIcon className="h-3.5 w-3.5" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="feed" className="gap-1.5 text-xs font-semibold">
            <Rss className="h-3.5 w-3.5" />
            Feed View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <ActivityTable filters={filters} onPageChange={handlePageChange} />
        </TabsContent>

        <TabsContent value="feed">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <ActivityFeed
              filters={filters}
              limit={filters.limit ?? 20}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
