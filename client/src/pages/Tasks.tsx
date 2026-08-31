import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, List, LayoutGrid, Trash2, Pencil, Calendar, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge, { statusColor } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import TaskFormModal from '../components/forms/TaskFormModal';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import * as taskService from '../services/taskService';
import * as projectService from '../services/projectService';
import type { Task, Project } from '../types';
import { formatDate, daysUntil } from '../utils/format';
import clsx from 'clsx';

const STATUSES: Task['status'][] = ['To Do', 'In Progress', 'Review', 'Completed'];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const debouncedSearch = useDebounce(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('To Do');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadProjects = async () => {
    const res = await projectService.getProjects();
    setProjects(res.data);
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      const res = await taskService.getTasks(params);
      setTasks(res.data);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { loadTasks(); }, [debouncedSearch, statusFilter, priorityFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = { 'To Do': [], 'In Progress': [], Review: [], Completed: [] };
    tasks.forEach((t) => map[t.status]?.push(t));
    return map;
  }, [tasks]);

  const handleCreate = (status?: Task['status']) => {
    setEditingTask(null);
    setDefaultStatus(status || 'To Do');
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const submitTask = async (data: Partial<Task>) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, data);
        showToast('Task updated');
      } else {
        await taskService.createTask(data);
        showToast('Task created');
      }
      loadTasks();
    } catch {
      showToast('Something went wrong', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget._id);
      showToast('Task deleted');
      setDeleteTarget(null);
      loadTasks();
    } catch {
      showToast('Failed to delete task', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const moveTask = async (task: Task, status: Task['status']) => {
    if (task.status === status) return;
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status } : t)));
    try {
      await taskService.updateTask(task._id, { status });
    } catch {
      showToast('Failed to move task', 'error');
      loadTasks();
    }
  };

  const projectName = (t: Task) => (typeof t.project === 'string' ? '' : t.project?.name);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white">
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white">
            <option value="All">All Priorities</option>
            {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={clsx('p-1.5 rounded-md', view === 'kanban' ? 'bg-white shadow-sm' : 'text-slate-500')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={clsx('p-1.5 rounded-md', view === 'list' ? 'bg-white shadow-sm' : 'text-slate-500')}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => handleCreate()}>New Task</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
      ) : tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No tasks yet"
            description="Create your first task to start tracking work across your projects."
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => handleCreate()}>New Task</Button>}
          />
        </Card>
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUSES.map((status) => (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('taskId');
                const task = tasks.find((t) => t._id === taskId);
                if (task) moveTask(task, status);
                setDragOverStatus(null);
              }}
              className={clsx(
                'rounded-2xl p-3 min-h-[200px] transition-colors',
                dragOverStatus === status ? 'bg-primary-50 ring-2 ring-primary-200' : 'bg-slate-100/70'
              )}
            >
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-sm font-semibold text-slate-700">{status}</p>
                <span className="text-xs bg-white px-2 py-0.5 rounded-full text-slate-500 border border-slate-200">
                  {grouped[status].length}
                </span>
              </div>
              <div className="space-y-2.5">
                {grouped[status].map((task) => {
                  const overdue = task.dueDate && daysUntil(task.dueDate) < 0 && task.status !== 'Completed';
                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('taskId', task._id)}
                      onClick={() => handleEdit(task)}
                      className="bg-white rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:shadow-card group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(task); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-danger shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 truncate">{projectName(task)}</p>
                      <div className="flex items-center justify-between">
                        <Badge color={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'pending' : 'slate'}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span className={clsx('text-xs flex items-center gap-1', overdue ? 'text-danger' : 'text-slate-400')}>
                            <Calendar className="w-3 h-3" /> {formatDate(task.dueDate, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => handleCreate(status)}
                  className="w-full text-xs text-slate-400 hover:text-primary-600 hover:bg-white/70 rounded-xl py-2 flex items-center justify-center gap-1 border border-dashed border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" /> Add task
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const overdue = task.dueDate && daysUntil(task.dueDate) < 0 && task.status !== 'Completed';
            return (
              <div key={task._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{task.title}</p>
                  <p className="text-xs text-slate-400">{projectName(task)}</p>
                </div>
                <Badge color={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'pending' : 'slate'}>{task.priority}</Badge>
                <Badge color={statusColor(task.status)}>{task.status}</Badge>
                {task.dueDate && (
                  <span className={clsx('text-xs w-24 shrink-0', overdue ? 'text-danger font-medium' : 'text-slate-500')}>
                    {formatDate(task.dueDate, { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <button onClick={() => handleEdit(task)} className="text-slate-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(task)} className="text-slate-400 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </Card>
      )}

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitTask}
        initial={editingTask}
        projects={projects}
        defaultStatus={defaultStatus}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task?"
        message={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
