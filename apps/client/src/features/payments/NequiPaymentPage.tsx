import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { fetchSettings } from '@/api';

export default function NequiPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [nequiData, setNequiData] = useState({ number: '312 5871 829', name: 'BOFT COLOMBIA SAS', qrUrl: '' });

  // Recuperamos la orden y total (ejemplo fallback si entran directo)
  const orderId = location.state?.orderId || 'BT-000000';
  const grandTotal = location.state?.grandTotal || 0;

  useEffect(() => {
    fetchSettings().then(settings => {
      setNequiData({
        number: settings.nequiNumber || '312 5871 829',
        name: settings.nequiName || 'BOFT COLOMBIA SAS',
        qrUrl: settings.nequiQrUrl || '',
      });
    }).catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!file || isUploading) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir comprobante');
      
      navigate('/payment/status', { state: { orderId } });
    } catch (error) {
      console.error(error);
      alert('Error al subir el comprobante. Inténtalo de nuevo.');
      setIsUploading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 px-4 md:px-6 max-w-[1200px] mx-auto min-h-screen">
      <div className="flex flex-col items-center">
        {/* Breadcrumbs or Back Link */}
        <div className="w-full max-w-2xl mb-12">
          <Link to="/checkout" className="flex items-center gap-2 text-on-surface-variant hover:text-primary-fixed transition-colors w-max">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-label text-sm font-semibold tracking-wider">Volver al checkout</span>
          </Link>
        </div>

        {/* Main Content Container */}
        <div className="w-full max-w-3xl bg-surface-container-low p-6 md:p-12 rounded-[2rem] border border-outline-variant/20 shadow-xl">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">Pago con Nequi</h1>
            <p className="text-on-surface-variant font-body text-base md:text-lg">Completa tu transferencia para imprimir tus momentos.</p>
          </div>

          {/* Nequi Number Highlight */}
          <div className="bg-surface-container-highest p-6 md:p-8 rounded-2xl border border-primary-fixed/20 flex flex-col items-center justify-center mb-10 group hover:border-primary-fixed transition-all duration-300">
            <span className="font-label text-xs font-semibold text-primary-fixed mb-2 tracking-widest uppercase">Número de Cuenta Nequi</span>
            <div className="flex items-center gap-4">
              <span className="font-display text-4xl md:text-[64px] font-black text-primary-fixed select-all tracking-tighter">{nequiData.number}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(nequiData.number.replace(/\s+/g, ''))}
                className="p-2 hover:bg-primary-fixed/10 rounded-full text-on-surface-variant hover:text-primary-fixed transition-colors"
                title="Copiar número"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
            <p className="text-on-surface-variant mt-4 font-body text-sm md:text-base">Nombre: {nequiData.name}</p>
            {grandTotal > 0 && (
              <p className="text-primary-fixed mt-2 font-headline text-xl font-bold">Total a transferir: ${grandTotal.toLocaleString('es-CO')}</p>
            )}
          </div>

          {/* QR de cobro Nequi */}
          {nequiData.qrUrl && (
            <div className="bg-surface-container-highest p-6 md:p-8 rounded-2xl border border-primary-fixed/20 flex flex-col items-center gap-4 mb-10">
              <span className="font-label text-xs font-semibold text-primary-fixed tracking-widest uppercase">
                Escanea con tu app Nequi
              </span>
              <img
                src={nequiData.qrUrl}
                alt="QR de cobro Nequi — escanea para pagar"
                className="w-48 h-48 object-contain rounded-xl bg-white p-2"
              />
              <p className="text-on-surface-variant text-sm text-center font-body">
                Abre Nequi → Pagar → Escanear QR
              </p>
            </div>
          )}

          {/* Instructions Banner */}
          <div className="bg-secondary-container/10 border border-secondary-container/30 p-6 rounded-2xl flex gap-4 items-start mb-10">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <div>
              <p className="font-label text-sm font-semibold text-on-surface mb-2 tracking-wide">Pasos para el pago:</p>
              <ul className="text-on-surface-variant font-body text-sm md:text-base space-y-1 list-disc list-inside">
                <li>Abre Nequi y selecciona "Enviar plata".</li>
                <li>Ingresa el número superior y el valor total de tu pedido.</li>
                <li>Toma una captura de pantalla del comprobante exitoso.</li>
                <li>Cárgalo a continuación para validar tu pedido.</li>
              </ul>
            </div>
          </div>

          {/* Upload Area */}
          <div className="mb-10">
            <label className="block font-label text-sm font-semibold text-on-surface mb-4 tracking-wide">Comprobante de Pago</label>
            <label className="border-2 border-dashed border-primary-fixed/50 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-fixed/5 transition-all duration-300 group">
              <input type="file" className="hidden" accept="image/jpeg, image/png, application/pdf" onChange={handleFileChange} />
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary-fixed text-4xl">cloud_upload</span>
              </div>
              <p className="font-headline text-xl md:text-2xl font-bold text-on-surface mb-1">
                {file ? file.name : 'Sube tu captura aquí'}
              </p>
              <p className="text-on-surface-variant font-body text-sm md:text-base">
                {file ? 'Haz clic para cambiar el archivo' : 'Arrastra el archivo o haz clic para buscarlo'}
              </p>
              {!file && <p className="text-on-surface-variant/60 font-label text-xs mt-4">JPG, PNG o PDF (Máx. 5MB)</p>}
            </label>
          </div>

          {/* Security Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary-fixed">verified_user</span>
              <div className="flex flex-col">
                <span className="font-label text-sm font-semibold">Pago Seguro</span>
                <span className="text-on-surface-variant font-label text-xs">Encriptación de grado bancario</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary-fixed">receipt_long</span>
              <div className="flex flex-col">
                <span className="font-label text-sm font-semibold uppercase">Ref: #{orderId.substring(0, 8)}</span>
                <span className="text-on-surface-variant font-label text-xs">Referencia única de seguimiento</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleConfirm}
            disabled={!file || isUploading}
            className={`w-full font-bold py-5 rounded-full text-lg flex items-center justify-center gap-3 transition-all duration-300 
              ${file && !isUploading
                ? 'bg-primary-fixed text-on-primary-fixed hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary-fixed/20' 
                : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'}`}
          >
            {isUploading ? (
              <>
                <span className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
                Subiendo comprobante...
              </>
            ) : (
              <>
                Confirmar Envío
                <span className="material-symbols-outlined">send</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Help */}
        <div className="mt-8 text-center">
          <p className="text-on-surface-variant font-body text-sm md:text-base">
            ¿Tienes problemas con el pago? 
            <a className="text-primary-fixed font-label text-sm font-semibold underline underline-offset-4 ml-1" href="#">Contactar a soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
}
