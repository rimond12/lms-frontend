'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, RotateCcw } from 'lucide-react';
import type { IActivityHistoryFilters, TActionType } from '@/types/activityHistory';

interface ActivityFiltersProps {
  filters: IActivityHistoryFilters;
  onChange: (filters: IActivityHistoryFilters) => void;
  onReset?: () => void;
}

const ACTION_TYPE_OPTIONS: { label: string; value: TActionType | '' }[] = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
];

const ENTITY_OPTIONS = [
  '', 'User', 'Session', 'Course', 'Batch', 'Enrollment', 'Payment',
  'Certificate', 'Assignment', 'QuizAttempt', 'Notice', 'Banner',
  'BlogEventNews', 'Category', 'Voucher',
];

export function ActivityFilters({ filters, onChange, onReset }: ActivityFiltersProps) {
  const handleChange = (key: keyof IActivityHistoryFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange({ page: 1, limit: 20 });
    }
  };

  const hasActiveFilters = !!(
    filters.searchTerm ||
    filters.actionType ||
    filters.entity ||
    filters.email ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      {/* Row 1: Search + Email */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search descriptions..."
            value={filters.searchTerm ?? ''}
            onChange={(e) => handleChange('searchTerm', e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter by email..."
            value={filters.email ?? ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      {/* Row 2: Action Type + Entity + Date Range + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Action Type Select */}
        <select
          value={filters.actionType ?? ''}
          onChange={(e) => handleChange('actionType', e.target.value)}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          {ACTION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Entity Select */}
        <select
          value={filters.entity ?? ''}
          onChange={(e) => handleChange('entity', e.target.value)}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          <option value="">All Entities</option>
          {ENTITY_OPTIONS.filter(Boolean).map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          title="Start date"
        />

        {/* End Date */}
        <input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          title="End date"
        />

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-gray-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
