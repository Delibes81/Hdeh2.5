import { useLocation } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function Footer() {
  const { elementRef, isVisible } = useIntersectionObserver();
  const location = useLocation();
  const isShopPage = location.pathname === '/shop';

  const footerLinks = {
    atención: [
      { name: 'FAQ', href: '#faq' },
      { name: 'Envíos', href: '#shipping' },
      { name: 'Devoluciones', href: '#returns' },
      { name: 'Cuidados', href: '#care' }
    ],
    compañía: [
      { name: 'Sobre Nosotros', href: '#about' },
      { name: 'Proceso', href: '#process' },
      { name: 'Sostenibilidad', href: '#sustainability' },
      { name: 'Contacto', href: '#contact' }
    ]
  };

  return (
    <footer id="contact">
      {/* Instagram Section - Conditional Background */}
      <div className={`${isShopPage ? 'bg-cream' : 'bg-white'} text-charcoal py-16 lg:py-24 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div ref={elementRef} className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Content */}
            <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <h3 className="font-serif font-light text-3xl lg:text-4xl mb-6 text-charcoal">
                Sé parte de nuestra inspiración
              </h3>

              <p className="text-warm-gray text-lg font-light mb-8 max-w-md mx-auto lg:mx-0">
                Síguenos en instagram para ser parte del proceso e inspirar nuestros pares.
              </p>

              <div>
                <a
                  href="https://www.instagram.com/h.de.helena?igsh=MWVodHdrN2pjNDg0eg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-all duration-300 group"
                >
                  <Instagram size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
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
                  allowTransparency={true}
                  title="Instagram Feed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer & Bottom Bar - Dark Background */}
      <div className="bg-charcoal text-cream">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
            {/* Brand */}
            <div className="md:col-span-2 space-y-6">
              <img src="/logo.png" alt="H de Helena" className="h-16 w-auto mb-6 invert opacity-90" />

              <p className="text-cream/70 font-light leading-relaxed max-w-md">
                Creamos piezas artesanales que celebran la belleza de lo auténtico
                y la elegancia de lo simple. Cada objeto cuenta una historia de
                dedicación y maestría.
              </p>

              <div className="flex items-center space-x-6">
                <a href="#" className="text-cream/60 hover:text-cream transition-colors duration-300">
                  <Instagram size={20} strokeWidth={1.5} />
                </a>
                <a href="mailto:hola@hdehelena.com" className="text-cream/60 hover:text-cream transition-colors duration-300">
                  <Mail size={20} strokeWidth={1.5} />
                </a>
                <a href="tel:+34123456789" className="text-cream/60 hover:text-cream transition-colors duration-300">
                  <Phone size={20} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Atención al Cliente */}
            <div className="space-y-6">
              <h4 className="font-serif text-lg text-cream">Atención al Cliente</h4>
              <ul className="space-y-3">
                {footerLinks.atención.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-cream/60 hover:text-cream transition-colors duration-300 font-light"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compañía */}
            <div className="space-y-6">
              <h4 className="font-serif text-lg text-cream">Compañía</h4>
              <ul className="space-y-3">
                {footerLinks.compañía.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-cream/60 hover:text-cream transition-colors duration-300 font-light"
                    >
                      {link.name}
                    </a>
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
              <p className="text-cream/50 text-sm font-light">
                © 2026 H de Helena. Todos los derechos reservados.
              </p>

              <div className="flex items-center space-x-6 text-sm">
                <a href="#privacy" className="text-cream/50 hover:text-cream/70 transition-colors duration-300">
                  Privacidad
                </a>
                <a href="#terms" className="text-cream/50 hover:text-cream/70 transition-colors duration-300">
                  Términos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}