import api from './api';
import type { FileItem } from '../types';

export const getFiles = (params?: Record<string, string>) => api.get<FileItem[]>('/files', { params });
export const uploadFile = (formData: FormData) =>
  api.post<FileItem>('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateFile = (id: string, data: Partial<FileItem>) => api.put<FileItem>(`/files/${id}`, data);
export const deleteFile = (id: string) => api.delete(`/files/${id}`);
export const downloadFileUrl = (id: string) =>
  `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api')}/files/${id}/download`;
