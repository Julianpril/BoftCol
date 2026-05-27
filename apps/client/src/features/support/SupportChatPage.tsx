import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  requiresReceipt: boolean;
  printCode?: string;
  createdAt: string;
}

export default function SupportChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('supportSessionId'));
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Arrancamos la sesión o cargamos el historial si ya existe
  useEffect(() => {
    const initSession = async () => {
      try {
        if (!sessionId) {
          const res = await fetch('/api/support/session', { method: 'POST' });
          const data = await res.json();
          setSessionId(data.id);
          localStorage.setItem('supportSessionId', data.id);
        } else {
          const res = await fetch(`/api/support/session/${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            setMessages(data.messages || []);
          } else {
            // La sesión no existe, creamos una nueva
            localStorage.removeItem('supportSessionId');
            setSessionId(null); // will trigger re-run
          }
        }
      } catch (error) {
        console.error('Error initializing support session:', error);
      }
    };
    initSession();
  }, [sessionId]);

  // Bajamos al final cada vez que llega un mensaje nuevo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = typeof customMessage === 'string' ? customMessage : inputValue;
    if (!textToSend.trim() || !sessionId || isLoading) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      requiresReceipt: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    if (typeof customMessage !== 'string') setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content: textToSend })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('sessionId', sessionId);

    try {
      const res = await fetch('/api/support/upload-receipt', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        await handleSendMessage("He subido el comprobante, por favor revísalo.");
      } else {
        alert("Error al analizar el comprobante: " + data.error);
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert("Error al subir el comprobante.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Barra superior */}
      <header className="bg-surface border-b border-outline-variant shadow-[0_4px_20px_rgba(207,241,0,0.1)] fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-4 md:px-6 h-16">
        <Link to="/" className="text-xl md:text-2xl font-bold text-primary-fixed tracking-tighter hover:opacity-80 transition-opacity">
          BOFT Colombia
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <button className="text-on-surface-variant hover:text-primary-fixed transition-colors active:scale-95 flex items-center">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary-fixed transition-colors active:scale-95 flex items-center">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Barra lateral */}
      <aside className="hidden md:flex flex-col h-screen fixed left-0 top-0 pt-20 bg-surface-container-low border-r border-outline-variant w-72 z-40 shadow-xl">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary-fixed">BOFT Support</div>
              <div className="text-xs font-semibold text-on-surface-variant opacity-70">AI Assistant Online</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link to="/support" className="flex items-center gap-4 bg-primary-fixed text-on-primary-fixed rounded-full px-4 py-3 mx-2 font-semibold text-sm">
            <span className="material-symbols-outlined">chat</span>
            Support Chat
          </Link>
          <Link to="/history" className="flex items-center gap-4 text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-highest rounded-full px-4 py-3 mx-2 transition-transform hover:translate-x-1 duration-200 font-semibold text-sm">
            <span className="material-symbols-outlined">history</span>
            Print History
          </Link>
          <Link to="/locations" className="flex items-center gap-4 text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-highest rounded-full px-4 py-3 mx-2 transition-transform hover:translate-x-1 duration-200 font-semibold text-sm">
            <span className="material-symbols-outlined">location_on</span>
            Locations
          </Link>
          <Link to="/help" className="flex items-center gap-4 text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-highest rounded-full px-4 py-3 mx-2 transition-transform hover:translate-x-1 duration-200 font-semibold text-sm">
            <span className="material-symbols-outlined">contact_support</span>
            Help Center
          </Link>
        </nav>
        <div className="p-4 mb-4 pb-20">
          <Link to="/upload" className="block text-center w-full py-4 bg-primary-fixed text-on-primary-fixed font-bold text-sm rounded-full shadow-[0_4px_15px_rgba(207,241,0,0.3)] hover:scale-105 transition-transform">
            Start New Print
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      {messages.some(m => m.printCode) ? (
        // PANTALLA DE ÉXITO
        <main className="pt-24 md:pl-72 min-h-screen flex flex-col items-center justify-center px-4 md:px-6 relative z-10">
          <div className="max-w-4xl w-full text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-fixed text-on-primary-fixed mb-6 shadow-[0_0_60px_rgba(207,241,0,0.15)]">
                <span className="material-symbols-outlined text-4xl!" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-primary-fixed mb-4">¡Pago validado con éxito!</h1>
              <p className="text-lg text-on-surface max-w-xl mx-auto">Aquí tienes tu código para imprimir tus fotos:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="md:col-span-2 bg-surface-container-low border border-outline-variant p-10 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_60px_rgba(207,241,0,0.15)] group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed opacity-5 blur-3xl rounded-full"></div>
                <span className="text-sm font-bold text-on-surface-variant mb-4 tracking-widest uppercase">CÓDIGO DE IMPRESIÓN</span>
                <div className="text-5xl md:text-6xl font-black text-primary-fixed select-all cursor-copy group-hover:scale-105 transition-transform">
                  {messages.find(m => m.printCode)?.printCode}
                </div>
                <div className="mt-8 flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined">content_copy</span>
                  <span className="text-sm font-medium">Toca para copiar</span>
                </div>
              </div>
              
              <div className="bg-surface-container-high border border-outline-variant p-8 rounded-xl flex flex-col justify-between text-left">
                <div>
                  <span className="material-symbols-outlined text-primary-fixed mb-4 text-3xl">photo_library</span>
                  <h4 className="text-2xl font-bold text-primary mb-2">Impresión Activa</h4>
                  <p className="text-base text-on-surface-variant">Formato Polaroid clásico con acabado brillante premium.</p>
                </div>
                <div className="pt-6 border-t border-outline-variant">
                  <p className="text-sm font-medium text-on-surface-variant">Válido por 48 horas</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 pb-20">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Link to="/upload" className="bg-primary-fixed text-on-primary-fixed px-12 py-5 rounded-full font-bold text-lg hover:scale-95 transition-transform w-full md:w-64 text-center">
                  Usar ahora
                </Link>
                <Link to="/locations" className="border-2 border-primary-fixed text-primary-fixed px-12 py-5 rounded-full font-bold text-lg hover:bg-primary-fixed hover:text-on-primary-fixed transition-all w-full md:w-64 text-center">
                  Ver ubicaciones
                </Link>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-highest/30 px-6 py-4 rounded-full border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary-fixed">info</span>
                <p className="text-base text-on-surface italic">Ingresa este código en cualquier cabina BOFT.</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // PANTALLA DEL CHAT
        <main className="md:ml-72 pt-16 h-screen flex flex-col bg-background relative z-10">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8 max-w-4xl mx-auto w-full custom-scrollbar pb-32"
          >
            {/* Input de archivo oculto */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />

            {messages.length === 0 && !isLoading && (
             <div className="flex flex-col items-center text-center py-10 mt-10">
               <div className="w-16 h-16 bg-primary-fixed/20 rounded-full flex items-center justify-center mb-4 text-primary-fixed">
                 <span className="material-symbols-outlined text-4xl">auto_awesome</span>
               </div>
               <h2 className="text-xl font-bold text-primary mb-2">¿Cómo te podemos ayudar?</h2>
               <p className="text-on-surface-variant">Escríbele a nuestro asistente de Inteligencia Artificial.</p>
             </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-3 md:gap-4'}`}>
              
              {/* Avatar de la IA */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[18px] text-on-primary-fixed">auto_awesome</span>
                </div>
              )}

              <div className={`space-y-4 max-w-[85%] ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                
                {/* Burbuja del mensaje */}
                <div className={`p-4 md:p-5 rounded-2xl border shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-surface-container-high border-outline-variant rounded-tr-sm' 
                    : 'bg-surface-container border-outline-variant rounded-tl-sm'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed text-on-surface whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                <span className="text-[10px] text-on-surface-variant opacity-70 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Widget para subir el comprobante */}
                {msg.requiresReceipt && (
                  <div className="bg-surface-container-lowest p-5 md:p-6 rounded-xl border border-outline-variant shadow-lg relative overflow-hidden group w-full mt-4">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed/5 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <h3 className="text-lg font-bold text-primary-fixed mb-4 text-center">Sube tu comprobante de pago aquí</h3>
                      
                      {/* Zona de arrastre */}
                      <div 
                        className="w-full py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors group/drop"
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23CFF100FF' stroke-width='2' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")",
                          borderRadius: "1rem"
                        }}
                      >
                        <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover/drop:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary-fixed text-3xl">cloud_upload</span>
                        </div>
                        <p className="text-on-surface-variant font-bold text-sm mb-1">Arrastra tu archivo aquí</p>
                        <p className="text-on-surface-variant/60 text-xs">o haz clic para buscar</p>
                      </div>

                      <div className="mt-5 flex gap-3 w-full">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex-1 py-3 bg-primary-fixed text-on-primary-fixed font-bold text-sm rounded-full hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          {isUploading ? 'Analizando...' : 'Seleccionar Archivo'}
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-12 h-12 flex items-center justify-center border-2 border-primary-fixed text-primary-fixed rounded-full hover:bg-primary-fixed/10 transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined">photo_camera</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-3 md:gap-4 animate-pulse">
               <div className="w-8 h-8 rounded-full bg-primary-fixed/50 flex items-center justify-center shrink-0"></div>
               <div className="bg-surface-container p-5 rounded-2xl rounded-tl-sm border border-outline-variant w-24 flex items-center justify-center gap-1">
                 <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}

          {/* Pista informativa */}
          <div className="pt-4 pb-12 flex items-center justify-center opacity-70">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">info</span>
              La validación suele tomar menos de 30 segundos.
            </div>
          </div>
        </div>

        {/* Área de escritura fija abajo */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-container-lowest border-t border-outline-variant md:px-12 pb-24 md:pb-4">
          <div className="max-w-4xl mx-auto flex items-end gap-3 md:gap-4">
            <div className="flex-1 bg-surface-container rounded-3xl p-1.5 pl-4 flex items-center border border-outline-variant focus-within:border-primary-fixed transition-colors shadow-inner">
              <textarea 
                className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 py-3 resize-none outline-none text-sm md:text-base max-h-32" 
                placeholder="Escribe un mensaje..."
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="p-3 text-on-surface-variant hover:text-primary-fixed transition-colors">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
            </div>
            <button 
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all shrink-0 ${
                inputValue.trim() && !isLoading
                 ? 'bg-primary-fixed text-on-primary-fixed hover:scale-105 active:scale-95' 
                 : 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </div>
      </main>
      )}

      {/* Fondos decorativos */}
      <div className="fixed top-20 right-10 w-96 h-96 bg-primary-fixed/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-10 left-80 w-64 h-64 bg-secondary-container/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Barra de navegación inferior móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-18 px-4 pb-safe bg-surface border-t border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-2xl">
        <Link to="/support" className="flex flex-col items-center justify-center text-primary-fixed font-bold scale-110 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
          <span className="text-[10px] font-medium mt-1">Chat</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-fixed transition-colors">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-medium mt-1">Prints</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-fixed transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
