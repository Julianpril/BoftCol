import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSettings } from '@/api';

import colombiaData from '@/data/colombia.json';

const COLOMBIA_LOCATIONS: Record<string, string[]> = {};
colombiaData.forEach((item: any) => {
  COLOMBIA_LOCATIONS[item.departamento] = item.ciudades;
});

interface CheckoutFormData {
  customerName: string;
  email: string;
  department: string;
  city: string;
  phone: string;
  address: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    email: '',
    department: '',
    city: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(2900);

  useEffect(() => {
    // Traemos el costo de envío desde la configuración
    fetchSettings().then(settings => {
      if (settings.shippingCost) {
        setShippingCost(settings.shippingCost);
      }
    }).catch(console.error);
  }, []);

  const orderSummary = location.state || {
    photoCount: 0,
    totalPrice: 0,
    shippingCost: 2900,
    formatId: 'standard'
  };

  orderSummary.shippingCost = shippingCost;
  const grandTotal = orderSummary.totalPrice + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'department') {
      setFormData((prev) => ({ ...prev, department: value, city: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Guardamos el pedido en la base de datos
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...orderSummary
        })
      });

      if (!response.ok) {
        throw new Error('Error guardando el pedido');
      }

      const result = await response.json();
      console.log('Pedido guardado exitosamente en DB:', result.order);
      // Navegar a la pantalla de pago de Nequi con los detalles
      navigate('/payment/nequi', { 
        state: { 
          orderId: result.order.id, 
          grandTotal 
        } 
      }); 
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Hubo un error procesando el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.customerName && formData.email && formData.department && formData.city && formData.phone && formData.address;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12 pt-24 md:pt-28">
      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-on-surface">Finalizar Pedido</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Columna izquierda: datos del pedido */}
        <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12">
          
          {/* Sección de entrega */}
          <section className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <span className="material-symbols-outlined text-primary-fixed">local_shipping</span>
              <h2 className="font-headline text-xl md:text-2xl font-semibold">Datos de Entrega</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant">Nombre Completo</label>
                <input 
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant p-4 text-on-surface focus:border-primary-fixed transition-colors outline-none" 
                  placeholder="Ej: Juan Pérez" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant p-4 text-on-surface focus:border-primary-fixed transition-colors outline-none" 
                  placeholder="Ej: juan@email.com" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant">Departamento</label>
                <div className="relative">
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-4 text-on-surface focus:border-primary-fixed transition-colors outline-none appearance-none cursor-pointer" 
                  >
                    <option value="" disabled>Selecciona un departamento</option>
                    {Object.keys(COLOMBIA_LOCATIONS).sort().map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant">Ciudad / Municipio</label>
                <div className="relative">
                  <select 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.department}
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant p-4 text-on-surface focus:border-primary-fixed transition-colors outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                  >
                    <option value="" disabled>Selecciona una ciudad</option>
                    {formData.department && COLOMBIA_LOCATIONS[formData.department]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant">Teléfono</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant p-4 text-on-surface focus:border-primary-fixed transition-colors outline-none" 
                  placeholder="+57 300 000 0000" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm font-semibold text-on-surface-variant">Dirección de entrega</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant p-4 text-on-surface focus:border-primary-fixed transition-colors outline-none" 
                  placeholder="Calle 10 # 5-20" 
                />
              </div>
            </div>
          </section>

          {/* Info del producto */}
          <section className="bg-surface-container-low rounded-2xl p-6 md:p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="w-full md:w-1/3 aspect-square bg-surface-container-highest rounded-xl overflow-hidden relative group">
                <img 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt="Impresión de alta calidad" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo6EBjDWmPYtwNzOgfW73rwLL_dFO_bKY87ohQRLJpDszRaeRRjPWLMMaY3ZP9DZIFppLVCW73ctz_vHhRyrTYoXJQAMD2jYTdl9UI8dS0lMpLMKCW3lUD0w5UXHnfrh9KP-c0GwMLlIwJ_Kxn5ZAA1khcFqoDpAlCQ488ji-gshGdO1KhEjLut1Yv6DtTomW7inJ3HqdRN8ezOjMc0h-ZD2pANfvyKH3Yb50hmRVhjrg1N1a8_fUC368aiDS83RznYPY8vPBJME-Y"
                />
                <div className="absolute inset-0 bg-primary-fixed/10 mix-blend-overlay"></div>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div className="inline-block bg-primary-fixed px-3 py-1 rounded-full text-on-primary-fixed font-label text-xs w-max font-bold">
                  CALIDAD PREMIUM
                </div>
                <h3 className="font-headline text-xl md:text-2xl font-semibold">Impresión Mate Anti-Huellas</h3>
                <p className="font-body text-base text-on-surface-variant leading-relaxed">
                  Nuestras fotos están diseñadas para durar. Utilizamos papel fotográfico de gramaje superior con un acabado mate especializado que repele las huellas dactilares y evita reflejos molestos, manteniendo tus recuerdos impecables y táctiles.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Columna derecha: resumen fijo */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col gap-6">
          <div className="bg-surface-container-high rounded-2xl p-6 md:p-8 border border-primary-fixed/20 shadow-2xl shadow-primary-fixed/10">
            <h2 className="font-headline text-xl md:text-2xl font-semibold mb-6 md:mb-8">Resumen de compra</h2>
            
            <div className="flex flex-col gap-4 mb-6 md:mb-8">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-body text-base">Cantidad de fotos ({orderSummary.photoCount} unidades)</span>
                <span className="text-on-surface font-label text-sm font-semibold">${orderSummary.totalPrice.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-body text-base">Envío (Express)</span>
                <span className="text-on-surface font-label text-sm font-semibold">${orderSummary.shippingCost.toLocaleString('es-CO')}</span>
              </div>
              
              <div className="h-px bg-outline-variant/30 my-2"></div>
              
              <div className="flex justify-between items-end">
                <span className="text-on-surface-variant font-headline text-lg md:text-xl font-semibold">Total a pagar</span>
                <span className="text-primary-fixed font-display text-3xl md:text-4xl font-bold">${grandTotal.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="flex flex-col gap-3 mb-6 md:mb-8">
              <div className="flex justify-between text-xs font-label font-semibold">
                <span className="text-primary-fixed tracking-wider">VERIFICACIÓN DE ARCHIVOS</span>
                <span>100%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-fixed w-full"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center mt-1">
                Tus fotos han sido optimizadas para impresión
              </p>
            </div>

            <button 
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full font-bold py-4 md:py-5 rounded-full text-base md:text-lg flex items-center justify-center gap-3 transition-[transform,box-shadow] duration-150 ease-out
                ${isFormValid && !isSubmitting
                  ? 'bg-primary-fixed text-on-primary-fixed hover:scale-[1.02] active:scale-[0.97] shadow-xl shadow-primary-fixed/20 group cursor-pointer'
                  : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'}`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
                  PROCESANDO...
                </>
              ) : (
                <>
                  IR A PAGAR
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>

            <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
              <span className="material-symbols-outlined text-3xl md:text-4xl">payments</span>
              <span className="material-symbols-outlined text-3xl md:text-4xl">credit_card</span>
              <span className="material-symbols-outlined text-3xl md:text-4xl">account_balance_wallet</span>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-5 md:p-6 flex items-center gap-4 border border-outline-variant/10">
            <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">verified_user</span>
            <p className="text-xs md:text-sm font-label text-on-surface-variant leading-relaxed">
              Pago 100% seguro y encriptado. Garantía de satisfacción BOFT.
            </p>
          </div>
        </aside>

      </form>
    </div>
  );
}
