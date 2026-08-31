import { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Dropdown, { DropdownItem } from '../ui/Dropdown';

export default function Topbar({ onMenuClick, pageTitle, pageSubtitle }: { onMenuClick: () => void; pageTitle: string; pageSubtitle?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center gap-4 px-4 lg:px-6 py-3.5">
        <button className="lg:hidden text-slate-500" onClick={onMenuClick}>
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
          {pageSubtitle && <p className="text-xs text-slate-500 mt-0.5">{pageSubtitle}</p>}
        </div>

        <div className="flex-1 flex justify-end lg:justify-between items-center gap-4">
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anything..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>

            <Dropdown
              trigger={
                <button className="flex items-center gap-2 pl-1">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name}</p>
                    <p className="text-xs text-slate-500 leading-tight">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </button>
              }
            >
              <DropdownItem onClick={() => navigate('/settings')}>
                <UserIcon className="w-4 h-4" /> Profile
              </DropdownItem>
              <DropdownItem onClick={() => navigate('/settings')}>
                <SettingsIcon className="w-4 h-4" /> Settings
              </DropdownItem>
              <div className="h-px bg-slate-100 my-1" />
              <DropdownItem danger onClick={() => { logout(); navigate('/login'); }}>
                <LogOut className="w-4 h-4" /> Log out
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="lg:hidden px-4 pb-3">
        <h1 className="text-base font-semibold text-slate-900">{pageTitle}</h1>
      </div>
    </header>
  );
}
