import { useEffect, useMemo, useState } from 'react';
import { Play, Square, Plus, Clock, Trash2, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import * as timeService from '../services/timeEntryService';
import * as projectService from '../services/projectService';
import type { TimeEntry, Project } from '../types';
import { formatDate, formatMinutes } from '../utils/format';

const startOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};
const startOfMonth = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d; };
const startOfDay = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export default function TimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerProject, setTimerProject] = useState('');
  const [timerDesc, setTimerDesc] = useState('');

  const [manualOpen, setManualOpen] = useState(false);
  const [mProject, setMProject] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mDate, setMDate] = useState(new Date().toISOString().slice(0, 10));
  const [mHours, setMHours] = useState('1');
  const [mMinutes, setMMinutes] = useState('0');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimeEntry | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [entriesRes, projectsRes] = await Promise.all([timeService.getTimeEntries(), projectService.getProjects()]);
      setEntries(entriesRes.data);
      setProjects(projectsRes.data);
      if (projectsRes.data[0]) {
        setTimerProject(projectsRes.data[0]._id);
        setMProject(projectsRes.data[0]._id);
      }
    } catch {
      showToast('Failed to load time entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!timerRunning || !timerStart) return;
    const interval = setInterval(() => setElapsed(Date.now() - timerStart), 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerStart]);

  const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const startTimer = () => {
    if (!timerProject) return showToast('Select a project first', 'error');
    setTimerStart(Date.now());
    setTimerRunning(true);
    setElapsed(0);
  };

  const stopTimer = async () => {
    if (!timerStart) return;
    setTimerRunning(false);
    try {
      const res = await timeService.createTimeEntry({
        project: timerProject,
        description: timerDesc || 'Timed session',
        startTime: new Date(timerStart).toISOString(),
        endTime: new Date().toISOString(),
        billable: true,
        source: 'timer'
      });
      setEntries((prev) => [res.data, ...prev]);
      showToast('Time entry logged');
      setTimerDesc('');
      setTimerStart(null);
      setElapsed(0);
    } catch {
      showToast('Failed to save timer entry', 'error');
    }
  };

  const saveManualEntry = async () => {
    setSaving(true);
    try {
      const durationMinutes = Number(mHours) * 60 + Number(mMinutes);
      const startTime = new Date(mDate);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
      const res = await timeService.createTimeEntry({
        project: mProject,
        description: mDesc,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes,
        billable: true,
        source: 'manual'
      });
      setEntries((prev) => [res.data, ...prev]);
      showToast('Manual entry added');
      setManualOpen(false);
      setMDesc('');
    } catch {
      showToast('Failed to add entry', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await timeService.deleteTimeEntry(deleteTarget._id);
      setEntries((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      showToast('Entry deleted');
    } catch {
      showToast('Failed to delete entry', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const stats = useMemo(() => {
    const sumSince = (since: Date) =>
      entries.filter((e) => new Date(e.startTime) >= since).reduce((s, e) => s + e.durationMinutes, 0);
    const billable = entries.filter((e) => e.billable).reduce((s, e) => s + e.durationMinutes, 0);
    return {
      today: sumSince(startOfDay()),
      week: sumSince(startOfWeek()),
      month: sumSince(startOfMonth()),
      billable
    };
  }, [entries]);

  const weeklyChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monday = startOfWeek();
    return days.map((label, i) => {
      const dayStart = new Date(monday); dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
      const mins = entries
        .filter((e) => new Date(e.startTime) >= dayStart && new Date(e.startTime) < dayEnd)
        .reduce((s, e) => s + e.durationMinutes, 0);
      return { day: label, hours: Math.round((mins / 60) * 10) / 10 };
    });
  }, [entries]);

  const projectName = (e: TimeEntry) => (typeof e.project === 'string' ? '' : e.project?.name);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Hours", value: formatMinutes(stats.today), color: 'bg-primary-50 text-primary-700' },
          { label: 'This Week', value: formatMinutes(stats.week), color: 'bg-blue-50 text-blue-700' },
          { label: 'This Month', value: formatMinutes(stats.month), color: 'bg-green-50 text-green-700' },
          { label: 'Billable Hours', value: formatMinutes(stats.billable), color: 'bg-orange-50 text-orange-700' }
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-semibold text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={timerProject}
              onChange={(e) => setTimerProject(e.target.value)}
              disabled={timerRunning}
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white disabled:bg-slate-50"
            >
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <input
              value={timerDesc}
              onChange={(e) => setTimerDesc(e.target.value)}
              placeholder="What are you working on?"
              disabled={timerRunning}
              className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-50"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-mono font-semibold text-slate-900 tabular-nums w-28 text-center">
              {formatElapsed(elapsed)}
            </span>
            {timerRunning ? (
              <Button variant="danger" icon={<Square className="w-4 h-4" />} onClick={stopTimer}>Stop</Button>
            ) : (
              <Button icon={<Play className="w-4 h-4" />} onClick={startTimer}>Start Timer</Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">This Week's Hours</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [`${v}h`, 'Hours']} />
            <Bar dataKey="hours" fill="#5b34e6" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Time History</h3>
          <Button size="sm" variant="outline" icon={<Plus className="w-4 h-4" />} onClick={() => setManualOpen(true)}>
            Manual Entry
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
        ) : entries.length === 0 ? (
          <EmptyState icon={<Clock className="w-6 h-6" />} title="No time logged yet" description="Start a timer or add a manual entry to begin tracking billable hours." />
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((e) => (
              <div key={e._id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{e.description || 'Untitled entry'}</p>
                  <p className="text-xs text-slate-400">{projectName(e)} • {formatDate(e.startTime)}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">{e.source}</span>
                {!e.billable && <span className="text-xs text-slate-400">Non-billable</span>}
                <span className="text-sm font-medium text-slate-700 w-20 text-right">{formatMinutes(e.durationMinutes)}</span>
                <button onClick={() => setDeleteTarget(e)} className="text-slate-300 hover:text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Add Manual Time Entry">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
            <select value={mProject} onChange={(e) => setMProject(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <Input label="Description" value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="What did you work on?" />
          <Input label="Date" type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hours" type="number" min={0} value={mHours} onChange={(e) => setMHours(e.target.value)} />
            <Input label="Minutes" type="number" min={0} max={59} value={mMinutes} onChange={(e) => setMMinutes(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button onClick={saveManualEntry} loading={saving} disabled={!mDesc || !mProject}>Add Entry</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete time entry?"
        message="This will permanently remove this logged time entry."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
