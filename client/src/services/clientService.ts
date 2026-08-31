import api from './api';
import type { Client } from '../types';

export const getClients = (params?: Record<string, string>) => api.get<Client[]>('/clients', { params });
export const getClient = (id: string) => api.get(`/clients/${id}`);
export const createClient = (data: Partial<Client>) => api.post<Client>('/clients', data);
export const updateClient = (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data);
export const deleteClient = (id: string) => api.delete(`/clients/${id}`);
