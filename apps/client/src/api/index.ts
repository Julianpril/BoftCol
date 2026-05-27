export { fetchFormats, fetchPricing, fetchPrice, uploadPhotos, deletePhoto } from './photosApi';
export type { PhotoFormat, PriceTier, UploadedPhoto, UploadResponse } from './photosApi';

export async function fetchSettings() {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Error loading settings');
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Error fetching orders');
  return res.json();
}

export async function updateOrderStatus(id: string, status: string, rejectReason?: string) {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, rejectReason }),
  });
  if (!res.ok) throw new Error('Error updating order status');
  return res.json();
}

// ─── Autenticación del admin ───

export async function adminLogin(email: string, password: string): Promise<{ token: string; expiresAt: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || 'Credenciales incorrectas');
  }
  return res.json();
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    sessionStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  }
  return res;
}

export async function updateAdminSettings(data: { nequiNumber: string; nequiName: string }): Promise<void> {
  const res = await adminFetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || 'Error al guardar configuración');
  }
}

export async function uploadQrSetting(file: File): Promise<{ nequiQrUrl: string }> {
  const formData = new FormData();
  formData.append('qr', file);
  const res = await adminFetch('/api/settings/qr', { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || 'Error al subir QR');
  }
  return res.json();
}

// ─── API de códigos ───

export async function fetchAdminCodes() {
  const res = await adminFetch('/api/admin/codes');
  if (!res.ok) throw new Error('Error fetching codes');
  return res.json();
}

export async function createAdminCode(code: string, value: number, expiresAt?: string) {
  const res = await adminFetch('/api/admin/codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, value, expiresAt })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || 'Error creando código');
  }
  return res.json();
}

export async function updateAdminCode(id: string, data: { code?: string; value?: number; isUsed?: boolean; expiresAt?: string }) {
  const res = await adminFetch(`/api/admin/codes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || 'Error actualizando código');
  }
  return res.json();
}

export async function bulkUploadAdminCodes(codes: { code: string, value: number, expiresAt?: string }[]) {
  const res = await adminFetch('/api/admin/codes/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codes })
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || 'Error subiendo códigos');
  }
  return res.json();
}
