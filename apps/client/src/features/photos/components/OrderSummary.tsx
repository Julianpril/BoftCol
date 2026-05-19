interface OrderSummaryProps {
  photoCount: number;
  totalPrice: number | null;
  isUploading: boolean;
  onNext: () => void;
}

function formatCOP(value: number): string {
  return '$' + value.toLocaleString('es-CO');
}

export default function OrderSummary({
  photoCount,
  totalPrice,
  isUploading,
  onNext,
}: OrderSummaryProps) {
  const canProceed = photoCount >= 2 && totalPrice !== null && !isUploading;

  return (
    <div className="bg-surface-container-highest rounded-2xl p-5 md:p-6 flex flex-col gap-4 border-t-4 border-primary-fixed">
      {/* Photo count */}
      <div className="flex justify-between items-center">
        <span className="font-body text-sm text-on-surface-variant">Fotos seleccionadas:</span>
        <span className="font-label text-sm font-semibold text-on-surface">
          {photoCount} {photoCount === 1 ? 'Foto' : 'Fotos'}
        </span>
      </div>

      {/* Minimum notice */}
      {photoCount > 0 && photoCount < 2 && (
        <p className="font-label text-xs text-secondary px-3 py-2 bg-secondary/10 rounded-lg text-center">
          Mínimo 2 fotos para continuar
        </p>
      )}

      {/* Total */}
      <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15">
        <span className="font-headline text-xl font-semibold text-on-surface">Total:</span>
        <span className="font-headline text-xl font-bold text-primary-fixed">
          {totalPrice !== null ? formatCOP(totalPrice) : '—'}
        </span>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full py-4 md:py-5 rounded-full font-display text-base md:text-lg font-extrabold uppercase tracking-wider
          transition-all duration-200 mt-2 cursor-pointer
          ${canProceed
            ? 'bg-primary-fixed text-on-primary-fixed hover:shadow-lg hover:shadow-primary-fixed/20 active:scale-[0.98]'
            : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed'
          }`}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin" />
            Subiendo...
          </span>
        ) : (
          'SIGUIENTE'
        )}
      </button>
    </div>
  );
}
