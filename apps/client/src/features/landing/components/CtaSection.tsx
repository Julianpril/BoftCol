import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CtaSection() {
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
      { threshold: 0.2 }
    );

    const animateElements = sectionRef.current?.querySelectorAll('[data-animate]');
    animateElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta-bottom"
      className="max-w-300 mx-auto px-4 md:px-6 pb-16 md:pb-20"
    >
      <div className="bg-primary-fixed rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 text-center relative overflow-hidden group">
        {/* Texture overlay */}
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1000')] 
            bg-cover bg-center mix-blend-overlay opacity-10 group-hover:opacity-15 transition-opacity duration-700"
        />

        {/* Geometric accents */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8">
          <h2
            data-animate
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-on-primary-fixed max-w-2xl leading-[1.1] tracking-[-0.02em] opacity-0"
          >
            ¿Listo para volver lo digital real?
          </h2>

          <p
            data-animate
            className="font-body text-base md:text-lg text-on-primary-fixed/80 max-w-xl leading-relaxed opacity-0"
            style={{ animationDelay: '120ms' }}
          >
            Empieza hoy mismo y crea tu propia galería física de recuerdos. Calidad garantizada en cada impresión.
          </p>

          <button
            data-animate
            id="cta-bottom-button"
            onClick={() => navigate('/upload')}
            className="bg-surface text-primary-fixed px-8 sm:px-10 md:px-12 py-4 md:py-5 lg:py-6 rounded-full
              font-label text-base md:text-lg lg:text-xl font-semibold tracking-wide
              hover:bg-surface-bright hover:scale-[1.02] active:scale-[0.97] transition-[transform,background-color] duration-150 ease-out
              shadow-2xl shadow-black/30 cursor-pointer opacity-0"
            style={{ animationDelay: '240ms' }}
          >
            Empezar mi orden ahora
          </button>
        </div>
      </div>
    </section>
  );
}
