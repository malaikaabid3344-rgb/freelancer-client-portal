import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, FolderOpen, FileText, MessageSquare,
  CheckSquare, Clock, BarChart3, Settings, Sparkles, X
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/files', label: 'Files', icon: FolderOpen },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/time-tracking', label: 'Time Tracking', icon: Clock },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 h-screen w-64 bg-navy-900 text-slate-300 flex flex-col z-50 transition-transform duration-200 shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold leading-tight">Freelancer</p>
              <p className="text-xs text-slate-400 leading-tight">Client Portal</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={onCloseMobile}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-4 text-center">
            <Sparkles className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white mb-0.5">Upgrade to Pro</p>
            <p className="text-xs text-primary-100 mb-3">Unlock more features and manage your business like a pro.</p>
            <button className="w-full bg-white text-primary-700 text-xs font-semibold py-2 rounded-lg hover:bg-primary-50">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
