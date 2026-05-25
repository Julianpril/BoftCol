import { useEffect, useRef } from 'react';

const kioscos = [
  { nombre: 'Titan Plaza', ciudad: 'Bogotá, Colombia' },
  { nombre: 'Nuestro Bogotá', ciudad: 'Bogotá, Colombia' },
  { nombre: 'Diverplaza', ciudad: 'Bogotá, Colombia' },
];

export default function UbicacionesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.15 }
    );

    const animateElements = sectionRef.current?.querySelectorAll('[data-animate]');
    animateElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ubicaciones"
      className="bg-surface py-16 md:py-20 lg:py-section"
    >
      <div className="max-w-300 mx-auto px-4 md:px-6">
        <div data-animate className="text-center mb-10 md:mb-14 opacity-0">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-3">
            Nuestros kioscos
          </h2>
          <p className="font-body text-base md:text-lg text-on-surface-variant">
            Encuéntranos en estos centros comerciales de Bogotá
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {kioscos.map((kiosco, index) => (
            <div
              key={kiosco.nombre}
              data-animate
              className="bg-surface-container p-8 md:p-10 rounded-2xl border border-outline-variant/20
                hover:border-primary-fixed/50 transition-[border-color,box-shadow] duration-200 ease-out group opacity-0
                flex flex-col items-center text-center"
              style={{ animationDelay: `${(index + 1) * 70}ms` }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-fixed/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8
                group-hover:scale-[1.08] group-hover:bg-primary-fixed/15 transition-[transform,background-color] duration-200 ease-out">
                <span className="material-symbols-outlined text-primary-fixed text-3xl md:text-4xl">
                  place
                </span>
              </div>

              <h3 className="font-headline text-xl md:text-2xl font-semibold text-white mb-2">
                {kiosco.nombre}
              </h3>

              <p className="font-body text-sm md:text-base text-on-surface-variant">
                {kiosco.ciudad}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
