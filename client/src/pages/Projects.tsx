import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Briefcase, MoreVertical, Pencil, Trash2, Eye, CalendarDays, Layers
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge, { statusColor } from '../components/ui/Badge';
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable, SkeletonCard } from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import ProjectFormModal from '../components/forms/ProjectFormModal';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import * as projectService from '../services/projectService';
import * as clientService from '../services/clientService';
import type { Project, Client } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const PAGE_SIZE = 8;

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjects({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status !== 'All' ? { status } : {}),
        ...(clientFilter !== 'All' ? { client: clientFilter } : {})
      });
      setProjects(res.data);
    } catch {
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clientService.getClients().then((res) => setClients(res.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchProjects(); }, [debouncedSearch, status, clientFilter]); // eslint-disable-line
  useEffect(() => { setPage(1); }, [debouncedSearch, status, clientFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return projects.slice(start, start + PAGE_SIZE);
  }, [projects, page]);

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));

  const stats = useMemo(() => ({
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'In Progress').length,
    pending: projects.filter((p) => p.status === 'Pending').length,
    completed: projects.filter((p) => p.status === 'Completed').length
  }), [projects]);

  const clientName = (c: Project['client']) => (typeof c === 'string' ? clients.find((cl) => cl._id === c)?.name : c?.name) || '—';

  const handleCreate = async (data: Partial<Project>) => {
    await projectService.createProject(data);
    showToast('Project created successfully');
    fetchProjects();
  };

  const handleUpdate = async (data: Partial<Project>) => {
    if (!editing) return;
    await projectService.updateProject(editing._id, data);
    showToast('Project updated successfully');
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await projectService.deleteProject(deleting._id);
      showToast('Project deleted');
      setDeleting(null);
      fetchProjects();
    } catch {
      showToast('Failed to delete project', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={stats.total} color="primary" icon={<Briefcase className="w-5 h-5" />} />
          <StatCard label="In Progress" value={stats.inProgress} color="info" icon={<Layers className="w-5 h-5" />} />
          <StatCard label="Pending" value={stats.pending} color="pending" icon={<CalendarDays className="w-5 h-5" />} />
          <StatCard label="Completed" value={stats.completed} color="success" icon={<Briefcase className="w-5 h-5" />} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600">
            <option>All</option>
            {['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600">
            <option value="All">All Clients</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          New Project
        </Button>
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No projects found"
            description={debouncedSearch || status !== 'All' ? 'Try adjusting your search or filters.' : 'Create your first project to get started.'}
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>New Project</Button>}
          />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Project</Th>
                  <Th>Client</Th>
                  <Th>Status</Th>
                  <Th>Progress</Th>
                  <Th>Deadline</Th>
                  <Th>Budget</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {paginated.map((p) => (
                  <Tr key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
                    <Td>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[220px]">{p.description}</p>
                    </Td>
                    <Td>{clientName(p.client)}</Td>
                    <Td><Badge color={statusColor(p.status)}>{p.status}</Badge></Td>
                    <Td>
                      <div className="w-28">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{p.progress}%</p>
                      </div>
                    </Td>
                    <Td className="text-slate-600">{formatDate(p.deadline)}</Td>
                    <Td className="font-medium text-slate-900">{formatCurrency(p.budget)}</Td>
                    <Td className="text-right" onClick={(e: any) => e.stopPropagation()}>
                      <Dropdown trigger={<button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><MoreVertical className="w-4 h-4" /></button>}>
                        <DropdownItem onClick={() => navigate(`/projects/${p._id}`)}><Eye className="w-4 h-4" /> View Details</DropdownItem>
                        <DropdownItem onClick={() => { setEditing(p); setModalOpen(true); }}><Pencil className="w-4 h-4" /> Edit</DropdownItem>
                        <DropdownItem danger onClick={() => setDeleting(p)}><Trash2 className="w-4 h-4" /> Delete</DropdownItem>
                      </Dropdown>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={projects.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </Card>

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        clients={clients}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete project?"
        message={`This will permanently remove "${deleting?.name}" and cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const bg: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    info: 'bg-blue-50 text-info',
    pending: 'bg-orange-50 text-pending',
    success: 'bg-green-50 text-success'
  };
  return (
    <Card className="p-4 lg:p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
