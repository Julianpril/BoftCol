import { useEffect, useRef } from 'react';

interface ValueCard {
  icon: string;
  title: string;
  description: string;
}

const cards: ValueCard[] = [
  {
    icon: 'cloud_upload',
    title: 'Carga instantánea',
    description:
      'Sube tus fotos directamente desde WhatsApp o Instagram. Nuestra plataforma inteligente procesa tus imágenes en segundos sin perder calidad.',
  },
  {
    icon: 'local_shipping',
    title: 'Entrega Express',
    description:
      'Recibe tus recuerdos en la puerta de tu casa entre 24 a 48 horas. Cobertura total en las principales ciudades de Colombia.',
  },
  {
    icon: 'verified',
    title: 'Papel Premium',
    description:
      'Utilizamos papel fotográfico de alta densidad con acabado brillante. Fotos que no se decoloran y mantienen su nitidez por décadas.',
  },
];

export default function ValuePropsSection() {
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
      id="como-funciona"
      className="bg-surface-container-low py-16 md:py-20 lg:py-section"
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              data-animate
              className="bg-surface-container p-8 md:p-10 rounded-2xl border border-outline-variant/20
                hover:border-primary-fixed/50 transition-[border-color,box-shadow] duration-200 ease-out group opacity-0"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-fixed/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8
                group-hover:scale-[1.08] group-hover:bg-primary-fixed/15 transition-[transform,background-color] duration-200 ease-out">
                <span
                  className="material-symbols-outlined text-primary-fixed text-3xl md:text-4xl"
                >
                  {card.icon}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-headline text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">
                {card.title}
              </h3>

              {/* Description */}
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
