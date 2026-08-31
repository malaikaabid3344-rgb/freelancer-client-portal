import api from './api';
import type { User } from '../types';

export const login = (email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/login', { email, password });

export const register = (name: string, email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/register', { name, email, password });

export const getMe = () => api.get<{ user: User }>('/auth/me');

export const updateMe = (data: Partial<User>) => api.put<{ user: User }>('/auth/me', data);

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.put('/auth/password', { currentPassword, newPassword });
