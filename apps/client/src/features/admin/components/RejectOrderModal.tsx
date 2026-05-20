import { useState } from 'react';

interface RejectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function RejectOrderModal({ isOpen, onClose, onConfirm }: RejectOrderModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleQuickReason = (quickReason: string) => {
    setReason(quickReason);
  };

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-margin-mobile">
      <section className="w-full max-w-lg bg-surface-container border border-surface-variant shadow-[0_4px_40px_rgba(207,241,0,0.15)] rounded-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6 border-b border-surface-variant/30">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-error">cancel</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary">Rechazar Pago</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Esta acción notificará al usuario que su transacción no pudo ser procesada y cancelará la orden actual.
          </p>
        </div>
        
        {/* Modal Body */}
        <div className="p-8">
          <label className="block font-label-bold text-label-bold text-on-surface-variant mb-3 uppercase tracking-widest" htmlFor="rejection-reason">
            Motivo del rechazo
          </label>
          <textarea 
            id="rejection-reason" 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-surface-container-lowest border-2 border-transparent border-b-primary-container focus:ring-0 focus:border-primary-container rounded-t-lg font-body-md text-body-md text-on-surface p-4 transition-all placeholder:text-surface-variant" 
            placeholder="Escriba aquí la razón detallada para el usuario..." 
            rows={4}
          ></textarea>
          <div className="mt-4 flex flex-wrap gap-2">
            <span onClick={() => handleQuickReason("Comprobante ilegible")} className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant cursor-pointer hover:bg-surface-variant">Comprobante ilegible</span>
            <span onClick={() => handleQuickReason("Monto incorrecto")} className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant cursor-pointer hover:bg-surface-variant">Monto incorrecto</span>
            <span onClick={() => handleQuickReason("ID inválido")} className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant cursor-pointer hover:bg-surface-variant">ID inválido</span>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-8 pb-8 flex flex-col sm:flex-row-reverse gap-4">
          <button 
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1 py-4 px-6 bg-primary-container text-on-primary-container rounded-full font-label-bold text-label-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Confirmar Rechazo
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 px-6 border-2 border-primary-container/20 text-primary-container rounded-full font-label-bold text-label-bold hover:bg-primary-container/5 active:scale-95 transition-all"
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
