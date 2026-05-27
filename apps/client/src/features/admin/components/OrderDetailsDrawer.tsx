import { useState } from 'react';
import RejectOrderModal from './RejectOrderModal';
import { updateOrderStatus } from '@/api';

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
  onRefresh?: () => void;
}

export default function OrderDetailsDrawer({ isOpen, onClose, order, onRefresh }: OrderDetailsDrawerProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  if (!isOpen || !order) return null;

  const receiptUrl = order.receiptFileId
    ? `/api/orders/${order.id}/receipt-image`
    : null;

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await updateOrderStatus(order.id, 'PROCESSING');
      if (onRefresh) onRefresh();
      onClose();
    } catch {
      setActionError('No se pudo aprobar el pedido. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setIsProcessing(true);
      setActionError(null);
      await updateOrderStatus(order.id, 'REJECTED', reason);
      if (onRefresh) onRefresh();
      setIsRejectModalOpen(false);
      onClose();
    } catch {
      setActionError('No se pudo rechazar el pedido. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusColors: Record<string, string> = {
    PAID: 'bg-primary-container text-on-primary-container',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    REJECTED: 'bg-error/20 text-error',
    PENDING: 'bg-yellow-500/20 text-yellow-400',
  };

  const statusLabels: Record<string, string> = {
    PAID: 'Pagado',
    PROCESSING: 'En proceso',
    REJECTED: 'Rechazado',
    PENDING: 'Pendiente',
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full sm:max-w-[480px] bg-surface-container-lowest border-l border-surface-variant z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-surface-variant flex items-center justify-between bg-surface-container">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-0.5">Detalle del Pedido</p>
            <h2 className="text-xl font-black text-primary-container font-mono">#{order.id.slice(0, 8)}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-40">

          {/* Cliente */}
          <section>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">Cliente</p>
            <div className="flex items-center gap-4 bg-surface-container p-4 rounded-2xl border border-surface-variant">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container font-black text-lg uppercase shrink-0">
                {order.customerName.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-on-surface truncate">{order.customerName}</p>
                <p className="text-sm text-on-surface-variant truncate">{order.phone} · {order.city}</p>
                <p className="text-sm text-on-surface-variant truncate">{order.address}</p>
              </div>
            </div>
          </section>

          {/* Fotos */}
          <section>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
              Fotos del pedido ({order.photoCount})
            </p>
            <div className="bg-surface-container border border-surface-variant rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
              {order.driveFolderId?.startsWith('local_order_') ? (
                <>
                  <span className="material-symbols-outlined text-5xl text-primary-container">folder_zip</span>
                  <p className="font-bold text-on-surface text-sm">Fotos disponibles para descarga</p>
                  <a
                    href={`/api/photos/download/${order.driveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-container text-on-primary-container px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Descargar ZIP
                  </a>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">cloud_off</span>
                  <p className="text-sm text-on-surface-variant">No hay fotos disponibles</p>
                </>
              )}
            </div>
          </section>

          {/* Comprobante */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Comprobante de pago</p>
              {order.status === 'PAID' && (
                <span className="text-xs font-bold text-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Recibido
                </span>
              )}
            </div>

            <div className="bg-surface-container rounded-2xl border border-surface-variant overflow-hidden">
              {receiptUrl && !imgError ? (
                <div className="relative group">
                  <img
                    src={receiptUrl}
                    alt="Comprobante de pago"
                    className="w-full h-auto max-h-64 object-contain bg-black/20"
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface-container text-on-surface px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Ver tamaño completo
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl opacity-40">receipt_long</span>
                  <p className="text-sm">{imgError ? 'No se pudo cargar el comprobante' : 'Sin comprobante adjunto'}</p>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-surface-container p-3 rounded-xl border border-surface-variant">
                <p className="text-xs text-on-surface-variant mb-1">Estado</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status] ?? 'bg-surface-variant text-on-surface-variant'}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="bg-surface-container p-3 rounded-xl border border-surface-variant">
                <p className="text-xs text-on-surface-variant mb-1">Total</p>
                <p className="font-black text-primary-container">${Number(order.totalPrice).toLocaleString('es-CO')}</p>
              </div>
            </div>

            {order.rejectReason && (
              <div className="mt-3 bg-error/10 border border-error/30 p-4 rounded-xl">
                <p className="text-xs font-bold text-error mb-1 uppercase tracking-wide">Motivo de rechazo</p>
                <p className="text-sm text-on-surface">{order.rejectReason}</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer con acciones */}
        {(order.status === 'PAID' || order.status === 'PENDING') && (
          <div className="flex-shrink-0 p-5 bg-surface-container border-t border-surface-variant space-y-3 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
            {actionError && (
              <div className="flex items-center gap-2 bg-error/10 border border-error/30 text-error rounded-xl px-4 py-3 text-sm font-semibold">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                {actionError}
              </div>
            )}
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="w-full bg-primary-container text-on-primary-fixed py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(207,241,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined">check_circle</span>
              )}
              Aprobar y Generar Código
            </button>
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isProcessing}
              className="w-full border-2 border-error text-error py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-error/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">cancel</span>
              Rechazar
            </button>
          </div>
        )}
      </aside>

      <RejectOrderModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
      />
    </>
  );
}
