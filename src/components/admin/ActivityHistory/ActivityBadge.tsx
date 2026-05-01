import React from 'react';
import type { TActionType } from '@/types/activityHistory';
import { cn } from '@/lib/utils';

interface ActivityBadgeProps {
  actionType: TActionType;
  className?: string;
}

const ACTION_CONFIG: Record<TActionType, { label: string; classes: string }> = {
  CREATE: {
    label: 'Created',
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  },
  UPDATE: {
    label: 'Updated',
    classes: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  DELETE: {
    label: 'Deleted',
    classes: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
};

export function ActivityBadge({ actionType, className }: ActivityBadgeProps) {
  const config = ACTION_CONFIG[actionType] ?? {
    label: actionType,
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        config.classes,
        className
      )}
    >
      {actionType === 'CREATE' && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      )}
      {actionType === 'UPDATE' && (
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
      )}
      {actionType === 'DELETE' && (
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      )}
      {config.label}
    </span>
  );
}
