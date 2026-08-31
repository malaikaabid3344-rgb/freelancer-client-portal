import { useEffect, useMemo, useState } from 'react';
import {
  Wallet, Briefcase, Users, FileText, Plus, UserPlus, FolderPlus, Upload,
  Clock, MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import Card from '../components/ui/Card';
import Badge, { statusColor } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../services/projectService';
import { getClients } from '../services/clientService';
import { getInvoices } from '../services/invoiceService';
import { getConversations } from '../services/messageService';
import type { Project, Client, Invoice, Conversation } from '../types';
import { formatCurrency, formatDate, daysUntil, initials } from '../utils/format';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#5b34e6', '#2563eb', '#f59e0b', '#16a34a', '#dc2626'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [range, setRange] = useState('This Month');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, c, i, m] = await Promise.all([
          getProjects(), getClients(), getInvoices(), getConversations()
        ]);
        if (!mounted) return;
        setProjects(p.data);
        setClients(c.data);
        setInvoices(i.data);
        setConversations(m.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const totalEarnings = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
    const pendingInvoices = invoices.filter((i) => i.status === 'Pending' || i.status === 'Overdue').length;
    return { totalEarnings, activeProjects, totalClients: clients.length, pendingInvoices };
  }, [invoices, projects, clients]);

  const earningsSeries = useMemo(() => {
    // Build a simple monthly series from paid invoices, last 6 months
    const months: { label: string; total: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-US', { month: 'short' });
      const total = invoices
        .filter((inv) => inv.status === 'Paid' && inv.paidAt && new Date(inv.paidAt).getMonth() === d.getMonth())
        .reduce((s, inv) => s + inv.total, 0);
      months.push({ label, total });
    }
    return months;
  }, [invoices]);

  const projectsByStatus = useMemo(() => {
    const groups: Record<string, number> = {};
    projects.forEach((p) => { groups[p.status] = (groups[p.status] || 0) + 1; });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [projects]);

  const topClients = useMemo(() => {
    const totals: Record<string, { name: string; total: number; projects: number }> = {};
    projects.forEach((p) => {
      const c = typeof p.client === 'object' ? p.client : null;
      if (!c) return;
      if (!totals[c._id]) totals[c._id] = { name: c.name, total: 0, projects: 0 };
      totals[c._id].projects += 1;
    });
    invoices.filter((i) => i.status === 'Paid').forEach((i) => {
      const c = typeof i.client === 'object' ? i.client : null;
      if (!c) return;
      if (!totals[c._id]) totals[c._id] = { name: c.name, total: 0, projects: 0 };
      totals[c._id].total += i.total;
    });
    return Object.values(totals).sort((a, b) => b.total - a.total).slice(0, 3);
  }, [projects, invoices]);

  const upcomingDeadlines = useMemo(() => {
    return [...projects]
      .filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [projects]);

  const recentInvoices = useMemo(
    () => [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 4),
    [invoices]
  );

  const quickActions = [
    { label: 'Add Client', icon: UserPlus, onClick: () => navigate('/clients') },
    { label: 'New Project', icon: FolderPlus, onClick: () => navigate('/projects') },
    { label: 'Create Invoice', icon: Plus, onClick: () => navigate('/invoices') },
    { label: 'Upload File', icon: Upload, onClick: () => navigate('/files') }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Button key={a.label} variant="outline" size="sm" icon={<a.icon className="w-4 h-4" />} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total Earnings" value={formatCurrency(stats.totalEarnings, user?.currency)} color="blue" trend="+18% from last month" />
        <StatCard icon={Briefcase} label="Active Projects" value={String(stats.activeProjects)} color="green" trend="On track" />
        <StatCard icon={Users} label="Total Clients" value={String(stats.totalClients)} color="purple" trend={`${clients.filter(c => c.status === 'Active').length} active`} />
        <StatCard icon={FileText} label="Pending Invoices" value={String(stats.pendingInvoices)} color="orange" trend="Needs attention" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Earnings Overview</h3>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600"
            >
              <option>This Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={earningsSeries}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b34e6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5b34e6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => formatCurrency(v, user?.currency)} />
              <Area type="monotone" dataKey="total" stroke="#5b34e6" strokeWidth={2.5} fill="url(#earningsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Projects by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={projectsByStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {projectsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {projectsByStatus.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{p.name}</span>
                </div>
                <span className="font-medium text-slate-900">{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Top Clients</h3>
            <button onClick={() => navigate('/clients')} className="text-xs text-primary-600 font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {topClients.length === 0 && <p className="text-sm text-slate-400">No client revenue yet</p>}
            {topClients.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-semibold">
                    {initials(c.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.projects} project{c.projects !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(c.total, user?.currency)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upcoming Deadlines</h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-primary-600 font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.map((p) => {
              const days = daysUntil(p.deadline);
              return (
                <div key={p._id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-medium text-slate-500 uppercase">{formatDate(p.deadline, { month: 'short' })}</span>
                    <span className="text-sm font-bold text-slate-900 -mt-0.5">{formatDate(p.deadline, { day: 'numeric' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.priority} priority</p>
                  </div>
                  <Badge color={days < 3 ? 'danger' : days < 7 ? 'pending' : 'info'}>
                    {days > 0 ? `${days}d left` : 'Overdue'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Messages</h3>
            <button onClick={() => navigate('/messages')} className="text-xs text-primary-600 font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {conversations.slice(0, 4).map((c) => (
              <div key={c.client._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-semibold shrink-0">
                  {initials(c.client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{c.client.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.lastMessage?.text || 'No messages yet'}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-6">
                <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No conversations yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          <button onClick={() => navigate('/invoices')} className="text-xs text-primary-600 font-medium">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-2 font-medium">Invoice</th>
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Issue Date</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((inv) => (
                <tr key={inv._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 text-slate-600">{typeof inv.client === 'object' ? inv.client.name : ''}</td>
                  <td className="py-3 text-slate-500">{formatDate(inv.issueDate)}</td>
                  <td className="py-3 font-medium text-slate-900">{formatCurrency(inv.total, user?.currency)}</td>
                  <td className="py-3"><Badge color={statusColor(inv.status)}>{inv.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color, trend
}: {
  icon: any; label: string; value: string; color: 'blue' | 'green' | 'purple' | 'orange'; trend: string;
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-primary-50 text-primary-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{trend}</p>
    </Card>
  );
}
