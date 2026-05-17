import { useLocation, Link } from 'react-router-dom';

export default function PaymentStatusPage() {
  const location = useLocation();
  const orderId = location.state?.orderId || 'BF-88219';

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-12 md:py-20 px-4 md:px-6 min-h-[80vh]">
      <style>{`
        .pending-pulse {
            box-shadow: 0 0 0 0 rgba(207, 241, 0, 0.4);
            animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(207, 241, 0, 0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(207, 241, 0, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(207, 241, 0, 0); }
        }
      `}</style>

      <div className="max-w-[800px] w-full text-center space-y-10">
        {/* Waiting Indicator */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-primary-fixed/10 rounded-full pending-pulse"></div>
          <div className="relative bg-surface-container-high w-16 h-16 rounded-full flex items-center justify-center border-2 border-primary-fixed shadow-lg shadow-primary-fixed/20">
            <span className="material-symbols-outlined text-primary-fixed text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              schedule
            </span>
          </div>
        </div>

        {/* Titles */}
        <div className="space-y-4">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface">Estamos validando tu pago</h1>
          <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Este proceso toma unos minutos. Te avisaremos cuando el código esté listo.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-fixed to-tertiary-fixed-dim"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-outline-variant/20 pb-8">
            <div>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest block mb-2 font-semibold">Orden ID</span>
              <div className="flex items-center gap-3">
                <span className="font-headline text-2xl font-bold text-on-surface uppercase">#{orderId.substring(0, 8)}</span>
                <span className="bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/30 px-3 py-1 rounded font-label text-[12px] tracking-wider font-bold">PENDIENTE</span>
              </div>
            </div>
            <div className="md:text-right">
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest block mb-2 font-semibold">Tiempo estimado</span>
              <span className="font-headline text-2xl font-bold text-primary-fixed">2-5 minutos</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
              <p className="font-body text-base text-on-surface">
                Método de pago: <span className="text-on-surface font-semibold">Nequi (Verificación manual)</span>
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Link to="/" className="w-full bg-primary-fixed text-on-primary-fixed h-14 rounded-full font-label text-sm font-bold flex items-center justify-center hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary-fixed/20 tracking-wider">
                VOLVER AL INICIO
              </Link>
              <div className="flex items-center justify-center gap-2 text-on-surface-variant py-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <p className="font-label text-xs font-medium">Puedes cerrar esta ventana, te enviaremos el código a tu correo/teléfono.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Decoration / Image */}
        <div className="mt-12 opacity-40">
          <div className="flex justify-center gap-4 grayscale">
            <div className="w-24 h-32 bg-surface-container-highest border-8 border-surface p-2 shadow-xl -rotate-6 rounded-sm">
              <div className="w-full h-20 bg-surface-variant flex items-center justify-center overflow-hidden">
                <img alt="Vintage photo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRmYxVWVydTnYxTJj1TOg69-Kp8qA4b1vkY0tCcZvCSdC7HpGNewFil9K-ZjNUr9LxZJvyHy7PJNWidzOwMnHDrpGxuDEj835yjDZQtMv68sYE2O38tpeIuU8VDHke8lmdzkt60lCWG7KRhorPkvDsTY9SGWma2wjeJ8JgT6WvOpWLZviHXAJvpFweTdq9z9AJOh6ThSv4qc5FdVW8xFhx0TOFniEGme5NZq2NHMnnw0G09ZiXUov1CYVWClKgiC8wCKRV7Hy6dksk"/>
              </div>
            </div>
            <div className="w-24 h-32 bg-surface-container-highest border-8 border-surface p-2 shadow-xl rotate-3 mt-4 rounded-sm">
              <div className="w-full h-20 bg-surface-variant flex items-center justify-center overflow-hidden">
                <img alt="Analog camera" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz5Mx3vok6ProvlsNl1XFSe30si2Br8_zXuFUw14F6Z390Gflj9BFLKF6lJ_QHYkDesS5znAvf0qrUg0rBXSgbVoQRe_igW27BR--7S35N8PsZjJMuc9R5cUeMTD-vsB1w0_HOnGpBYpYp8i4m4ZH-AB941v08tJkCu_5WGDgMUrmp-8qOvgB7SqDOKNTFtc8t9L2PVn9eQBerSK5MUxRdlgkebFjcAcqGKLLjszlk10WjxOrP436MD2zFy4HzPIjZayjTlOHxWirC"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
