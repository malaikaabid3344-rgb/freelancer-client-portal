import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, MoreVertical, Pencil, Trash2, Eye, CheckCircle2, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge, { statusColor } from '../components/ui/Badge';
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable, SkeletonCard } from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import InvoiceFormModal from '../components/forms/InvoiceFormModal';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import * as invoiceService from '../services/invoiceService';
import * as clientService from '../services/clientService';
import * as projectService from '../services/projectService';
import type { Invoice, Client, Project } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const PAGE_SIZE = 8;

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getInvoices({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status !== 'All' ? { status } : {})
      });
      setInvoices(res.data);
    } catch {
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clientService.getClients().then((r) => setClients(r.data)).catch(() => {});
    projectService.getProjects().then((r) => setProjects(r.data)).catch(() => {});
  }, []);
  useEffect(() => { fetchInvoices(); }, [debouncedSearch, status]); // eslint-disable-line
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return invoices.slice(start, start + PAGE_SIZE);
  }, [invoices, page]);
  const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));

  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter((i) => i.status === 'Paid').length,
    pending: invoices.filter((i) => i.status === 'Pending').length,
    overdue: invoices.filter((i) => i.status === 'Overdue').length
  }), [invoices]);

  const clientName = (c: Invoice['client']) => (typeof c === 'string' ? clients.find((cl) => cl._id === c)?.name : c?.name) || '—';
  const projectName = (p?: Invoice['project']) => (!p ? '—' : typeof p === 'string' ? projects.find((pr) => pr._id === p)?.name : p?.name) || '—';

  const handleCreate = async (data: Partial<Invoice>) => {
    await invoiceService.createInvoice(data);
    showToast('Invoice created successfully');
    fetchInvoices();
  };
  const handleUpdate = async (data: Partial<Invoice>) => {
    if (!editing) return;
    await invoiceService.updateInvoice(editing._id, data);
    showToast('Invoice updated successfully');
    fetchInvoices();
  };
  const handleMarkPaid = async (inv: Invoice) => {
    try {
      await invoiceService.markInvoicePaid(inv._id);
      showToast(`Invoice ${inv.invoiceNumber} marked as paid`);
      fetchInvoices();
    } catch {
      showToast('Failed to update invoice', 'error');
    }
  };
  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await invoiceService.deleteInvoice(deleting._id);
      showToast('Invoice deleted');
      setDeleting(null);
      fetchInvoices();
    } catch {
      showToast('Failed to delete invoice', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading && invoices.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Invoices" value={stats.total} color="primary" icon={<FileText className="w-5 h-5" />} />
          <StatCard label="Paid" value={stats.paid} color="success" icon={<CheckCircle2 className="w-5 h-5" />} />
          <StatCard label="Pending" value={stats.pending} color="pending" icon={<FileText className="w-5 h-5" />} />
          <StatCard label="Overdue" value={stats.overdue} color="danger" icon={<FileText className="w-5 h-5" />} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600">
            <option>All</option>
            {['Draft', 'Pending', 'Paid', 'Overdue'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Create Invoice
        </Button>
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="No invoices found"
            description={debouncedSearch || status !== 'All' ? 'Try adjusting your search or filters.' : 'Create your first invoice to bill a client.'}
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Create Invoice</Button>}
          />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Invoice #</Th>
                  <Th>Client</Th>
                  <Th>Project</Th>
                  <Th>Issue Date</Th>
                  <Th>Due Date</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {paginated.map((inv) => (
                  <Tr key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)}>
                    <Td className="font-medium text-slate-900">{inv.invoiceNumber}</Td>
                    <Td>{clientName(inv.client)}</Td>
                    <Td className="text-slate-600">{projectName(inv.project)}</Td>
                    <Td className="text-slate-600">{formatDate(inv.issueDate)}</Td>
                    <Td className="text-slate-600">{formatDate(inv.dueDate)}</Td>
                    <Td className="font-medium text-slate-900">{formatCurrency(inv.total)}</Td>
                    <Td><Badge color={statusColor(inv.status)}>{inv.status}</Badge></Td>
                    <Td className="text-right" onClick={(e: any) => e.stopPropagation()}>
                      <Dropdown trigger={<button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><MoreVertical className="w-4 h-4" /></button>}>
                        <DropdownItem onClick={() => navigate(`/invoices/${inv._id}`)}><Eye className="w-4 h-4" /> View / Print</DropdownItem>
                        <DropdownItem onClick={() => { setEditing(inv); setModalOpen(true); }}><Pencil className="w-4 h-4" /> Edit</DropdownItem>
                        {inv.status !== 'Paid' && (
                          <DropdownItem onClick={() => handleMarkPaid(inv)}><CheckCircle2 className="w-4 h-4" /> Mark as Paid</DropdownItem>
                        )}
                        <DropdownItem onClick={() => navigate(`/invoices/${inv._id}`)}><Download className="w-4 h-4" /> Download</DropdownItem>
                        <DropdownItem danger onClick={() => setDeleting(inv)}><Trash2 className="w-4 h-4" /> Delete</DropdownItem>
                      </Dropdown>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={invoices.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </Card>

      <InvoiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        clients={clients}
        projects={projects}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete invoice?"
        message={`This will permanently remove invoice "${deleting?.invoiceNumber}".`}
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
    success: 'bg-green-50 text-success',
    danger: 'bg-red-50 text-danger'
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
