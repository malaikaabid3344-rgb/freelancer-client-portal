import { useEffect, useRef, useState } from 'react';
import { Search, Send, Paperclip, MessageSquare } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import * as messageService from '../services/messageService';
import type { Conversation, Message } from '../types';
import clsx from 'clsx';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const fetchConversations = async () => {
    setLoadingConvos(true);
    try {
      const res = await messageService.getConversations();
      setConversations(res.data);
      if (!selected && res.data.length) setSelected(res.data[0]);
    } catch {
      showToast('Failed to load conversations', 'error');
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchMessages = async (clientId: string) => {
    setLoadingMessages(true);
    try {
      const res = await messageService.getMessagesForClient(clientId);
      setMessages(res.data);
    } catch {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []); // eslint-disable-line
  useEffect(() => {
    if (selected) fetchMessages(selected.client._id);
  }, [selected?.client._id]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !selected) return;
    setSending(true);
    const text = draft;
    setDraft('');
    try {
      const res = await messageService.sendMessage(selected.client._id, text);
      setMessages((prev) => [...prev, res.data]);
      fetchConversations();
    } catch {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const filteredConvos = conversations.filter((c) =>
    c.client.name.toLowerCase().includes(search.toLowerCase()) ||
    c.client.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="h-[calc(100vh-140px)] flex overflow-hidden">
      {/* Conversation list */}
      <div className={clsx('w-full sm:w-72 border-r border-slate-100 flex flex-col shrink-0', selected && 'hidden sm:flex')}>
        <div className="p-3.5 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filteredConvos.length === 0 ? (
            <EmptyState icon={<MessageSquare className="w-6 h-6" />} title="No conversations" description="Start messaging your clients from their profile." />
          ) : (
            filteredConvos.map((c) => (
              <button
                key={c.client._id}
                onClick={() => setSelected(c)}
                className={clsx(
                  'w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50',
                  selected?.client._id === c.client._id && 'bg-primary-50'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  {c.client.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.client.name}</p>
                    {c.lastMessage && <span className="text-xs text-slate-400 shrink-0">{timeAgo(c.lastMessage.createdAt)}</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.lastMessage?.text || 'No messages yet'}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className={clsx('flex-1 flex flex-col min-w-0', !selected && 'hidden sm:flex')}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={<MessageSquare className="w-6 h-6" />} title="Select a conversation" description="Choose a client from the list to view messages." />
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
              <button className="sm:hidden text-slate-500 text-sm" onClick={() => setSelected(null)}>←</button>
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                {selected.client.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{selected.client.name}</p>
                <p className="text-xs text-slate-500">{selected.client.company}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {loadingMessages ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-2/3" />)}
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className={clsx('flex', m.sender === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={clsx(
                        'max-w-[75%] sm:max-w-sm rounded-2xl px-4 py-2.5 text-sm',
                        m.sender === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                      )}
                    >
                      <p>{m.text}</p>
                      <p className={clsx('text-[10px] mt-1', m.sender === 'user' ? 'text-primary-100' : 'text-slate-400')}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3.5 border-t border-slate-100 flex items-center gap-2">
              <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
