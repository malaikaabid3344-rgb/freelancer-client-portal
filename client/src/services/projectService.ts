import api from './api';
import type { Project } from '../types';

export const getProjects = (params?: Record<string, string>) => api.get<Project[]>('/projects', { params });
export const getProject = (id: string) => api.get(`/projects/${id}`);
export const createProject = (data: Partial<Project>) => api.post<Project>('/projects', data);
export const updateProject = (id: string, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);
