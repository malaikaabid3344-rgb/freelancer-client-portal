import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { Client, Project } from '../../types';

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  initial?: Project | null;
  clients: Client[];
}

const empty = {
  name: '',
  description: '',
  client: '',
  budget: 0,
  startDate: '',
  deadline: '',
  status: 'Pending' as Project['status'],
  progress: 0,
  priority: 'Medium' as Project['priority']
};

export default function ProjectFormModal({ open, onClose, onSubmit, initial, clients }: ProjectFormModalProps) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        client: typeof initial.client === 'string' ? initial.client : initial.client._id,
        budget: initial.budget,
        startDate: initial.startDate?.slice(0, 10) || '',
        deadline: initial.deadline?.slice(0, 10) || '',
        status: initial.status,
        progress: initial.progress,
        priority: initial.priority
      });
    } else {
      setForm(empty);
    }
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Project' : 'Create New Project'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Project Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client</label>
            <select
              required
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Budget ($)"
            type="number"
            min={0}
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm"
            >
              {['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Project['priority'] })}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm"
            >
              {['Low', 'Medium', 'High'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <Input
            label="Progress (%)"
            type="number"
            min={0}
            max={100}
            value={form.progress}
            onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Project'}</Button>
        </div>
      </form>
    </Modal>
  );
}
