import { useCallback, useRef, useState } from 'react';

interface LocalPhoto {
  id: string;
  file: File;
  preview: string;
}

interface UploadZoneProps {
  photos: LocalPhoto[];
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  maxFiles: number;
  isUploading: boolean;
}

export default function UploadZone({
  photos,
  onAddPhotos,
  onRemovePhoto,
  maxFiles,
  isUploading,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const validFiles = Array.from(fileList).filter(
        (f) => f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp',
      );
      if (validFiles.length > 0) {
        onAddPhotos(validFiles);
      }
    },
    [onAddPhotos],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const remaining = maxFiles - photos.length;

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl md:text-[2.5rem] font-bold text-white leading-tight">
          Subir Fotos
        </h1>
        <p className="font-body text-base md:text-lg text-on-surface-variant">
          Sube tus momentos favoritos desde tu dispositivo.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 md:p-12
          flex flex-col items-center justify-center text-center transition-all duration-300 min-h-80 md:min-h-105
          ${isDragging
            ? 'border-primary-fixed bg-primary-fixed/5 scale-[1.01]'
            : 'border-outline-variant/40 hover:border-primary-fixed/60 bg-surface-container-lowest'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {/* Icon */}
        <div className={`w-16 h-16 md:w-20 md:h-20 bg-surface-container flex items-center justify-center rounded-full mb-5
          group-hover:scale-110 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <span className="material-symbols-outlined text-primary-fixed text-3xl md:text-4xl">
            cloud_upload
          </span>
        </div>

        <h2 className="font-headline text-xl md:text-2xl font-semibold text-white mb-2">
          {isDragging ? '¡Suelta aquí!' : 'Arrastra o haz clic aquí'}
        </h2>
        <p className="font-body text-sm md:text-base text-on-surface-variant mb-5">
          Soporta JPG, PNG y WebP (Máx. 10MB por foto)
        </p>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          disabled={isUploading}
          className="bg-primary-fixed text-on-primary-fixed font-label text-sm font-semibold tracking-wider uppercase
            px-7 py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(207,241,0,0.3)] active:scale-95 transition-all cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Subiendo...' : 'Seleccionar Archivos'}
        </button>

        {remaining > 0 && photos.length > 0 && (
          <p className="mt-3 font-label text-xs text-on-surface-variant/60">
            Puedes agregar {remaining} foto{remaining !== 1 ? 's' : ''} más
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Photo Grid Preview */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-xl bg-surface-container overflow-hidden border border-outline-variant/20 relative group"
            >
              <img
                src={photo.preview}
                alt={photo.file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="w-9 h-9 bg-error/90 rounded-full flex items-center justify-center hover:bg-error transition-colors cursor-pointer"
                  aria-label={`Eliminar ${photo.file.name}`}
                >
                  <span className="material-symbols-outlined text-white text-lg">close</span>
                </button>
              </div>
              {/* File name tooltip */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-linear-to-t from-black/70 to-transparent">
                <p className="font-label text-[10px] text-white/80 truncate">
                  {photo.file.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export type { LocalPhoto };
