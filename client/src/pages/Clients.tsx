import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MoreVertical, Pencil, Trash2, Eye, Mail, Phone, Building2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge, { statusColor } from '../components/ui/Badge';
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import ClientFormModal from '../components/forms/ClientFormModal';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import * as clientService from '../services/clientService';
import type { Client } from '../types';
import { initials } from '../utils/format';

const PAGE_SIZE = 8;

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await clientService.getClients({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status !== 'All' ? { status } : {})
      });
      setClients(res.data);
    } catch {
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [debouncedSearch, status]); // eslint-disable-line
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return clients.slice(start, start + PAGE_SIZE);
  }, [clients, page]);

  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));

  const handleCreate = async (data: Partial<Client>) => {
    await clientService.createClient(data);
    showToast('Client added successfully');
    fetchClients();
  };

  const handleUpdate = async (data: Partial<Client>) => {
    if (!editing) return;
    await clientService.updateClient(editing._id, data);
    showToast('Client updated successfully');
    fetchClients();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await clientService.deleteClient(deleting._id);
      showToast('Client deleted');
      setDeleting(null);
      fetchClients();
    } catch {
      showToast('Failed to delete client', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600"
          >
            <option>All</option>
            <option>Active</option>
            <option>Lead</option>
            <option>Inactive</option>
          </select>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add Client
        </Button>
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : clients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No clients found"
            description={debouncedSearch || status !== 'All' ? 'Try adjusting your search or filters.' : 'Add your first client to get started.'}
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Client</Button>}
          />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Company</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <tbody>
                {paginated.map((c) => (
                  <Tr key={c._id} onClick={() => navigate(`/clients/${c._id}`)}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-sm font-semibold shrink-0">
                          {initials(c.name)}
                        </div>
                        <span className="font-medium text-slate-900">{c.name}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {c.company || '—'}
                      </span>
                    </Td>
                    <Td>
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {c.email}</p>
                        {c.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {c.phone}</p>}
                      </div>
                    </Td>
                    <Td><Badge color={statusColor(c.status)}>{c.status}</Badge></Td>
                    <Td className="text-right" onClick={(e: any) => e.stopPropagation()}>
                      <Dropdown
                        trigger={<button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><MoreVertical className="w-4 h-4" /></button>}
                      >
                        <DropdownItem onClick={() => navigate(`/clients/${c._id}`)}><Eye className="w-4 h-4" /> View Details</DropdownItem>
                        <DropdownItem onClick={() => { setEditing(c); setModalOpen(true); }}><Pencil className="w-4 h-4" /> Edit</DropdownItem>
                        <DropdownItem danger onClick={() => setDeleting(c)}><Trash2 className="w-4 h-4" /> Delete</DropdownItem>
                      </Dropdown>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={clients.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </Card>

      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete client?"
        message={`This will permanently remove ${deleting?.name} and cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
