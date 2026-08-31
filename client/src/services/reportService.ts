import api from './api';

export const getEarningsReport = () => api.get('/reports/earnings');
export const getProjectsReport = () => api.get('/reports/projects');
export const getClientsReport = () => api.get('/reports/clients');
