import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OrderDetailsDrawer from './components/OrderDetailsDrawer';
import { fetchOrders, updateOrderStatus } from '@/api';

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

const statusLabels: Record<string, string> = {
  PAID: 'Pagado',
  REJECTED: 'Rechazado',
  PROCESSING: 'Procesando',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [avatarSrc, setAvatarSrc] = useState<string>(
    () => localStorage.getItem('adminAvatar') ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSXSoApuwfBrugGcgV4Ckx6zV49jVKEyXKIDViOYrFQZ_4wmX0yDubelFpY3EVeofB0aNgziPgSVkCh2B9oWiQs-PofJXnorSMn7hCn5_KRc253wOrRPv_qnJEKlukEZqctrqEUtUDTfW1hmrBPn_1c_UNa5kEo0LNzoAfteN5T9V__L3Lw4NEN8Mj9md9sATxx7rDqH3gJZyqPKMcbMr32azZ0bRr1Se5gBQW-wSF32QiO9VNWG0mYW7sjRzXQETherdfYwm9ODyR'
  );
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar pedidos', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticatedAdmin()) {
      loadOrders();
    }
  }, []);

  // Cierra dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticatedAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem('adminAvatar', dataUrl);
      setAvatarSrc(dataUrl);
      setAvatarOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMenuOpen = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ x: rect.right, y: rect.bottom });
    setOpenMenuId((prev) => (prev === orderId ? null : orderId));
  };

  const handleQuickStatus = async (e: React.MouseEvent, orderId: string, status: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch {
      // el drawer ya maneja el error; aquí solo refrescamos silenciosamente
    }
  };

  // Pedidos que requieren atención (PAID sin procesar)
  const pendingAttention = orders.filter((o) => o.status === 'PAID');

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Barra lateral del admin */}
      <aside className="hidden md:flex flex-col h-full w-64 fixed left-0 bg-surface-container-lowest border-r border-surface-variant z-50">
        <div className="px-6 py-8">
          <span className="text-headline-md font-headline-md font-black text-primary-container">BOFT ADMIN</span>
        </div>
        <nav className="flex flex-col h-full space-y-2">
          <a className="flex items-center gap-4 bg-primary-container text-on-primary-container rounded-r-full py-4 px-6 font-bold translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Pedidos</span>
          </a>
          <button onClick={() => navigate('/admin/codes')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="font-body-md text-body-md">Códigos</span>
          </button>
          <button onClick={() => navigate('/admin/support')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-body-md text-body-md">Soporte</span>
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Configuración</span>
          </button>

          <div className="mt-auto mb-4 px-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-surface-variant text-on-surface hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className={`flex-1 md:ml-64 flex flex-col h-screen overflow-hidden transition-all duration-500 ${selectedOrderId ? 'filter blur-sm opacity-50 pointer-events-none' : ''}`}>
        <header className="flex justify-between items-center w-full px-6 md:px-margin-mobile h-16 z-50 sticky top-0 bg-background shadow-[0_4px_20px_rgba(207,241,0,0.1)]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary-container">camera</span>
            <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-extrabold tracking-tighter text-primary-container uppercase">BOFT</h1>
          </div>
          <div className="flex items-center gap-4">

            {/* Notificaciones */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setAvatarOpen(false); }}
                className="relative material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
              >
                notifications
                {pendingAttention.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {pendingAttention.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-outline-variant/20">
                    <h4 className="font-semibold text-on-surface text-sm">Notificaciones</h4>
                  </div>
                  {pendingAttention.length === 0 ? (
                    <div className="px-5 py-6 text-center text-on-surface-variant text-sm">
                      Sin notificaciones pendientes
                    </div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-outline-variant/10">
                      {pendingAttention.map((order) => (
                        <li key={order.id}>
                          <button
                            className="w-full text-left px-5 py-4 hover:bg-surface-variant/30 transition-colors"
                            onClick={() => { setSelectedOrderId(order.id); setNotifOpen(false); }}
                          >
                            <p className="text-sm font-semibold text-on-surface">
                              Pedido de {order.customerName}
                            </p>
                            <p className="text-xs text-primary-container mt-0.5">
                              Pago recibido — requiere procesamiento
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('es-CO')}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div ref={avatarRef} className="relative">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <button
                onClick={() => { setAvatarOpen((v) => !v); setNotifOpen(false); }}
                className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary-container/50 transition-all"
              >
                <img alt="Admin Avatar" className="w-full h-full object-cover" src={avatarSrc} />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-12 w-52 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <p className="text-xs text-on-surface-variant">Administrador</p>
                    <p className="text-sm font-semibold text-on-surface truncate">BOFT Colombia</p>
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-on-surface-variant">photo_camera</span>
                    Cambiar foto
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <section className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-container-max mx-auto h-full flex flex-col">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-background">Panel de Pedidos</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Gestión y monitoreo de impresiones en tiempo real.</p>
              </div>
              <div className="flex gap-4">
                <div className="relative group">
                  <input className="bg-surface-container border-0 border-b-2 border-surface-variant focus:border-primary-container focus:ring-0 text-on-surface font-body-md px-4 py-2 w-64 transition-all" placeholder="Buscar pedido..." type="text" />
                  <span className="material-symbols-outlined absolute right-2 top-2 text-on-surface-variant">search</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-surface-container rounded-lg border border-surface-variant overflow-hidden flex flex-col items-center justify-center relative">
              {orders.length === 0 ? (
                <>
                  <table className="w-full text-left absolute top-0 left-0 opacity-20 pointer-events-none">
                    <thead className="bg-surface-container-high border-b border-surface-variant">
                      <tr>
                        <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase">ID Pedido</th>
                        <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Fecha</th>
                        <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Estado</th>
                        <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase">Cliente</th>
                        <th className="px-6 py-4 font-label-bold text-label-bold text-on-surface-variant uppercase text-right">Total</th>
                      </tr>
                    </thead>
                  </table>
                  <div className="max-w-md w-full px-8 text-center flex flex-col items-center z-10">
                    <div className="w-64 h-64 mb-8 bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(207,241,0,0.05)] relative">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-surface-variant opacity-20"></div>
                      <img alt="Sin pedidos" className="w-48 h-48 rounded-full object-cover grayscale opacity-80 brightness-75 border-4 border-primary-container/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxhaGlTeU6tygzGNQh7a7aSK_OGSIG00tZnfuvyvEtVTa8fGo3NzWY-dKgW7kXYHW-jDKTJFiSrwqqDZOL1XqzVQE5Kv638NTfhE61pZOQSS35Jt25t7hKvLLWbyfhbv7Hl5cHq5BeZfjrNkKmla_tWHe6Ps8GMLZWydjbsU12RH7yvhZa23uJcwyaup7ZnfE5oDj11XN4cGKZaQTVG9LE-qD_HoMkOp4FnNSew6oAHJsPF8UIbvnbVcN16J4BjypTb6EDz98SY9NN" />
                      <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-background mb-3">No hay pedidos pendientes</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">Relájate, estás al día con todos los pedidos.</p>
                    <button
                      onClick={loadOrders}
                      className="group relative px-10 py-4 bg-primary-container text-on-primary-fixed font-label-bold text-label-bold rounded-full hover:opacity-90 transition-all active:scale-95 flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">refresh</span>
                      Refrescar
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col justify-start">
                  <div className="px-8 py-6 border-b border-outline-variant/20 flex justify-between items-center">
                    <h3 className="text-headline-md font-headline-md text-on-surface">Transacciones recientes</h3>
                    <button
                      onClick={loadOrders}
                      className="bg-surface-variant text-on-surface px-4 py-2 rounded-full text-label-bold font-label-bold flex items-center gap-2 hover:bg-outline-variant transition-colors"
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      Refrescar
                    </button>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant">
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">ID Pedido</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Cliente</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Fecha</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Estado</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {orders.map((order) => (
                          <tr
                            key={order.id}
                            className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <td className="px-8 py-5 text-on-surface font-label-bold">{order.id.slice(0, 8)}</td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="text-on-surface font-semibold">{order.customerName}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                            <td className="px-8 py-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-label-sm font-bold ${
                                order.status === 'PAID' ? 'bg-primary-container text-on-primary-container' :
                                order.status === 'REJECTED' ? 'bg-error text-on-error' :
                                'bg-[#FFD700] text-[#000000]'
                              }`}>
                                {statusLabels[order.status] ?? order.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button
                                onClick={(e) => handleMenuOpen(e, order.id)}
                                className={`material-symbols-outlined transition-colors ${openMenuId === order.id ? 'text-primary-container' : 'text-on-surface-variant hover:text-primary-container'}`}
                              >
                                more_vert
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Navegación móvil inferior */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface-container shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-lg">
        <a className="flex flex-col items-center justify-center text-primary-container bg-surface-variant/50 rounded-xl px-4 py-1 scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="font-label-sm text-label-sm">Inicio</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors" href="#">
          <span className="material-symbols-outlined">photo_library</span>
          <span className="font-label-sm text-label-sm">Impresiones</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">Perfil</span>
        </a>
      </footer>

      {/* Dropdown de acciones por fila */}
      {openMenuId && (() => {
        const menuOrder = orders.find((o) => o.id === openMenuId);
        if (!menuOrder) return null;
        return (
          <div
            ref={menuRef}
            style={{ position: 'fixed', top: menuPos.y + 6, right: window.innerWidth - menuPos.x }}
            className="w-52 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-[200] overflow-hidden"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedOrderId(menuOrder.id); setOpenMenuId(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant/40 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-on-surface-variant">open_in_new</span>
              Ver detalles
            </button>

            {(menuOrder.status === 'PAID' || menuOrder.status === 'PENDING') && (
              <>
                <button
                  onClick={(e) => handleQuickStatus(e, menuOrder.id, 'PROCESSING')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary-container hover:bg-primary-container/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Aprobar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedOrderId(menuOrder.id); setOpenMenuId(null); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  Rechazar
                </button>
              </>
            )}

            {menuOrder.status === 'PROCESSING' && (
              <button
                onClick={(e) => handleQuickStatus(e, menuOrder.id, 'SHIPPED')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant/40 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-on-surface-variant">local_shipping</span>
                Marcar enviado
              </button>
            )}

            {menuOrder.status === 'SHIPPED' && (
              <button
                onClick={(e) => handleQuickStatus(e, menuOrder.id, 'DELIVERED')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-variant/40 transition-colors"
              >
                <span className="material-symbols-outlined text-base text-on-surface-variant">done_all</span>
                Marcar entregado
              </button>
            )}
          </div>
        );
      })()}

      <OrderDetailsDrawer
        isOpen={!!selectedOrderId}
        order={orders.find(o => o.id === selectedOrderId) || null}
        onClose={() => setSelectedOrderId(null)}
        onRefresh={loadOrders}
      />
    </div>
  );
}
