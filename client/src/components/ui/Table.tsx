import { ReactNode } from 'react';
import clsx from 'clsx';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-px">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 border-y border-slate-200">{children}</thead>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={clsx('text-left font-medium text-slate-500 px-4 py-3 whitespace-nowrap', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('px-4 py-3.5 align-middle', className)}>{children}</td>;
}

export function Tr({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={clsx('border-b border-slate-100 last:border-0', onClick && 'cursor-pointer hover:bg-slate-50', className)}
    >
      {children}
    </tr>
  );
}
