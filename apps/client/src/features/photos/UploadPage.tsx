import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFormats, fetchPrice } from '@/api';
import type { PhotoFormat } from '@/api';
import {
  UploadZone,
  FormatSelector,
  PolaroidPreview,
  OrderSummary,
} from './components';
import type { LocalPhoto } from './components';

const MAX_FILES = 50;

export default function UploadPage() {
  // ─── Estado ───
  const [formats, setFormats] = useState<PhotoFormat[]>([]);
  const [formatsLoading, setFormatsLoading] = useState(true);
  const [selectedFormatId, setSelectedFormatId] = useState('standard');
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ─── Cargamos los formatos disponibles ───
  useEffect(() => {
    fetchFormats()
      .then((data) => {
        setFormats(data);
        if (data.length > 0) setSelectedFormatId(data[0].id);
      })
      .catch((err) => console.error('Error loading formats:', err))
      .finally(() => setFormatsLoading(false));
  }, []);

  // ─── Recalculamos el precio cada vez que cambia la cantidad ───
  useEffect(() => {
    if (photos.length === 0) {
      setTotalPrice(null);
      return;
    }

    fetchPrice(photos.length)
      .then((data) => setTotalPrice(data.total))
      .catch(() => setTotalPrice(null));
  }, [photos.length]);

  // ─── Manejadores ───
  const handleAddPhotos = useCallback((files: File[]) => {
    setPhotos((prev) => {
      const remaining = MAX_FILES - prev.length;
      const newPhotos: LocalPhoto[] = files.slice(0, remaining).map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...newPhotos];
    });
  }, []);

  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const navigate = useNavigate();

  const handleNext = useCallback(async () => {
    if (photos.length < 2) return;
    setIsUploading(true);

    try {
      // 1. Subimos las fotos al servidor
      const formData = new FormData();
      photos.forEach(p => {
        formData.append('photos', p.file);
      });

      const uploadRes = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Error subiendo fotos al servidor');
      }

      const uploadData = await uploadRes.json();

      // 2. Navegar a Checkout pasándole el orderId temporal y driveFolderId
      navigate('/checkout', {
        state: {
          orderId: uploadData.orderId,
          driveFolderId: uploadData.driveFolderId,
          photoCount: photos.length,
          totalPrice,
          formatId: selectedFormatId,
        }
      });
    } catch (error) {
      console.error('Error in handleNext:', error);
      alert('Hubo un problema subiendo tus fotos. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  }, [photos, selectedFormatId, totalPrice, navigate]);

  // ─── Limpiamos las URLs de objeto al desmontar ───
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-300 mx-auto px-4 md:px-6 py-8 md:py-12 pt-24 md:pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Zona de subida (8 columnas en escritorio) */}
        <div className="lg:col-span-8">
          <UploadZone
            photos={photos}
            onAddPhotos={handleAddPhotos}
            onRemovePhoto={handleRemovePhoto}
            maxFiles={MAX_FILES}
            isUploading={isUploading}
          />
        </div>

        {/* Sidebar derecho (4 columnas en escritorio) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <FormatSelector
            formats={formats}
            selectedFormatId={selectedFormatId}
            onSelectFormat={setSelectedFormatId}
            isLoading={formatsLoading}
          />

          <PolaroidPreview photos={photos} formatId={selectedFormatId} />

          <OrderSummary
            photoCount={photos.length}
            totalPrice={totalPrice}
            isUploading={isUploading}
            onNext={handleNext}
          />
        </aside>
      </div>
    </div>
  );
}
