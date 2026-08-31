import { useState, FormEvent } from 'react';
import { User as UserIcon, Lock, Bell, Palette, Globe, Camera, Monitor, Smartphone } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as authService from '../services/authService';
import clsx from 'clsx';

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'preferences';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: Globe }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications state
  const [notifPrefs, setNotifPrefs] = useState(
    user?.notificationPrefs || { email: true, projectUpdates: true, invoices: true, messages: true }
  );

  // Appearance / preferences
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [language, setLanguage] = useState(user?.language || 'en');

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authService.updateMe({ name, phone });
      updateUser(res.data.user);
      showToast('Profile updated successfully');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showToast('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const saveNotifications = async () => {
    try {
      const res = await authService.updateMe({ notificationPrefs: notifPrefs });
      updateUser(res.data.user);
      showToast('Notification preferences saved');
    } catch {
      showToast('Failed to save preferences', 'error');
    }
  };

  const saveAppearance = async () => {
    try {
      const res = await authService.updateMe({ theme });
      updateUser(res.data.user);
      showToast('Appearance updated');
    } catch {
      showToast('Failed to update appearance', 'error');
    }
  };

  const savePreferences = async () => {
    try {
      const res = await authService.updateMe({ currency, timezone, language });
      updateUser(res.data.user);
      showToast('Preferences saved');
    } catch {
      showToast('Failed to save preferences', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tabs sidebar */}
      <Card className="p-2 h-fit lg:sticky lg:top-20">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </button>
          ))}
        </nav>
      </Card>

      {/* Content */}
      <div className="lg:col-span-3 space-y-6">
        {activeTab === 'profile' && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Profile Information</h3>
            <p className="text-sm text-slate-500 mb-6">Update your personal details</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-semibold relative">
                {user?.name?.charAt(0) || 'U'}
                <button
                  type="button"
                  onClick={() => showToast('Avatar upload is a demo action', 'info')}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
              <div>
                <p className="font-medium text-slate-900">{user?.name}</p>
                <p className="text-sm text-slate-500">{user?.role}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" value={user?.email} disabled className="bg-slate-50 text-slate-400" />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              <Button type="submit" loading={savingProfile}>Save Changes</Button>
            </form>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Security</h3>
            <p className="text-sm text-slate-500 mb-6">Manage your password and session</p>

            <form onSubmit={savePassword} className="space-y-4 max-w-lg mb-8">
              <Input
                type="password" label="Current Password" value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"
              />
              <Input
                type="password" label="New Password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
              />
              <Input
                type="password" label="Confirm New Password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
              />
              <Button type="submit" loading={savingPassword}>Change Password</Button>
            </form>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Session Information</h4>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900">Current session</p>
                  <p className="text-xs text-slate-500">This device • Active now</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Notifications</h3>
            <p className="text-sm text-slate-500 mb-6">Choose what you want to be notified about</p>

            <div className="space-y-1 max-w-lg">
              {[
                { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'projectUpdates' as const, label: 'Project Updates', desc: 'When a project status or progress changes' },
                { key: 'invoices' as const, label: 'Invoice Notifications', desc: 'When invoices are sent or paid' },
                { key: 'messages' as const, label: 'Message Notifications', desc: 'When clients send you a message' }
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs[key]}
                    onChange={(e) => setNotifPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                    className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              ))}
              <Button className="mt-4" onClick={saveNotifications}>Save Preferences</Button>
            </div>
          </Card>
        )}

        {activeTab === 'appearance' && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Appearance</h3>
            <p className="text-sm text-slate-500 mb-6">Customize how the portal looks</p>

            <div className="grid grid-cols-2 gap-4 max-w-lg mb-6">
              <button
                onClick={() => setTheme('light')}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-colors',
                  theme === 'light' ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
                )}
              >
                <div className="w-full h-16 rounded-lg bg-white border border-slate-200 mb-3 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">Light Mode</p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-colors',
                  theme === 'dark' ? 'border-primary-600 bg-primary-50' : 'border-slate-200'
                )}
              >
                <div className="w-full h-16 rounded-lg bg-navy-900 mb-3 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">Dark Mode</p>
              </button>
            </div>
            <Button onClick={saveAppearance}>Save Appearance</Button>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Preferences</h3>
            <p className="text-sm text-slate-500 mb-6">Regional and display preferences</p>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="America/New_York">Eastern Time (US)</option>
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Karachi">Karachi</option>
                  <option value="Asia/Kolkata">Kolkata</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
              <Button onClick={savePreferences}>Save Preferences</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
