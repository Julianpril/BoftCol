import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OrderDetailsDrawer from './components/OrderDetailsDrawer';
import { fetchOrders } from '@/api';

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

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticatedAdmin()) {
      loadOrders();
    }
  }, []);

  if (!isAuthenticatedAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

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
            <span className="font-body-md text-body-md">Orders</span>
          </a>
          <button onClick={() => navigate('/admin/codes')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="font-body-md text-body-md">Códigos</span>
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </button>
          
          <div className="mt-auto mb-4 px-6">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-surface-variant text-on-surface hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
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
            <button className="material-symbols-outlined text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">notifications</button>
            <div className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center overflow-hidden">
              <img alt="Admin Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSXSoApuwfBrugGcgV4Ckx6zV49jVKEyXKIDViOYrFQZ_4wmX0yDubelFpY3EVeofB0aNgziPgSVkCh2B9oWiQs-PofJXnorSMn7hCn5_KRc253wOrRPv_qnJEKlukEZqctrqEUtUDTfW1hmrBPn_1c_UNa5kEo0LNzoAfteN5T9V__L3Lw4NEN8Mj9md9sATxx7rDqH3gJZyqPKMcbMr32azZ0bRr1Se5gBQW-wSF32QiO9VNWG0mYW7sjRzXQETherdfYwm9ODyR" />
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
                      <img alt="Relaxing scene" className="w-48 h-48 rounded-full object-cover grayscale opacity-80 brightness-75 border-4 border-primary-container/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxhaGlTeU6tygzGNQh7a7aSK_OGSIG00tZnfuvyvEtVTa8fGo3NzWY-dKgW7kXYHW-jDKTJFiSrwqqDZOL1XqzVQE5Kv638NTfhE61pZOQSS35Jt25t7hKvLLWbyfhbv7Hl5cHq5BeZfjrNkKmla_tWHe6Ps8GMLZWydjbsU12RH7yvhZa23uJcwyaup7ZnfE5oDj11XN4cGKZaQTVG9LE-qD_HoMkOp4FnNSew6oAHJsPF8UIbvnbVcN16J4BjypTb6EDz98SY9NN" />
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
                    <h3 className="text-headline-md font-headline-md text-on-surface">Recent Transactions</h3>
                    <button 
                      onClick={loadOrders} 
                      className="bg-surface-variant text-on-surface px-4 py-2 rounded-full text-label-bold font-label-bold flex items-center gap-2 hover:bg-outline-variant transition-colors"
                    >
                      <span className="material-symbols-outlined">refresh</span>
                      Refresh
                    </button>
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant">
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Order ID</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Customer</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Date</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20">Status</th>
                          <th className="px-8 py-4 text-label-bold font-label-bold uppercase tracking-wider border-b border-outline-variant/20 text-right">Actions</th>
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
                            <td className="px-8 py-5 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-8 py-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-label-sm font-bold ${
                                order.status === 'PAID' ? 'bg-primary-container text-on-primary-container' :
                                order.status === 'REJECTED' ? 'bg-error text-on-error' :
                                'bg-[#FFD700] text-[#000000]'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary-container">more_vert</button>
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
          <span className="font-label-sm text-label-sm">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors" href="#">
          <span className="material-symbols-outlined">photo_library</span>
          <span className="font-label-sm text-label-sm">My Prints</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">Profile</span>
        </a>
      </footer>

      <OrderDetailsDrawer 
        isOpen={!!selectedOrderId}
        order={orders.find(o => o.id === selectedOrderId) || null}
        onClose={() => setSelectedOrderId(null)}
        onRefresh={loadOrders}
      />
    </div>
  );
}
