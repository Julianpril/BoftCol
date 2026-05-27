import { useState, useEffect } from 'react';
import type { LocalPhoto } from './UploadZone';

interface PolaroidPreviewProps {
  photos: LocalPhoto[];
  formatId?: string;
}

export default function PolaroidPreview({ photos, formatId = 'standard' }: PolaroidPreviewProps) {
  const [rotations, setRotations] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(0);

  const rotatePhoto = (photoId: string) => {
    setRotations((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 90,
    }));
  };

  const isMini = formatId === 'mini';
  const slotCount = isMini ? 4 : 2;
  const totalPages = Math.ceil(photos.length / slotCount) || 1;

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const startIndex = currentPage * slotCount;
  const previewPhotos = photos.slice(startIndex, startIndex + slotCount);
  const hasPhotos = photos.length > 0;

  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  const renderSlot = (index: number) => {
    const photo = previewPhotos[index];
    const currentRotation = photo ? (rotations[photo.id] || 0) : 0;
    const isRotated90 = currentRotation % 180 !== 0;
    // En el mini (grilla 2x2 en formato 4:3) el escalado compensa la rotación para que la foto cubra bien el espacio
    const scale = isRotated90 ? 1.5 : 1;

    return (
      <div key={index} className="flex-1 min-h-0 min-w-0 overflow-hidden bg-surface-dim rounded-sm relative group/slot">
        {photo ? (
          <>
            <img
              src={photo.preview}
              alt={photo.file.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: `rotate(${currentRotation}deg) scale(${scale})` }}
            />
            <button
              onClick={() => rotatePhoto(photo.id)}
              className="absolute bottom-1 right-1 bg-black/60 hover:bg-black/90 text-white p-1 rounded-full opacity-0 group-hover/slot:opacity-100 transition-opacity cursor-pointer z-10"
              title="Rotar foto"
            >
              <span className="material-symbols-outlined text-[14px]">rotate_right</span>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-2xl">
              image
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface-container rounded-2xl p-5 md:p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h3 className="font-label text-xs font-semibold tracking-[0.08em] uppercase text-primary-fixed">
          2. Vista Previa {isMini && '(Mini)'}
        </h3>
      </div>

      <div className="relative bg-white p-2.5 md:p-3 shadow-xl rotate-1 group hover:rotate-0 transition-all duration-500 mx-auto w-full aspect-4/3 max-w-85 overflow-hidden">
        
        <div className="flex flex-col h-full min-h-0">
          {isMini ? (
            <div className="flex-1 flex flex-col gap-1.5 min-h-0">
              <div className="flex-1 flex flex-row gap-1.5 min-h-0">
                {renderSlot(0)}
                {renderSlot(1)}
              </div>
              <div className="flex-1 flex flex-row gap-1.5 min-h-0">
                {renderSlot(2)}
                {renderSlot(3)}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-row gap-2 min-h-0">
              {renderSlot(0)}
              {renderSlot(1)}
            </div>
          )}

          {/* Polaroid bottom strip (mas pequeño) */}
          <div className="mt-2 h-4 flex items-end justify-center pb-1">
            <div className="w-12 h-0.5 bg-surface-container-highest rounded-full opacity-20" />
          </div>
        </div>

        {/* Brillo superficial */}
        <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/15 pointer-events-none" />
      </div>

      {!hasPhotos ? (
        <p className="text-center font-label text-xs text-on-surface-variant/50">
          Sube fotos para ver la vista previa
        </p>
      ) : (
        <div className="flex items-center justify-between px-2 pt-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-bright disabled:opacity-30 disabled:hover:bg-surface transition-colors border border-outline-variant/30 text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <span className="font-label text-xs font-medium text-on-surface-variant">
            Página {currentPage + 1} de {totalPages}
          </span>
          
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-bright disabled:opacity-30 disabled:hover:bg-surface transition-colors border border-outline-variant/30 text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
