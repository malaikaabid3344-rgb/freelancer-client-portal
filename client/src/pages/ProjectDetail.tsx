import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, CheckSquare, FileText, FolderOpen, Pencil, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge, { statusColor } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProjectFormModal from '../components/forms/ProjectFormModal';
import * as projectService from '../services/projectService';
import * as clientService from '../services/clientService';
import { useToast } from '../context/ToastContext';
import type { Project, Task, FileItem, Invoice, Client } from '../types';
import { formatCurrency, formatDate, formatFileSize } from '../utils/format';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tasks' | 'files' | 'invoices'>('tasks');
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await projectService.getProject(id);
      setProject(res.data.project);
      setTasks(res.data.tasks);
      setFiles(res.data.files);
      setInvoices(res.data.invoices);
    } catch {
      showToast('Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line
  useEffect(() => { clientService.getClients().then((r) => setClients(r.data)).catch(() => {}); }, []);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-primary-600 animate-spin" /></div>;
  }
  if (!project) return null;

  const client = typeof project.client === 'string' ? null : project.client;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <Card className="p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
              <Badge color={statusColor(project.status)}>{project.status}</Badge>
              <Badge color={project.priority === 'High' ? 'danger' : project.priority === 'Medium' ? 'pending' : 'slate'}>
                {project.priority} priority
              </Badge>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl">{project.description}</p>
            {client && (
              <Link to={`/clients/${client._id}`} className="inline-block mt-3 text-sm text-primary-600 font-medium hover:text-primary-700">
                Client: {client.name} {client.company && `(${client.company})`}
              </Link>
            )}
          </div>
          <Button variant="outline" icon={<Pencil className="w-4 h-4" />} onClick={() => setEditOpen(true)}>Edit Project</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <Info label="Budget" value={formatCurrency(project.budget)} />
          <Info label="Start Date" value={formatDate(project.startDate)} />
          <Info label="Deadline" value={formatDate(project.deadline)} />
          <div>
            <p className="text-xs text-slate-500 mb-1.5">Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <span className="text-sm font-medium text-slate-900">{project.progress}%</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-slate-200">
        <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')} icon={<CheckSquare className="w-4 h-4" />} label={`Tasks (${tasks.length})`} />
        <TabButton active={tab === 'files'} onClick={() => setTab('files')} icon={<FolderOpen className="w-4 h-4" />} label={`Files (${files.length})`} />
        <TabButton active={tab === 'invoices'} onClick={() => setTab('invoices')} icon={<FileText className="w-4 h-4" />} label={`Invoices (${invoices.length})`} />
      </div>

      {tab === 'tasks' && (
        <Card className="divide-y divide-slate-100">
          {tasks.length === 0 ? <EmptyRow icon={<CheckSquare className="w-5 h-5" />} text="No tasks yet for this project." /> : tasks.map((t) => (
            <div key={t._id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-500">Due {formatDate(t.dueDate)}</p>
              </div>
              <Badge color={statusColor(t.status)}>{t.status}</Badge>
            </div>
          ))}
        </Card>
      )}

      {tab === 'files' && (
        <Card className="divide-y divide-slate-100">
          {files.length === 0 ? <EmptyRow icon={<FolderOpen className="w-5 h-5" />} text="No files uploaded for this project." /> : files.map((f) => (
            <div key={f._id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{f.name}</p>
                <p className="text-xs text-slate-500 uppercase">{f.type} · {formatFileSize(f.size)}</p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'invoices' && (
        <Card className="divide-y divide-slate-100">
          {invoices.length === 0 ? <EmptyRow icon={<FileText className="w-5 h-5" />} text="No invoices for this project yet." /> : invoices.map((inv) => (
            <Link key={inv._id} to={`/invoices/${inv._id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">{inv.invoiceNumber}</p>
                <p className="text-xs text-slate-500">Due {formatDate(inv.dueDate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.total)}</span>
                <Badge color={statusColor(inv.status)}>{inv.status}</Badge>
              </div>
            </Link>
          ))}
        </Card>
      )}

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={project}
        clients={clients}
        onSubmit={async (data) => {
          await projectService.updateProject(project._id, data);
          showToast('Project updated successfully');
          load();
        }}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {value}
      </p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  );
}
