import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, MapPin, Pencil, Briefcase, FileText, FolderOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge, { statusColor } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ClientFormModal from '../components/forms/ClientFormModal';
import { useToast } from '../context/ToastContext';
import * as clientService from '../services/clientService';
import type { Client, Project, Invoice, FileItem } from '../types';
import { formatCurrency, formatDate, formatFileSize, initials } from '../utils/format';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState<{ client: Client; projects: Project[]; invoices: Invoice[]; files: FileItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await clientService.getClient(id);
      setData(res.data as any);
    } catch {
      showToast('Failed to load client', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]); // eslint-disable-line

  if (loading || !data) {
    return <div className="animate-pulse space-y-4"><div className="h-40 bg-slate-200 rounded-2xl" /><div className="h-64 bg-slate-200 rounded-2xl" /></div>;
  }

  const { client, projects, invoices, files } = data;
  const activeProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Pending');
  const completedProjects = projects.filter((p) => p.status === 'Completed');

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/clients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center text-xl font-bold">
              {initials(client.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">{client.name}</h2>
                <Badge color={statusColor(client.status)}>{client.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">{client.company}</p>
            </div>
          </div>
          <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => setEditOpen(true)}>Edit Client</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <InfoItem icon={Mail} label="Email" value={client.email} />
          <InfoItem icon={Phone} label="Phone" value={client.phone || '—'} />
          <InfoItem icon={Globe} label="Website" value={client.website || '—'} />
          <InfoItem icon={MapPin} label="Address" value={client.address || '—'} />
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-700">{client.notes}</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatMini icon={Briefcase} label="Active Projects" value={activeProjects.length} />
        <StatMini icon={FileText} label="Invoices" value={invoices.length} />
        <StatMini icon={FolderOpen} label="Files" value={files.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Projects</h3>
          <div className="space-y-3">
            {projects.length === 0 && <p className="text-sm text-slate-400">No projects yet</p>}
            {projects.map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">Due {formatDate(p.deadline)}</p>
                </div>
                <Badge color={statusColor(p.status)}>{p.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Invoices</h3>
          <div className="space-y-3">
            {invoices.length === 0 && <p className="text-sm text-slate-400">No invoices yet</p>}
            {invoices.map((inv) => (
              <Link key={inv._id} to={`/invoices/${inv._id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">Due {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                  <Badge color={statusColor(inv.status)}>{inv.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {files.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((f) => (
              <div key={f._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold uppercase text-slate-500">
                  {f.type}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(f.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ClientFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={client}
        onSubmit={async (data) => {
          await clientService.updateClient(client._id, data);
          showToast('Client updated successfully');
          fetchData();
        }}
      />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5" /> {label}</p>
      <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
    </div>
  );
}

function StatMini({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
