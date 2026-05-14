import { useEffect, useRef } from 'react';

const photoCards = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7YTdh-hOzuVLObjQBKfURmM0YXMDa9pVvHMdIbltywjJjjV6gY9zHDoQDHaIlJENHA4KuaxSqa2hFeRRf3kjr3yP0GUG8XhzgQhvIioVjP-YFNGocmO2JqxhgYIzH9lPWn9IPWgz4RYWzGvbUsj3pjxWafJqMbYE2le5g7DLW3k0erQOhLJhRrkAZZ35JWB1d8blXPnZr9lR1fSEHL_wkwPS8JCNuOmoKH6rUb4ygqoN3xkzFe8CY5csBEzKLXo0JyksKDBoDYhjQ',
    alt: 'Foto Polaroid de un atardecer vibrante en las montañas colombianas',
    rotation: '-6deg',
    hoverRotation: '0deg',
    col: 0,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkDL7QervA1ya_RaLLLowKP8NwevmRU-3IWz2VvXgpBd7uATqUJ3KjSmY1g2OUcT9sKd1zoIKDAk3QjXDgp4gvSlcLndYTktX6pGOU6KXjsSVJTgbdT_UVUdc0CJjA9_VRhHyoZQ2GO9Jb9kGIqREIDcmKuz-JEosOVI2ZsBuR5MEvWJ7UZUEXoEkVTDf3TBBb-4rvRVTmBS3dp2HPvntS0PbjoW5urKezvVhL-fZUFEfOOizzm7NhM4xoRODyd_J63ZJyUImXFzMf',
    alt: 'Foto Polaroid de amigos riendo juntos en un entorno urbano moderno',
    rotation: '4deg',
    hoverRotation: '0deg',
    col: 0,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlY9er8daPwGW4RW_5wJk6V9TDqQ1AaFPgmQ0XDAQpTPHKdk25udg3Rr1k-xNnAdijQD8awvDAuSqFAE_KQ6UWH3DEyo-r_y3h3LMv59yBFAV4gsf9l3aJBCwT8fPbaxIctAU0UwWZbn_xIFISg1fzjjdKySQYt-lqFYgA9VmekCoI51xNVdU0iFKsk3sofCdV_6guBpYtYbmQ-d_xK99mOgxZG1d-IKlBb9crLF6nfyjENkt-szQO_sM1EVb5OZ1W9IGNicHU_GJA',
    alt: 'Foto Polaroid artística de una flor tropical colorida',
    rotation: '8deg',
    hoverRotation: '0deg',
    col: 1,
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBir_gsEO8yFS9V3n9nyWOH1GwiDN8WaFc8zvJ4_7-zzeBJnYOLX212XAPIpFWngI_o-yueFahV3CHitPEenFzNG2-u27DblNwJoHVt6fVxB3NCkWC3CzpVjILiJD127E-okl2bqptgdiI4EpVwcB5vOVxs6HxiD9ZQw7RlttrBAwFyedp0MIN2af4zFh8RCG-5jtDOowarUel5HFa5UjOrRsFf8qzFiNY1tjbRZG5sgBOq2PGwBNU3gZzg6L3_MpnOfLpHxIC1SldO',
    alt: 'Foto Polaroid de un espacio de trabajo moderno con cámara digital',
    rotation: '-2deg',
    hoverRotation: '0deg',
    col: 1,
  },
];

export default function HeroSection() {
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
      { threshold: 0.1 }
    );

    const animateElements = sectionRef.current?.querySelectorAll('[data-animate]');
    animateElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const col0 = photoCards.filter((c) => c.col === 0);
  const col1 = photoCards.filter((c) => c.col === 1);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="max-w-[1200px] mx-auto px-4 md:px-6 pt-28 pb-16 md:pt-32 md:pb-20 lg:py-20 lg:pt-36
        grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-80px)]"
    >
      {/* Text Content */}
      <div className="flex flex-col gap-6 md:gap-8 text-center lg:text-left order-2 lg:order-1">
        <h1
          data-animate
          className="font-display text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-white opacity-0"
        >
          Tus fotos favoritas, <br className="hidden md:block" />
          <span className="text-gradient-lime">ahora en Polaroid</span>
        </h1>

        <p
          data-animate
          className="font-body text-base md:text-lg text-on-surface-variant max-w-md leading-relaxed mx-auto lg:mx-0 opacity-0"
          style={{ animationDelay: '150ms' }}
        >
          Imprime desde tu celular y recibe en casa en toda Colombia. Calidad premium garantizada.
        </p>

        <div
          data-animate
          className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2 justify-center lg:justify-start opacity-0"
          style={{ animationDelay: '300ms' }}
        >
          <button
            id="hero-cta-primary"
            className="bg-primary-fixed text-on-primary-fixed px-8 md:px-10 py-4 md:py-5 rounded-full font-label text-base md:text-lg font-semibold tracking-wide
              hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-primary-fixed/20 cursor-pointer"
          >
            Imprimir mis fotos
          </button>
          <button
            id="hero-cta-secondary"
            className="border-2 border-primary-fixed text-primary-fixed px-8 md:px-10 py-4 md:py-5 rounded-full font-label text-base md:text-lg font-semibold tracking-wide
              hover:bg-primary-fixed/5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Ver formatos
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="relative h-[420px] sm:h-[500px] lg:h-[600px] flex items-center justify-center order-1 lg:order-2">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-fixed/10 to-transparent rounded-full blur-3xl animate-glow-pulse" />

        <div className="relative grid grid-cols-2 gap-4 md:gap-6 rotate-3 scale-[0.75] sm:scale-[0.85] md:scale-90 lg:scale-100">
          {/* Column 1 */}
          <div className="space-y-4 md:space-y-6">
            {col0.map((card, i) => (
              <div
                key={i}
                className="bg-white p-2 md:p-3 pb-8 md:pb-12 photo-card-shadow transition-transform duration-500 hover:!rotate-0"
                style={{ transform: `rotate(${card.rotation})${i === 1 ? ' translateX(16px)' : ''}` }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-4 md:space-y-6 -translate-y-12">
            {col1.map((card, i) => (
              <div
                key={i}
                className="bg-white p-2 md:p-3 pb-8 md:pb-12 photo-card-shadow transition-transform duration-500 hover:!rotate-0"
                style={{ transform: `rotate(${card.rotation})${i === 1 ? ' translateX(-8px)' : ''}` }}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
