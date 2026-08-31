import { ReactNode } from 'react';
import clsx from 'clsx';

type BadgeColor = 'success' | 'pending' | 'danger' | 'info' | 'slate' | 'primary';

const colorMap: Record<BadgeColor, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200'
};

export default function Badge({ color = 'slate', children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
        colorMap[color]
      )}
    >
      {children}
    </span>
  );
}

export function statusColor(status: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    Active: 'success',
    Completed: 'success',
    Paid: 'success',
    'In Progress': 'info',
    Pending: 'pending',
    'On Hold': 'pending',
    Lead: 'primary',
    Draft: 'slate',
    Inactive: 'slate',
    Cancelled: 'danger',
    Overdue: 'danger',
    'To Do': 'slate',
    Review: 'primary'
  };
  return map[status] || 'slate';
}
