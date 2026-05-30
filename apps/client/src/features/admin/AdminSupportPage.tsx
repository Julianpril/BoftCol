import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function isAuthenticatedAdmin(): boolean {
  const token = sessionStorage.getItem('adminToken');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

interface SessionSummary {
  id: string;
  clientName: string | null;
  isHumanTakeover: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage: { content: string; role: string; createdAt: string } | null;
  unreadCount: number;
}

interface SupportMessage {
  id: string;
  role: string;
  content: string;
  sentByAdmin: boolean;
  createdAt: string;
}

export default function AdminSupportPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('adminToken') || '';

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const sessionsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticatedAdmin()) {
    navigate('/admin/login');
    return null;
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/support/admin/sessions', { headers: authHeaders });
      const data: SessionSummary[] = await res.json();
      setSessions(data);
      if (selectedId) {
        const updated = data.find(s => s.id === selectedId);
        if (updated) setSelectedSession(updated);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/support/${sessionId}/poll`);
      const data = await res.json();
      setMessages(data.messages);
      setSelectedSession(prev => prev ? { ...prev, isHumanTakeover: data.isHumanTakeover } : prev);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    sessionsIntervalRef.current = setInterval(fetchSessions, 5000);
    return () => {
      if (sessionsIntervalRef.current) clearInterval(sessionsIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    if (!selectedId) return;
    fetchMessages(selectedId);
    chatIntervalRef.current = setInterval(() => fetchMessages(selectedId), 3000);
    return () => {
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectSession = (s: SessionSummary) => {
    setSelectedId(s.id);
    setSelectedSession(s);
    setMessages([]);
    setReplyText('');
  };

  const handleTakeover = async () => {
    if (!selectedId) return;
    await fetch(`/api/support/admin/${selectedId}/takeover`, { method: 'POST', headers: authHeaders });
    setSelectedSession(prev => prev ? { ...prev, isHumanTakeover: true } : prev);
  };

  const handleRelease = async () => {
    if (!selectedId) return;
    await fetch(`/api/support/admin/${selectedId}/release`, { method: 'POST', headers: authHeaders });
    setSelectedSession(prev => prev ? { ...prev, isHumanTakeover: false } : prev);
  };

  const handleSend = async () => {
    if (!selectedId || !replyText.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/support/admin/${selectedId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      setReplyText('');
      await fetchMessages(selectedId);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin} min`;
    return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body-md">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 bg-surface-container-lowest border-r border-surface-variant z-50">
        <div className="px-6 py-8">
          <span className="text-headline-md font-headline-md font-black text-primary-container">BOFT ADMIN</span>
        </div>
        <nav className="flex flex-col space-y-2 flex-1">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Pedidos</span>
          </button>
          <button onClick={() => navigate('/admin/codes')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="font-body-md text-body-md">Códigos</span>
          </button>
          <a className="flex items-center gap-4 bg-primary-container text-on-primary-container rounded-r-full py-4 px-6 font-bold translate-x-1 transition-transform">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-body-md text-body-md">Soporte</span>
          </a>
          <button onClick={() => navigate('/admin/settings')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </button>
        </nav>
        <div className="px-6 pb-6">
          <button onClick={() => { sessionStorage.removeItem('adminToken'); window.location.href = '/admin/login'; }} className="w-full flex items-center justify-center gap-2 py-2 bg-surface-variant text-on-surface hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 flex h-screen overflow-hidden">
        {/* Session list */}
        <div className="w-72 shrink-0 border-r border-outline-variant/20 flex flex-col h-full">
          <div className="px-4 py-5 border-b border-outline-variant/20 shrink-0">
            <h1 className="font-black text-lg text-primary-container">Chats de Soporte</h1>
            <p className="text-on-surface-variant text-xs mt-0.5">{sessions.length} sesiones</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm mt-10 px-4">No hay sesiones aún.</p>
            )}
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => selectSession(s)}
                className={`w-full text-left px-4 py-4 border-b border-outline-variant/10 hover:bg-surface-container transition-colors ${selectedId === s.id ? 'bg-surface-container' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-on-surface text-sm truncate">
                    {s.clientName || 'Sesión anónima'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {s.isHumanTakeover && <span className="w-2 h-2 rounded-full bg-amber-400" title="Admin en control" />}
                    {s.unreadCount > 0 && (
                      <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{s.unreadCount}</span>
                    )}
                  </div>
                </div>
                <p className="text-on-surface-variant text-xs truncate">{s.lastMessage?.content || '—'}</p>
                <p className="text-on-surface-variant/50 text-[10px] mt-1">{formatTime(s.updatedAt)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation panel */}
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">support_agent</span>
              <p className="text-sm">Selecciona una sesión para ver la conversación</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
              <div>
                <h2 className="font-bold text-on-surface">{selectedSession.clientName || 'Sesión anónima'}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {selectedSession.isHumanTakeover ? '👤 Admin en control' : '🤖 Bot activo'}
                </p>
              </div>
              {selectedSession.isHumanTakeover ? (
                <button onClick={handleRelease} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant text-on-surface text-sm font-semibold hover:bg-outline-variant transition-colors">
                  <span className="material-symbols-outlined text-base">smart_toy</span>
                  Ceder al bot
                </button>
              ) : (
                <button onClick={handleTakeover} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-on-primary-container text-sm font-semibold hover:opacity-90 transition-opacity">
                  <span className="material-symbols-outlined text-base">support_agent</span>
                  Tomar control
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map((msg, i) => {
                const isFirstAdminMsg = msg.sentByAdmin && !messages.slice(0, i).some(m => m.sentByAdmin);
                return (
                  <div key={msg.id}>
                    {isFirstAdminMsg && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-outline-variant/30" />
                        <span className="text-[10px] text-on-surface-variant tracking-wider uppercase">Admin tomó el control</span>
                        <div className="flex-1 h-px bg-outline-variant/30" />
                      </div>
                    )}
                    <div className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-surface-container text-on-surface rounded-bl-sm'
                          : msg.sentByAdmin
                          ? 'bg-primary-container text-on-primary-container rounded-br-sm'
                          : 'bg-surface-container-high text-on-surface rounded-br-sm'
                      }`}>
                        <p className="text-[10px] font-semibold mb-1 opacity-60">
                          {msg.role === 'user' ? 'Cliente' : msg.sentByAdmin ? 'Tú' : 'Bot'}
                        </p>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Admin input — only when in control */}
            {selectedSession.isHumanTakeover && (
              <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-lowest flex gap-3 shrink-0">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Escribe tu respuesta al cliente... (Enter para enviar)"
                  rows={2}
                  className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface text-sm resize-none focus:outline-none focus:border-primary-container transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="px-5 py-2.5 bg-primary-container text-on-primary-container rounded-xl font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity self-end"
                >
                  {sending ? '...' : 'Enviar'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
