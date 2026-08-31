import api from './api';
import type { TimeEntry } from '../types';

export const getTimeEntries = (params?: Record<string, string>) => api.get<TimeEntry[]>('/time-entries', { params });
export const createTimeEntry = (data: Partial<TimeEntry>) => api.post<TimeEntry>('/time-entries', data);
export const updateTimeEntry = (id: string, data: Partial<TimeEntry>) => api.put<TimeEntry>(`/time-entries/${id}`, data);
export const deleteTimeEntry = (id: string) => api.delete(`/time-entries/${id}`);
