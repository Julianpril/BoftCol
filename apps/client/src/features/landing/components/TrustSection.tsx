import { useEffect, useRef } from 'react';

const avatars = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-dFfjehq87kjfo0d-5o0QsWmFqF7qN76VUPv8A8x7tvwwi2ZZdYiMFff8moFxRXQKYLxvDWAWo0YgfZW_cJnQj2GK4RHWA9QfRgG-n7Mo_zIBM2p-a3EkS_yPkH4NCNKbAY0ebQRgIwGZRNDbLu3PFptLnhoofL5PuBuXLpUA5mTqi5AmAk8VfqUAmvljBibYZ8b4AtQh6dIH8p0ZA_QQR_W5op92ZGph4gMV63wSVqOjEOAPb7D7v-s2eY6iTZIU5voZce2pWzxw',
    alt: 'Cliente satisfecha de BOFT Colombia',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm6pwBBd3Ik5wCZE8AM1wPV_9M9JC275pXZKgAlh8vX9ubE8rySu9ejIXQCLV-6sISYwmwpx756ThPWTGQ1soy_3TlNwVEEzG8GFSu68jah5JEyfvjaZzlCt1etFTiO5CtEFT6t2gzzQqDHfdNwQby-x9MoGjIKWs5kCwvz7Tl4cYw03IDDKagoTrU8DrLrdi9o8NaIdlqSRIUEjzCt7e2sYCsUUfkCQZ4FKoffKFVmaZ7gQZ6LN7jKq7rpauoXxmUD6HXwibpk_cE',
    alt: 'Cliente satisfecho de BOFT Colombia',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6gCLzguiIXQG8uU1Mts6oSjhtv4H0mJ-x7Wl2HNK3hoGyfedY-wdrKGcycTg8_1bmyhon31FDkJmAvk2kh6TylFi0vrK4eAlQv4lVrxrImF8saYSEFRTrhRIWqlLDnvG3gO3cLFjgoXIZzXPXitD80qHyj1-kl6QPzk9MFmUt9qgT84M21snQcrEcS4NqLkX9PhmwbMVbSyArxqBWyH-F5NDYrDv1-gtHh8ydXKJ9uQyBbZyMci2rjQqAJ6OXld2dZG1QZO3fhXi',
    alt: 'Clienta satisfecha de BOFT Colombia',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR3oPrmuQyLYv2eukW5IRJ4K_GLiM4QeyBTqTi3tjdeSZu1hR1iKfX4vNK0fL9mO_t_8Y2ldytZm7miK2k3qUCEAKiqR-wMZRblVXXiRTa5GBq8nKSPCIPvSfAK7sJcz-DJB9KUtFD8jTLYEZQ7u_3jcPEznQkTL1J1wzYWzVQerNT6fHZA0e9ymYVc4tzAhfPuT9PUgCDZoBbNlUu4ZBONvhe1UVNii6n2myA4Y2ZjbJ8QS5tGHTBqKVrrNSpafOJXi7P7P2Ki2PC',
    alt: 'Cliente profesional de BOFT Colombia',
  },
];

export default function TrustSection() {
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
      { threshold: 0.2 }
    );

    const animateElements = sectionRef.current?.querySelectorAll('[data-animate]');
    animateElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="social-proof"
      className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-20 flex flex-col items-center text-center"
    >
      <h2
        data-animate
        className="font-headline text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-white mb-8 leading-tight max-w-2xl opacity-0"
      >
        Más de 10k Colombianos ya imprimen con nosotros
      </h2>

      <div
        data-animate
        className="flex flex-col sm:flex-row items-center gap-4 mb-8 opacity-0"
        style={{ animationDelay: '150ms' }}
      >
        {/* Avatar Stack */}
        <div className="flex -space-x-3">
          {avatars.map((avatar, i) => (
            <img
              key={i}
              src={avatar.src}
              alt={avatar.alt}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full border-[3px] border-background object-cover
                hover:scale-[1.15] hover:z-10 transition-transform duration-150 ease-out"
              loading="lazy"
            />
          ))}
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex gap-0.5 text-primary-fixed" role="img" aria-label="5 estrellas">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>
          <span className="font-label text-sm font-semibold text-on-surface-variant">
            4.9/5 Calificación promedio
          </span>
        </div>
      </div>
    </section>
  );
}
