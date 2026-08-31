import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload, Search, FolderOpen, MoreVertical, Trash2, Download, Share2,
  FileText, FileImage, FileSpreadsheet, FileArchive, File as FileIcon, HardDrive, Users2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable, SkeletonCard } from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import * as fileService from '../services/fileService';
import * as projectService from '../services/projectService';
import type { FileItem, Project } from '../types';
import { formatDate, formatFileSize } from '../utils/format';

const typeIcon: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  png: <FileImage className="w-4 h-4 text-blue-500" />,
  jpg: <FileImage className="w-4 h-4 text-blue-500" />,
  jpeg: <FileImage className="w-4 h-4 text-blue-500" />,
  docx: <FileText className="w-4 h-4 text-blue-600" />,
  xlsx: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
  zip: <FileArchive className="w-4 h-4 text-orange-500" />
};

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deleting, setDeleting] = useState<FileItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const debouncedSearch = useDebounce(search);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fileService.getFiles({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(projectFilter !== 'All' ? { project: projectFilter } : {}),
        ...(typeFilter !== 'All' ? { type: typeFilter } : {})
      });
      setFiles(res.data);
    } catch {
      showToast('Failed to load files', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { projectService.getProjects().then((r) => setProjects(r.data)).catch(() => {}); }, []);
  useEffect(() => { fetchFiles(); }, [debouncedSearch, projectFilter, typeFilter]); // eslint-disable-line

  const stats = useMemo(() => ({
    total: files.length,
    storage: files.reduce((sum, f) => sum + f.size, 0),
    shared: files.filter((f) => f.sharedWithClient).length,
    downloads: files.reduce((sum, f) => sum + f.downloads, 0)
  }), [files]);

  const projectName = (p: FileItem['project']) => (typeof p === 'string' ? projects.find((pr) => pr._id === p)?.name : p?.name) || '—';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await fileService.uploadFile(formData);
      showToast('File uploaded successfully');
      fetchFiles();
    } catch {
      showToast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await fileService.deleteFile(deleting._id);
      showToast('File deleted');
      setDeleting(null);
      fetchFiles();
    } catch {
      showToast('Failed to delete file', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = (file: FileItem) => {
    window.open(fileService.downloadFileUrl(file._id), '_blank');
  };

  const toggleShare = async (file: FileItem) => {
    try {
      await fileService.updateFile(file._id, { sharedWithClient: !file.sharedWithClient });
      showToast(file.sharedWithClient ? 'Unshared from client' : 'Shared with client');
      fetchFiles();
    } catch {
      showToast('Failed to update file', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {loading && files.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total Files" value={stats.total.toString()} icon={<FolderOpen className="w-5 h-5" />} color="primary" />
          <Stat label="Total Storage" value={formatFileSize(stats.storage)} icon={<HardDrive className="w-5 h-5" />} color="info" />
          <Stat label="Shared with Clients" value={stats.shared.toString()} icon={<Users2 className="w-5 h-5" />} color="success" />
          <Stat label="Downloads" value={stats.downloads.toString()} icon={<Download className="w-5 h-5" />} color="pending" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600">
            <option value="All">All Projects</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-600">
            <option value="All">All Types</option>
            {['pdf', 'png', 'jpg', 'docx', 'xlsx', 'zip'].map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        <Button icon={<Upload className="w-4 h-4" />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
          Upload File
        </Button>
      </div>

      <Card>
        {loading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : files.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-6 h-6" />}
            title="No files found"
            description={debouncedSearch ? 'Try a different search term.' : 'Upload your first file to get started.'}
            action={<Button icon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()}>Upload File</Button>}
          />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>File Name</Th>
                <Th>Project</Th>
                <Th>Size</Th>
                <Th>Last Modified</Th>
                <Th>Shared</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {files.map((f) => (
                <Tr key={f._id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      {typeIcon[f.type] || <FileIcon className="w-4 h-4 text-slate-400" />}
                      <span className="font-medium text-slate-900">{f.name}</span>
                    </div>
                  </Td>
                  <Td className="text-slate-600">{projectName(f.project)}</Td>
                  <Td className="text-slate-600">{formatFileSize(f.size)}</Td>
                  <Td className="text-slate-600">{formatDate(f.updatedAt)}</Td>
                  <Td>
                    <button
                      onClick={() => toggleShare(f)}
                      className={`text-xs px-2.5 py-1 rounded-full border ${f.sharedWithClient ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                    >
                      {f.sharedWithClient ? 'Shared' : 'Private'}
                    </button>
                  </Td>
                  <Td className="text-right">
                    <Dropdown trigger={<button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><MoreVertical className="w-4 h-4" /></button>}>
                      <DropdownItem onClick={() => handleDownload(f)}><Download className="w-4 h-4" /> Download</DropdownItem>
                      <DropdownItem onClick={() => toggleShare(f)}><Share2 className="w-4 h-4" /> {f.sharedWithClient ? 'Unshare' : 'Share with client'}</DropdownItem>
                      <DropdownItem danger onClick={() => setDeleting(f)}><Trash2 className="w-4 h-4" /> Delete</DropdownItem>
                    </Dropdown>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        title="Delete file?"
        message={`This will permanently remove "${deleting?.name}".`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const bg: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    info: 'bg-blue-50 text-info',
    success: 'bg-green-50 text-success',
    pending: 'bg-orange-50 text-pending'
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
