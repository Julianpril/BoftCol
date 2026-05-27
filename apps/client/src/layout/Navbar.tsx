import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Ubicaciones', href: '#ubicaciones' },
  { label: 'Precios', href: '#precios' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bloqueamos el scroll del body mientras el menú está abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-out
        ${scrolled
          ? 'bg-surface/95 backdrop-blur-xl shadow-lg shadow-primary-fixed/5 border-b border-outline-variant/20'
          : 'bg-transparent'
        }`}
    >
      <div className="flex justify-between items-center w-full px-4 md:px-6 max-w-300 mx-auto h-20">
        {/* Logo */}
        <a
          href="/"
          className="font-display text-xl md:text-2xl font-extrabold tracking-tighter text-primary-fixed-dim hover:text-primary-fixed transition-colors"
        >
          BOFT COLOMBIA
        </a>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative font-label text-sm font-semibold tracking-wider uppercase text-on-surface-variant hover:text-on-surface transition-colors duration-200
                after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary-fixed after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Botón de acción escritorio */}
        <button
          onClick={() => navigate('/admin/login')}
          className="hidden md:block bg-primary-fixed text-on-primary-fixed px-7 py-2.5 rounded-full font-label text-sm font-semibold tracking-wider uppercase
            hover:scale-[0.97] active:scale-[0.95] transition-transform duration-150 ease-out shadow-md shadow-primary-fixed/20 cursor-pointer"
        >
          Login
        </button>

        {/* Hamburguesa móvil */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col gap-1.25 p-2 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-on-surface transition-all duration-300
              ${mobileOpen ? 'rotate-45 translate-y-1.75' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-on-surface transition-all duration-300
              ${mobileOpen ? 'opacity-0 scale-0' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-on-surface transition-all duration-300
              ${mobileOpen ? '-rotate-45 -translate-y-1.75' : ''}`}
          />
        </button>
      </div>

      {/* Menú móvil desplegable */}
      <div
        className={`md:hidden fixed inset-0 top-20 bg-surface/98 backdrop-blur-2xl transition-[opacity,transform] duration-300 ease-out
          ${mobileOpen
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2'
          }`}
      >
        <nav className="flex flex-col items-center justify-center gap-8 pt-16" aria-label="Menú móvil">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`font-headline text-2xl font-bold text-on-surface hover:text-primary-fixed transition-colors duration-150
                ${mobileOpen ? 'animate-slide-up' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              navigate('/admin/login');
            }}
            className="mt-4 bg-primary-fixed text-on-primary-fixed px-10 py-4 rounded-full font-label text-base font-semibold tracking-wider uppercase
              hover:scale-[0.97] active:scale-[0.95] transition-transform duration-150 ease-out cursor-pointer"
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}
