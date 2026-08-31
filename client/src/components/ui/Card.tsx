import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('bg-white rounded-2xl border border-slate-200 shadow-card', className)}
      {...props}
    >
      {children}
    </div>
  );
}
