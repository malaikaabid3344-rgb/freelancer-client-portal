export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  currency: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark';
  notificationPrefs: {
    email: boolean;
    projectUpdates: boolean;
    invoices: boolean;
    messages: boolean;
  };
}

export type ClientStatus = 'Active' | 'Inactive' | 'Lead';

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  address: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
}

export type ProjectStatus = 'Pending' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';

export interface Project {
  _id: string;
  name: string;
  description: string;
  client: Client | string;
  budget: number;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

export interface FileItem {
  _id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  project?: { _id: string; name: string } | string;
  sharedWithClient: boolean;
  downloads: number;
  updatedAt: string;
}

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export interface InvoiceItem {
  service: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client | string;
  project?: Project | string;
  items: InvoiceItem[];
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: { _id: string; name: string } | string;
  client?: { _id: string; name: string } | string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  status: TaskStatus;
  assignee: string;
}

export interface TimeEntry {
  _id: string;
  project: { _id: string; name: string } | string;
  task?: { _id: string; title: string } | string;
  description: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  billable: boolean;
  source: 'timer' | 'manual';
}

export interface Message {
  _id: string;
  client: string;
  sender: 'user' | 'client';
  text: string;
  attachment?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  client: { _id: string; name: string; company: string; avatar?: string };
  lastMessage: Message | null;
  unreadCount: number;
  messageCount: number;
}
