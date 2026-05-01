import React from 'react';
import { cn } from '@/lib/utils';

interface ActivityEntityBadgeProps {
  entity: string;
  className?: string;
}

// Deterministic color from entity name
const ENTITY_COLORS: Record<string, string> = {
  User:               'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  Session:            'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  Course:             'bg-amber-100  text-amber-800  border-amber-200  dark:bg-amber-900/30  dark:text-amber-400  dark:border-amber-800',
  Batch:              'bg-sky-100    text-sky-800    border-sky-200    dark:bg-sky-900/30    dark:text-sky-400    dark:border-sky-800',
  Enrollment:         'bg-teal-100   text-teal-800   border-teal-200   dark:bg-teal-900/30   dark:text-teal-400   dark:border-teal-800',
  Payment:            'bg-green-100  text-green-800  border-green-200  dark:bg-green-900/30  dark:text-green-400  dark:border-green-800',
  Certificate:        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  Assignment:         'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  QuizAttempt:        'bg-pink-100   text-pink-800   border-pink-200   dark:bg-pink-900/30   dark:text-pink-400   dark:border-pink-800',
  Notice:             'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
  Banner:             'bg-rose-100   text-rose-800   border-rose-200   dark:bg-rose-900/30   dark:text-rose-400   dark:border-rose-800',
  BlogEventNews:      'bg-cyan-100   text-cyan-800   border-cyan-200   dark:bg-cyan-900/30   dark:text-cyan-400   dark:border-cyan-800',
  Category:           'bg-lime-100   text-lime-800   border-lime-200   dark:bg-lime-900/30   dark:text-lime-400   dark:border-lime-800',
  Voucher:            'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800',
};

const DEFAULT_COLOR =
  'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';

export function ActivityEntityBadge({ entity, className }: ActivityEntityBadgeProps) {
  const colorClass = ENTITY_COLORS[entity] ?? DEFAULT_COLOR;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {entity}
    </span>
  );
}
