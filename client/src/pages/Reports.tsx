import { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, Loader2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as reportService from '../services/reportService';
import * as invoiceService from '../services/invoiceService';
import * as projectService from '../services/projectService';
import type { Invoice, Project } from '../types';
import { formatCurrency } from '../utils/format';
import { useToast } from '../context/ToastContext';

const RANGE_OPTIONS = ['This Week', 'This Month', 'Last 3 Months', 'This Year', 'Custom Range'];
const COLORS = ['#5b34e6', '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#94a3b8'];

const rangeToDate = (range: string): Date => {
  const now = new Date();
  switch (range) {
    case 'This Week': { const d = new Date(now); d.setDate(now.getDate() - 7); return d; }
    case 'Last 3 Months': { const d = new Date(now); d.setMonth(now.getMonth() - 3); return d; }
    case 'This Year': return new Date(now.getFullYear(), 0, 1);
    default: return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};

export default function Reports() {
  const [range, setRange] = useState('This Year');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [invRes, projRes] = await Promise.all([invoiceService.getInvoices(), projectService.getProjects()]);
        setInvoices(invRes.data);
        setProjects(projRes.data);
      } catch {
        showToast('Failed to load report data', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredInvoices = useMemo(() => {
    const since = rangeToDate(range);
    return invoices.filter((i) => new Date(i.issueDate) >= since);
  }, [invoices, range]);

  const monthlyEarnings = useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.filter((i) => i.status === 'Paid').forEach((i) => {
      const d = new Date(i.issueDate);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      map[key] = (map[key] || 0) + i.total;
    });
    return Object.entries(map).map(([month, total]) => ({ month, total }));
  }, [filteredInvoices]);

  const revenueByProject = useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.filter((i) => i.status === 'Paid').forEach((i) => {
      const name = typeof i.project === 'string' ? 'Unassigned' : i.project?.name || 'Unassigned';
      map[name] = (map[name] || 0) + i.total;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [filteredInvoices]);

  const revenueByClient = useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.filter((i) => i.status === 'Paid').forEach((i) => {
      const name = typeof i.client === 'string' ? 'Unknown' : i.client?.name || 'Unknown';
      map[name] = (map[name] || 0) + i.total;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredInvoices]);

  const completedProjects = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [projects]);

  const summary = useMemo(() => {
    const totalRevenue = filteredInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
    const outstanding = filteredInvoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.total, 0);
    return { totalRevenue, outstanding, invoiceCount: filteredInvoices.length };
  }, [filteredInvoices]);

  const handleExport = () => {
    const rows = [
      ['Invoice #', 'Client', 'Status', 'Issue Date', 'Total'],
      ...filteredInvoices.map((i) => [
        i.invoiceNumber,
        typeof i.client === 'string' ? i.client : i.client?.name,
        i.status,
        new Date(i.issueDate).toLocaleDateString(),
        String(i.total)
      ])
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${range.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported');
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select value={range} onChange={(e) => setRange(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white w-fit">
          {RANGE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export Report</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-slate-500 mb-1">Revenue Summary</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Paid invoices in range</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 mb-1">Outstanding</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(summary.outstanding)}</p>
          <p className="text-xs text-orange-600 mt-1">Pending + overdue invoices</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 mb-1">Invoices Issued</p>
          <p className="text-2xl font-semibold text-slate-900">{summary.invoiceCount}</p>
          <p className="text-xs text-slate-400 mt-1">In selected range</p>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Earnings</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyEarnings}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Line type="monotone" dataKey="total" stroke="#5b34e6" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Project</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByProject} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#2563eb" radius={[0, 6, 6, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Clients by Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={revenueByClient} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {revenueByClient.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Completed Projects Overview</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={completedProjects}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
