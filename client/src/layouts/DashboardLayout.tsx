import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: "Here's what's happening with your projects today." },
  '/clients': { title: 'Clients', subtitle: 'Manage your client relationships' },
  '/projects': { title: 'Projects', subtitle: 'Track and manage all your projects' },
  '/files': { title: 'Files', subtitle: 'Manage and share project files' },
  '/invoices': { title: 'Invoices', subtitle: 'Create and manage client invoices' },
  '/messages': { title: 'Messages', subtitle: 'Chat with your clients' },
  '/tasks': { title: 'Tasks', subtitle: 'Organize and track your to-dos' },
  '/time-tracking': { title: 'Time Tracking', subtitle: 'Log and review billable hours' },
  '/reports': { title: 'Reports', subtitle: 'Analytics across your freelance business' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' }
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const matched = Object.keys(pageMeta).find((key) => location.pathname.startsWith(key));
  const meta = matched ? pageMeta[matched] : { title: 'Freelancer Portal' };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} pageTitle={meta.title} pageSubtitle={meta.subtitle} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
