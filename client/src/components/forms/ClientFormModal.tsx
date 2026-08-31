import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { Client } from '../../types';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  initial?: Client | null;
}

const emptyForm = {
  name: '', email: '', phone: '', company: '', website: '', address: '', notes: '', status: 'Active' as const
};

export default function ClientFormModal({ open, onClose, onSubmit, initial }: ClientFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...emptyForm, ...initial } : emptyForm);
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Client' : 'Add New Client'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>{initial ? 'Save Changes' : 'Add Client'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            className="w-full rounded-lg border border-slate-300 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>Active</option>
            <option>Lead</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-300 text-sm py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
    </Modal>
  );
}
