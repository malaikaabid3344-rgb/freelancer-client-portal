import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { Task, Project } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  initial?: Task | null;
  projects: Project[];
  defaultStatus?: Task['status'];
}

export default function TaskFormModal({ open, onClose, onSubmit, initial, projects, defaultStatus }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [status, setStatus] = useState<Task['status']>('To Do');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const proj = initial?.project;
      setTitle(initial?.title || '');
      setDescription(initial?.description || '');
      setProjectId(typeof proj === 'string' ? proj : proj?._id || projects[0]?._id || '');
      setPriority(initial?.priority || 'Medium');
      setStatus(initial?.status || defaultStatus || 'To Do');
      setDueDate(initial?.dueDate ? initial.dueDate.slice(0, 10) : '');
    }
  }, [open, initial, defaultStatus, projects]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ title, description, project: projectId, priority, status, dueDate, assignee: 'John Doe' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Task' : 'New Task'}>
      <div className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design homepage hero section" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
              {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
              {['To Do', 'In Progress', 'Review', 'Completed'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} disabled={!title || !projectId}>
          {initial ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </Modal>
  );
}
