import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSettings, updateAdminSettings, uploadQrSetting } from '@/api';

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

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nequiNumber, setNequiNumber] = useState('');
  const [nequiName, setNequiName] = useState('');
  const [currentQrUrl, setCurrentQrUrl] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticatedAdmin()) {
      navigate('/admin/login');
      return;
    }
    fetchSettings().then((s) => {
      setNequiNumber(s.nequiNumber || '');
      setNequiName(s.nequiName || '');
      setCurrentQrUrl(s.nequiQrUrl || null);
    }).catch(console.error);
  }, [navigate]);

  const handleQrFileChange = (file: File) => {
    setQrFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setQrPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && ['image/jpeg', 'image/png'].includes(file.type)) {
      handleQrFileChange(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      if (qrFile) {
        const { nequiQrUrl } = await uploadQrSetting(qrFile);
        setCurrentQrUrl(nequiQrUrl);
        setQrFile(null);
        setQrPreview(null);
      }
      await updateAdminSettings({ nequiNumber, nequiName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const displayQr = qrPreview || currentQrUrl;

  return (
    <div className="min-h-screen bg-background text-on-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="font-black text-2xl text-primary-container">Configuración de Pago</h1>
            <p className="text-on-surface-variant text-sm">Datos Nequi que se muestran a los clientes</p>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-2xl border border-outline-variant/20 p-6 md:p-8 space-y-8">
          {/* Nequi number */}
          <div className="space-y-4">
            <h2 className="font-bold text-on-surface text-lg">Cuenta Nequi</h2>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Número (10 dígitos)</label>
              <input
                type="text"
                value={nequiNumber}
                onChange={(e) => setNequiNumber(e.target.value)}
                maxLength={10}
                placeholder="3125871829"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface font-mono text-lg focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Nombre de la cuenta</label>
              <input
                type="text"
                value={nequiName}
                onChange={(e) => setNequiName(e.target.value)}
                placeholder="BOFT COLOMBIA SAS"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
              />
            </div>
          </div>

          {/* QR Upload */}
          <div className="space-y-4">
            <h2 className="font-bold text-on-surface text-lg">QR de Cobro Nequi</h2>
            <p className="text-on-surface-variant text-sm">
              Descarga el QR desde tu app Nequi → Cobrar → Mi QR, y súbelo aquí.
            </p>

            {displayQr ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={displayQr}
                  alt="QR de cobro Nequi"
                  className="w-48 h-48 object-contain rounded-2xl border-2 border-primary-fixed/30 bg-white p-2"
                />
                {qrPreview && (
                  <p className="text-sm text-primary-fixed font-semibold">
                    Vista previa — guarda para confirmar
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-on-surface-variant underline underline-offset-2 hover:text-on-surface transition-colors"
                >
                  Cambiar QR
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary-fixed/40 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-fixed/5 transition-all"
              >
                <span className="material-symbols-outlined text-primary-fixed text-5xl mb-3">qr_code_2</span>
                <p className="font-semibold text-on-surface">Sube el QR de Nequi</p>
                <p className="text-on-surface-variant text-sm mt-1">JPG o PNG, máx 2MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleQrFileChange(file);
              }}
            />
          </div>

          {/* Actions */}
          {error && (
            <p className="text-error text-sm font-semibold bg-error/10 rounded-xl px-4 py-3">{error}</p>
          )}
          {success && (
            <p className="text-primary-fixed text-sm font-semibold bg-primary-fixed/10 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Configuración guardada
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary-fixed text-on-primary-fixed py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
