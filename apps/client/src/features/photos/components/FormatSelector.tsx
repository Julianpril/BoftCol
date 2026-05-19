import type { PhotoFormat } from '@/api';

interface FormatSelectorProps {
  formats: PhotoFormat[];
  selectedFormatId: string;
  onSelectFormat: (formatId: string) => void;
  isLoading: boolean;
}

export default function FormatSelector({
  formats,
  selectedFormatId,
  onSelectFormat,
  isLoading,
}: FormatSelectorProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-3 bg-surface-container-high rounded w-1/2" />
        <div className="h-20 bg-surface-container-high rounded-xl" />
        <div className="h-20 bg-surface-container-high rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-2xl p-5 md:p-6 flex flex-col gap-5">
      <h3 className="font-label text-xs font-semibold tracking-[0.08em] uppercase text-primary-fixed">
        1. Seleccionar Formato
      </h3>

      <div className="flex flex-col gap-3">
        {formats.map((format) => {
          const isSelected = format.id === selectedFormatId;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => onSelectFormat(format.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer
                hover:scale-[1.01]
                ${isSelected
                  ? 'border-primary-fixed bg-surface-container-high shadow-[0_0_15px_rgba(207,241,0,0.1)]'
                  : 'border-outline-variant/30 bg-surface-container-low hover:border-primary-fixed/40'
                }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-label text-sm font-semibold text-on-surface">
                  {format.name}
                </span>
                {isSelected && (
                  <span
                    className="material-symbols-outlined text-primary-fixed text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-on-surface-variant">{format.dimensions}</p>
              <p className={`font-label text-xs mt-1.5 ${isSelected ? 'text-primary-fixed' : 'text-on-surface-variant/70'}`}>
                {format.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
