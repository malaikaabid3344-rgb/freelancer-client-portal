import api from './api';
import type { Conversation, Message } from '../types';

export const getConversations = () => api.get<Conversation[]>('/messages/conversations');
export const getMessagesForClient = (clientId: string) => api.get<Message[]>(`/messages/${clientId}`);
export const sendMessage = (clientId: string, text: string) =>
  api.post<Message>('/messages', { clientId, text });
