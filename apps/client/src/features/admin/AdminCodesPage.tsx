import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { fetchAdminCodes, createAdminCode, bulkUploadAdminCodes, updateAdminCode, fetchPricing } from '@/api';

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

export default function AdminCodesPage() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<{ photos: number; price: number }[]>([]);

  // Formulario para crear un código
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newValue, setNewValue] = useState('6000');
  
  // Carga masiva
  const [uploading, setUploading] = useState(false);

  // Editar código
  const [editingCode, setEditingCode] = useState<{ id: string; code: string; value: string; isUsed: boolean; expiresAt: string } | null>(null);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminCodes();
      setCodes(data);
    } catch (error) {
      console.error('Failed to load codes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticatedAdmin()) {
      loadCodes();
      fetchPricing().then(data => {
        setTiers(data);
        if (data.length) setNewValue(String(data[0].price));
      }).catch(console.error);
    }
  }, []);

  if (!isAuthenticatedAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newValue) return;
    try {
      await createAdminCode(newCode, Number(newValue));
      setNewCode('');
      setShowCreateModal(false);
      loadCodes();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditCode = (c: any) => {
    setEditingCode({
      id: c.id,
      code: c.code,
      value: String(c.value),
      isUsed: c.isUsed,
      expiresAt: new Date(c.expiresAt).toISOString().split('T')[0],
    });
  };

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;
    try {
      await updateAdminCode(editingCode.id, {
        code: editingCode.code,
        value: Number(editingCode.value),
        isUsed: editingCode.isUsed,
        expiresAt: editingCode.expiresAt,
      });
      setEditingCode(null);
      loadCodes();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        // Parseo simple del CSV: CODIGO,VALOR (ej. "ABCD-123,6000")
        const lines = text.split('\n');
        const parsedCodes = [];
        for (const line of lines) {
          const [code, value] = line.split(',').map(s => s.trim());
          if (code && value && !isNaN(Number(value))) {
            parsedCodes.push({ code, value: Number(value) });
          }
        }
        
        if (parsedCodes.length === 0) {
          alert("No se encontraron códigos válidos en el archivo. El formato debe ser: CODIGO,VALOR (ej. ABCD-123,6000)");
          setUploading(false);
          return;
        }

        const res = await bulkUploadAdminCodes(parsedCodes);
        alert(res.message);
        loadCodes();
      } catch (error: any) {
        alert(error.message || "Error procesando el archivo");
      } finally {
        setUploading(false);
        // Limpiamos el input para poder subir el mismo archivo otra vez si hace falta
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Barra lateral de navegación */}
      <aside className="hidden md:flex flex-col h-full w-64 fixed left-0 bg-surface-container-lowest border-r border-surface-variant z-50">
        <div className="px-6 py-8">
          <span className="text-headline-md font-headline-md font-black text-primary-container">BOFT ADMIN</span>
        </div>
        <nav className="flex flex-col h-full space-y-2">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md text-body-md">Orders</span>
          </button>
          <a className="flex items-center gap-4 bg-primary-container text-on-primary-container rounded-r-full py-4 px-6 font-bold translate-x-1 transition-transform" href="#">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="font-body-md text-body-md">Códigos</span>
          </a>
          <button onClick={() => navigate('/admin/settings')} className="flex items-center gap-4 text-on-surface-variant hover:text-primary hover:bg-surface-container-high py-4 px-6 transition-all duration-200 w-full text-left">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md text-body-md">Settings</span>
          </button>
          
          <div className="mt-auto mb-4 px-6">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 bg-surface-variant text-on-surface hover:bg-error-container hover:text-on-error-container rounded-lg transition-colors">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between items-center w-full px-6 h-16 z-50 sticky top-0 bg-background shadow-[0_4px_20px_rgba(207,241,0,0.1)]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary-container">qr_code</span>
            <h1 className="text-headline-lg-mobile font-extrabold uppercase text-primary-container">Códigos de Impresión</h1>
          </div>
        </header>

        <section className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-container-max mx-auto h-full flex flex-col">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline-lg text-on-background">Gestión de Códigos</h2>
                <p className="text-on-surface-variant">Pines de impresión pre-generados para validación automática de la IA.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary-container text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90"
                >
                  <span className="material-symbols-outlined">add</span>
                  Crear Código
                </button>
                <label className={`bg-surface-variant text-on-surface px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-outline-variant cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                  <span className="material-symbols-outlined">upload_file</span>
                  {uploading ? 'Subiendo...' : 'Subir CSV'}
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="flex-1 bg-surface-container rounded-lg border border-surface-variant overflow-hidden flex flex-col">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20">
                      <th className="px-8 py-4 text-label-bold uppercase tracking-wider">Código</th>
                      <th className="px-8 py-4 text-label-bold uppercase tracking-wider">Valor (COP)</th>
                      <th className="px-8 py-4 text-label-bold uppercase tracking-wider">Estado</th>
                      <th className="px-8 py-4 text-label-bold uppercase tracking-wider">Creado</th>
                      <th className="px-8 py-4 text-label-bold uppercase tracking-wider">Vence</th>
                      <th className="px-8 py-4 text-label-bold uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
                    ) : codes.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-on-surface-variant">No hay códigos en la base de datos.</td></tr>
                    ) : (
                      codes.map((c) => (
                        <tr key={c.id} className="hover:bg-surface-variant/30 transition-colors">
                          <td className="px-8 py-4 font-mono font-bold text-primary-fixed">{c.code}</td>
                          <td className="px-8 py-4 text-on-surface">${c.value}</td>
                          <td className="px-8 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-label-sm font-bold ${
                              c.isUsed ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary-container text-on-primary-container'
                            }`}>
                              {c.isUsed ? 'Usado' : 'Disponible'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-on-surface-variant">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-4 text-on-surface-variant">{new Date(c.expiresAt).toLocaleDateString()}</td>
                          <td className="px-8 py-4">
                            <button
                              onClick={() => openEditCode(c)}
                              className="flex items-center gap-1 text-on-surface-variant hover:text-primary-container transition-colors text-sm"
                              title="Cambiar vencimiento"
                            >
                              <span className="material-symbols-outlined text-base">edit_calendar</span>
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Editar Código */}
      {editingCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl p-6 border border-surface-variant shadow-2xl relative">
            <button onClick={() => setEditingCode(null)} className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
            <h3 className="text-headline-sm text-on-surface font-bold mb-6">Editar Código</h3>
            <form onSubmit={handleUpdateCode} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Código</label>
                <input
                  type="text"
                  value={editingCode.code}
                  onChange={e => setEditingCode({ ...editingCode, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-2 text-on-surface font-mono font-bold focus:border-primary-container focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Valor (COP)</label>
                <select
                  value={editingCode.value}
                  onChange={e => setEditingCode({ ...editingCode, value: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:outline-none"
                >
                  {tiers.map(t => (
                    <option key={t.photos} value={String(t.price)}>
                      {t.photos} Fotos (${Number(t.price).toLocaleString('es-CO')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Estado</label>
                <select
                  value={editingCode.isUsed ? 'true' : 'false'}
                  onChange={e => setEditingCode({ ...editingCode, isUsed: e.target.value === 'true' })}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:outline-none"
                >
                  <option value="false">Disponible</option>
                  <option value="true">Usado</option>
                </select>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={editingCode.expiresAt}
                  onChange={e => setEditingCode({ ...editingCode, expiresAt: e.target.value })}
                  required
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-primary-container text-on-primary font-bold py-3 rounded-lg hover:opacity-90 mt-2">
                Guardar cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Código */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl p-6 border border-surface-variant shadow-2xl relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
            <h3 className="text-headline-sm text-on-surface font-bold mb-6">Nuevo Código</h3>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Código Único</label>
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  required
                  placeholder="Ej. BOFT-6K-A1B2"
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Valor (COP)</label>
                <select 
                  value={newValue} 
                  onChange={e => setNewValue(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary-container focus:outline-none"
                >
                  {tiers.map(t => (
                    <option key={t.photos} value={String(t.price)}>
                      {t.photos} Fotos (${Number(t.price).toLocaleString('es-CO')})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-primary-container text-on-primary font-bold py-3 rounded-lg hover:opacity-90 mt-2">
                Crear y Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
