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

  if (!isOpen || !order) return null;

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await updateOrderStatus(order.id, 'PROCESSING');
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Error approving order', error);
      alert('Error approving order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      setIsProcessing(true);
      await updateOrderStatus(order.id, 'REJECTED', reason);
      if (onRefresh) onRefresh();
      setIsRejectModalOpen(false);
      onClose();
    } catch (error) {
      console.error('Error rejecting order', error);
      alert('Error rejecting order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Build the thumbnail URL for the receipt using our proxy or Google Drive direct link
  // Note: you may need a specific endpoint to serve the image, but for now we just show a placeholder
  // if drive integration doesn't support direct public viewing easily
  const receiptUrl = order.receiptFileId 
    ? `https://drive.google.com/uc?export=view&id=${order.receiptFileId}` 
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuCsk5059wO03eiZF8Jb_YiYzNRye8FDfqwPTy6Q_uL4m3-rMp04zVYRbUv-yVtUDVL-iEVW_IHFynHoIfsyJF3CHyXK_j5vDrMkys9wCXy7tHQoHLQRVwSlk6Bl3an0V7wOyLIG1askiiC6RIQjRzyGA9ayfhPpzVH16RyCqNFAKSVnKL0N5TDGO-p6ZXTfoMKfBmIwO1R10hwscPN9qyKjVgBdj90OnwSCxhumg_gYRNEUzbYbLUQV9R5riX5UBHUsTlajmCbZbHoR";

  return (
    <>
      {/* Overlay Dimmer */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      
      {/* Detail Drawer Open (Right Aligned) */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-surface-container-lowest border-l border-surface-variant z-50 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container">
          <div>
            <span className="text-label-bold font-label-bold text-on-surface-variant uppercase tracking-tighter">Order Details</span>
            <h2 className="text-headline-md font-headline-md text-primary-container">#{order.id.slice(0, 8)}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
          {/* Customer Section */}
          <section>
            <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase mb-4">Customer Info</h3>
            <div className="flex items-center gap-4 bg-surface-container p-4 rounded-lg border border-surface-variant">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-headline-md uppercase">
                {order.customerName.substring(0, 2)}
              </div>
              <div>
                <p className="text-body-lg font-bold">{order.customerName}</p>
                <p className="text-label-sm text-on-surface-variant">{order.phone} • {order.city}</p>
                <p className="text-label-sm text-on-surface-variant">{order.address}</p>
              </div>
            </div>
          </section>
          
          {/* Photos List Section */}
          <section>
            <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase mb-4">Ordered Photos ({order.photoCount})</h3>
            <div className="bg-surface-container border border-surface-variant rounded-lg p-6 flex flex-col items-center justify-center text-center">
              {order.driveFolderId && order.driveFolderId.startsWith('local_order_') ? (
                <>
                  <span className="material-symbols-outlined text-5xl text-primary-container mb-3">folder_zip</span>
                  <p className="text-body-md font-bold text-on-surface mb-4">Fotos disponibles para descarga</p>
                  <a 
                    href={`/api/photos/download/${order.driveFolderId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Descargar ZIP
                  </a>
                </>
              ) : order.driveFolderId ? (
                <>
                  <span className="material-symbols-outlined text-5xl text-primary-container mb-3">folder_open</span>
                  <p className="text-body-md font-bold text-on-surface mb-4">Fotos subidas a Google Drive</p>
                  <a 
                    href={`https://drive.google.com/drive/folders/${order.driveFolderId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined">link</span>
                    Abrir Carpeta en Drive
                  </a>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">cloud_off</span>
                  <span className="text-label-bold font-label-bold text-on-surface-variant">
                    No hay fotos disponibles
                  </span>
                </>
              )}
            </div>
          </section>
          
          {/* Payment Receipt Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-label-bold font-label-bold text-on-surface-variant uppercase">Payment Receipt (Nequi)</h3>
              {order.status === 'PAID' && (
                <span className="text-label-sm font-label-sm text-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Match Confirmed
                </span>
              )}
            </div>
            <div className="relative group bg-surface-container rounded-lg border-2 border-dashed border-surface-variant overflow-hidden">
              <img className="w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity min-h-[200px] object-cover" src={receiptUrl} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:opacity-90">
                  <span className="material-symbols-outlined">fullscreen</span>
                  View Full Size
                </a>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-3 rounded-lg border border-surface-variant">
                <p className="text-label-sm text-on-surface-variant">Status</p>
                <p className="text-body-md font-bold uppercase">{order.status}</p>
              </div>
              <div className="bg-surface-container p-3 rounded-lg border border-surface-variant">
                <p className="text-label-sm text-on-surface-variant">Amount</p>
                <p className="text-body-md font-bold text-primary-container">${order.totalPrice}</p>
              </div>
            </div>
            {order.rejectReason && (
              <div className="mt-4 bg-error-container/20 border border-error/50 p-4 rounded-lg">
                <p className="text-label-sm text-error font-bold mb-1">Rejection Reason</p>
                <p className="text-body-sm text-on-surface">{order.rejectReason}</p>
              </div>
            )}
          </section>
        </div>
        
        {/* Drawer Footer Buttons */}
        {(order.status === 'PAID' || order.status === 'PENDING') && (
          <div className="absolute bottom-0 left-0 w-full p-6 bg-surface-container border-t border-surface-variant space-y-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="w-full bg-primary-container text-on-primary-fixed py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(207,241,0,0.3)] disabled:opacity-50"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Aprobar y Generar Código
            </button>
            <button 
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isProcessing}
              className="w-full bg-transparent border-2 border-error text-error py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-error/10 active:scale-95 transition-all disabled:opacity-50"
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
