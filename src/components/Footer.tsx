import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Instagram = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const { elementRef, isVisible } = useIntersectionObserver();
  const pathname = usePathname();
  const isShopPage = pathname === '/shop';

  const footerLinks = {
    soporte: [
      { name: 'FAQ', href: '/faq' },
      { name: 'ENVÍOS', href: '/shipping' },
      { name: 'DEVOLUCIONES', href: '/returns' }
    ],
    servicios: [
      { name: 'AGENDA UNA CITA', href: 'https://wa.me/5215510821369?text=Hola,%20me%20gustar%C3%ADa%20agendar%20una%20cita' }, // Enlace WhatsApp
      { name: 'DISEÑOS PERSONALIZADOS', href: 'https://wa.me/5215510821369?text=Hola,%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20los%20dise%C3%B1os%20personalizados' },
      { name: 'CUIDADO Y LIMPIEZA', href: '/care' }
    ],
    compañía: [
      { name: 'NOSOTROS', href: '/#philosophy' },
      { name: 'PROCESO Y SOSTENIBILIDAD', href: '/#process' },
      { name: 'CONTACTO', href: '/#contact' }
    ]
  };

  return (
    <footer id="contact">
      {/* Instagram Section - Conditional Background */}
      <div className={`${isShopPage ? 'bg-cream' : 'bg-white'} text-charcoal py-10 lg:py-12 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div ref={elementRef} className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <h3 className="uppercase font-serif font-light text-2xl lg:text-2xl mb-6 text-charcoal">
                Sé parte de nuestras historias
              </h3>

              <p className="font-montserrat text-warm-gray text-lg font-light mb-8 max-w-md mx-auto lg:mx-0">
                Síguenos en Instagram para ser parte del proceso e inspirar nuestros pares.
              </p>

              <div>
                <a
                  href="https://www.instagram.com/h.de.helena?igsh=MWVodHdrN2pjNDg0eg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-all duration-300 group"
                >
                  <Instagram size={24} strokeWidth={1.5} className="text-xs group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-light text-lg">@h.de.helena</span>
                </a>
              </div>
            </div>

            {/* Right Column: Feed */}
            <div className={`relative overflow-hidden rounded-lg shadow-xl transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              <div className="aspect-square w-full bg-warm-gray/5 border border-warm-gray/10 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.instagram.com/h.de.helena/embed"
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowtransparency="true"
                  title="Instagram Feed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer & Bottom Bar - Dark Background */}
      <div className="bg-gray-200 text-charcoal">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
            {/* Logo */}
            <div className="flex flex-col items-center md:items-start space-y-6">
              <img src="/logo.png" alt="H de Helena" className="h-16 w-auto opacity-90 object-contain" />
            </div>

            {/* Soporte */}
            <div className="space-y-6">
              <h4 className="font-montserrat font-bold text-sm tracking-widest text-charcoal uppercase">Soporte</h4>
              <ul className="space-y-4">
                {footerLinks.soporte.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="font-sans text-xs md:text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Servicios */}
            <div className="space-y-6">
              <h4 className="font-montserrat font-bold text-sm tracking-widest text-charcoal uppercase">Servicios</h4>
              <ul className="space-y-4">
                {footerLinks.servicios.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('https') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs md:text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors duration-300"
                      >
                        {link.name}
                      </a>
                    ) : link.href.startsWith('/#') ? (
                      <a
                        href={link.href}
                        className="font-sans text-xs md:text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors duration-300"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-xs md:text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Compañía */}
            <div className="space-y-6">
              <h4 className="font-montserrat font-bold text-sm tracking-widest text-charcoal uppercase">Compañía</h4>
              <ul className="space-y-4">
                {footerLinks.compañía.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('/#') ? (
                      <a
                        href={link.href}
                        className="font-sans text-xs md:text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors duration-300"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-xs md:text-sm font-medium text-charcoal hover:text-charcoal/70 transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-warm-gray/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-charcoal/50 text-sm font-light">
                © 2026 H de Helena. Todos los derechos reservados.
              </p>

              <div className="flex items-center space-x-6 text-sm">
                <Link href="/privacy" className="text-charcoal/50 hover:text-charcoal/70 transition-colors duration-300">
                  Privacidad
                </Link>
                <Link href="/terms" className="text-charcoal/50 hover:text-charcoal/70 transition-colors duration-300">
                  Términos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}