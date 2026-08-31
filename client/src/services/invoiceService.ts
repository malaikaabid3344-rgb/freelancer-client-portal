import api from './api';
import type { Invoice } from '../types';

export const getInvoices = (params?: Record<string, string>) => api.get<Invoice[]>('/invoices', { params });
export const getInvoice = (id: string) => api.get<Invoice>(`/invoices/${id}`);
export const createInvoice = (data: Partial<Invoice>) => api.post<Invoice>('/invoices', data);
export const updateInvoice = (id: string, data: Partial<Invoice>) => api.put<Invoice>(`/invoices/${id}`, data);
export const deleteInvoice = (id: string) => api.delete(`/invoices/${id}`);
export const markInvoicePaid = (id: string) => api.put<Invoice>(`/invoices/${id}/mark-paid`);
