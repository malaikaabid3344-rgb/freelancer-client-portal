import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { Client, Invoice, InvoiceItem, Project } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Invoice>) => Promise<void>;
  initial?: Invoice | null;
  clients: Client[];
  projects: Project[];
}

const emptyItem: InvoiceItem = { service: '', quantity: 1, rate: 0 };

export default function InvoiceFormModal({ open, onClose, onSubmit, initial, clients, projects }: Props) {
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('Pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const client = initial?.client;
      const project = initial?.project;
      setClientId(typeof client === 'string' ? client : client?._id || '');
      setProjectId(typeof project === 'string' ? project : project?._id || '');
      setItems(initial?.items?.length ? initial.items : [{ ...emptyItem }]);
      setTax(initial?.tax ?? 0);
      setDiscount(initial?.discount ?? 0);
      setIssueDate(initial?.issueDate ? initial.issueDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setDueDate(initial?.dueDate ? initial.dueDate.slice(0, 10) : '');
      setNotes(initial?.notes || '');
      setStatus(initial?.status || 'Pending');
    }
  }, [open, initial]);

  const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0);
  const afterDiscount = subtotal - (subtotal * discount) / 100;
  const total = afterDiscount + (afterDiscount * tax) / 100;

  const updateItem = (idx: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        client: clientId,
        project: projectId || undefined,
        items: items.filter((i) => i.service),
        tax,
        discount,
        issueDate,
        dueDate,
        notes,
        status
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const c = p.client;
    const pcid = typeof c === 'string' ? c : c?._id;
    return !clientId || pcid === clientId;
  });

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Invoice' : 'Create Invoice'} size="xl">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
              <option value="">Select a client</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.company}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project (optional)</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
              <option value="">None</option>
              {filteredProjects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">Services</label>
            <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setItems((p) => [...p, { ...emptyItem }])}>
              Add item
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  className="col-span-6 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Service description"
                  value={item.service}
                  onChange={(e) => updateItem(idx, 'service', e.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  className="col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                />
                <input
                  type="number"
                  min={0}
                  className="col-span-3 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateItem(idx, 'rate', Number(e.target.value))}
                />
                <button
                  className="col-span-1 text-slate-400 hover:text-danger flex justify-center"
                  onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Issue date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input label="Tax (%)" type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
          <Input label="Discount (%)" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Invoice['status'])} className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm">
            {['Draft', 'Pending', 'Paid', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm"
            placeholder="Payment terms, thank-you note, etc."
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Discount ({discount}%)</span><span>-${(subtotal * discount / 100).toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-600"><span>Tax ({tax}%)</span><span>+${(afterDiscount * tax / 100).toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-slate-900 pt-1.5 border-t border-slate-200"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading} disabled={!clientId || !dueDate}>
          {initial ? 'Save Changes' : 'Create Invoice'}
        </Button>
      </div>
    </Modal>
  );
}
