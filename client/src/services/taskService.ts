import api from './api';
import type { Task } from '../types';

export const getTasks = (params?: Record<string, string>) => api.get<Task[]>('/tasks', { params });
export const createTask = (data: Partial<Task>) => api.post<Task>('/tasks', data);
export const updateTask = (id: string, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);
