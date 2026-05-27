import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface PriceTier {
  photos: number;
  price: number;
  perPhoto: number;
}

const allTiers: PriceTier[] = [
  { photos: 2,  price: 6000,   perPhoto: 3000 },
  { photos: 4,  price: 12000,  perPhoto: 3000 },
  { photos: 6,  price: 15000,  perPhoto: 2500 },
  { photos: 8,  price: 20000,  perPhoto: 2500 },
  { photos: 10, price: 25000,  perPhoto: 2500 },
  { photos: 12, price: 30000,  perPhoto: 2500 },
  { photos: 14, price: 35000,  perPhoto: 2500 },
  { photos: 18, price: 45000,  perPhoto: 2500 },
  { photos: 20, price: 50000,  perPhoto: 2409 },
  { photos: 22, price: 55000,  perPhoto: 2292 },
  { photos: 26, price: 58000,  perPhoto: 2231 },
  { photos: 28, price: 60000,  perPhoto: 2143 },
  { photos: 32, price: 65000,  perPhoto: 2031 },
  { photos: 34, price: 68000,  perPhoto: 2000 },
  { photos: 36, price: 72000,  perPhoto: 2000 },
  { photos: 38, price: 76000,  perPhoto: 2000 },
  { photos: 40, price: 80000,  perPhoto: 2000 },
  { photos: 42, price: 84000,  perPhoto: 2000 },
  { photos: 44, price: 88000,  perPhoto: 2000 },
  { photos: 46, price: 92000,  perPhoto: 2000 },
  { photos: 48, price: 96000,  perPhoto: 2000 },
  { photos: 50, price: 100000, perPhoto: 2000 },
];

// Los tres planes que mostramos destacados en las tarjetas
const featuredTiers = [
  { ...allTiers[0],  label: 'Pruébalo',  badge: null },
  { ...allTiers[4],  label: 'Popular',   badge: 'MÁS POPULAR' },
  { ...allTiers[11], label: 'Mejor valor', badge: 'MEJOR PRECIO' },
];

function formatCOP(value: number): string {
  return '$' + value.toLocaleString('es-CO');
}

export default function PricingSection() {
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animateElements = sectionRef.current?.querySelectorAll('[data-animate]');
    animateElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="precios"
      className="max-w-300 mx-auto px-4 md:px-6 py-16 md:py-20"
    >
      {/* Encabezado de sección */}
      <div className="text-center mb-12 md:mb-16">
        <h2
          data-animate
          className="font-display text-3xl sm:text-4xl md:text-[2.5rem] font-extrabold text-white mb-4 leading-tight opacity-0"
        >
          Precios <span className="text-gradient-lime">transparentes</span>
        </h2>
        <p
          data-animate
          className="font-body text-base md:text-lg text-on-surface-variant max-w-lg mx-auto opacity-0"
          style={{ animationDelay: '100ms' }}
        >
          Entre más fotos pidas, mejor precio por unidad. Sin costos ocultos.
        </p>
      </div>

      {/* Tarjetas de planes destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12 md:mb-16">
        {featuredTiers.map((tier, index) => {
          const isPopular = tier.badge === 'MÁS POPULAR';
          return (
            <div
              key={tier.photos}
              data-animate
              className={`relative rounded-2xl p-6 md:p-8 border transition-[border-color,box-shadow,transform] duration-200 ease-out opacity-0
                ${isPopular
                  ? 'bg-primary-fixed/5 border-primary-fixed shadow-lg shadow-primary-fixed/10 scale-[1.02] md:scale-105'
                  : 'bg-surface-container border-outline-variant/20 hover:border-primary-fixed/40 hover:shadow-md hover:shadow-primary-fixed/5'
                }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Etiqueta */}
              {tier.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold tracking-wider
                  ${isPopular
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-tertiary-fixed-dim text-on-tertiary-fixed'
                  }`}>
                  {tier.badge}
                </div>
              )}

              {/* Cabecera de la tarjeta */}
              <div className="text-center mb-6">
                <p className="font-label text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  {tier.label}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`font-display text-4xl md:text-5xl font-extrabold ${isPopular ? 'text-primary-fixed' : 'text-white'}`}>
                    {tier.photos}
                  </span>
                  <span className="font-body text-base text-on-surface-variant">fotos</span>
                </div>
              </div>

              {/* Precio */}
              <div className="text-center mb-6 pb-6 border-b border-outline-variant/20">
                <p className="font-headline text-2xl md:text-3xl font-bold text-white">
                  {formatCOP(tier.price)}
                </p>
                <p className="font-label text-sm text-on-surface-variant mt-1">
                  {formatCOP(tier.perPhoto)} / foto
                </p>
              </div>

              {/* Características incluidas */}
              <ul className="space-y-3 mb-8">
                {[
                  'Impresión Polaroid premium',
                  'Papel fotográfico brillante',
                  'Envío a toda Colombia',
                  ...(tier.photos >= 10 ? ['Precio preferencial'] : []),
                  ...(tier.photos >= 28 ? ['Mejor precio por unidad'] : []),
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Botón de acción */}
              <button
                onClick={() => navigate('/upload')}
                className={`w-full py-3.5 rounded-full font-label text-sm font-semibold tracking-wider uppercase transition-[transform,background-color] duration-150 ease-out cursor-pointer
                  ${isPopular
                    ? 'bg-primary-fixed text-on-primary-fixed hover:scale-[0.98] active:scale-[0.96] shadow-md shadow-primary-fixed/20'
                    : 'border-2 border-primary-fixed/60 text-primary-fixed hover:bg-primary-fixed/5 active:scale-[0.97]'
                  }`}
              >
                Ordenar ahora
              </button>
            </div>
          );
        })}
      </div>

      {/* Botón para mostrar/ocultar la tabla completa */}
      <div className="text-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-2 font-label text-sm font-semibold text-primary-fixed hover:text-primary-fixed-dim transition-colors cursor-pointer group"
        >
          {showAll ? 'Ocultar tabla completa' : 'Ver todos los precios'}
          <span
            className={`material-symbols-outlined text-lg transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
          >
            expand_more
          </span>
        </button>
      </div>

      {/* Tabla de precios completa */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ${
          showAll ? 'max-h-500 opacity-100 mt-8' : 'max-h-0 opacity-0 mt-0'
        }`}
        style={{ transitionTimingFunction: showAll ? 'cubic-bezier(0.23, 1, 0.32, 1)' : 'cubic-bezier(0.77, 0, 0.175, 1)' }}
      >
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-5 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Nº de fotos
                </th>
                <th className="px-5 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Precio total
                </th>
                <th className="px-5 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Precio por foto
                </th>
                <th className="px-5 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">
                  Ahorro
                </th>
              </tr>
            </thead>
            <tbody>
              {allTiers.map((tier, _index) => {
                const savings = ((3000 - tier.perPhoto) / 3000) * 100;
                const isHighlighted = [2, 10, 28].includes(tier.photos);
                return (
                  <tr
                    key={tier.photos}
                    className={`border-t border-outline-variant/10 transition-colors hover:bg-surface-container-high/50
                      ${isHighlighted ? 'bg-primary-fixed/3' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-label text-sm font-semibold text-white">
                        {tier.photos} fotos
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-body text-sm text-on-surface">
                        {formatCOP(tier.price)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-body text-sm text-on-surface">
                        {formatCOP(tier.perPhoto)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {savings > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/10 text-primary-fixed text-xs font-semibold">
                          -{Math.round(savings)}%
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-center mt-4 font-label text-xs text-on-surface-variant/60">
          Todos los precios en COP. Envío incluido en las principales ciudades.
        </p>
      </div>
    </section>
  );
}
