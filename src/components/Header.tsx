import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cart } from '../types';

interface HeaderProps {
  cart: Cart;
  onCartClick: () => void;
}

export default function Header({ cart, onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isShopPage = location.pathname === '/shop';

  const navigation = [
    { name: 'Inicio', href: '/', isRoute: true },
    { name: 'Colección', href: isShopPage ? '/shop' : '#collection', isRoute: isShopPage },
    { name: 'Sobre Nosotros', href: isShopPage ? '/#philosophy' : '#philosophy', isRoute: false },
    { name: 'Contacto', href: '#contact', isRoute: false },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-200/95 backdrop-blur-sm border-b border-stone/20">
      <nav className="w-full mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-1 flex justify-start lg:flex-none lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <Link
              to="/"
              className="block hover:opacity-80 transition-opacity"
              onClick={() => window.scrollTo(0, 0)}
            >
              <img src="/logo.png" alt="H de Helena" className="h-12 lg:h-16 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12 absolute left-8">
            {navigation.map((item) => (
              item.isRoute ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="font-sans uppercase text-warm-gray hover:text-charcoal transition-colors duration-300 font-medium tracking-wide text-sm"
                  onClick={() => {
                    if (item.href === '/') window.scrollTo(0, 0);
                  }}
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-sans uppercase text-warm-gray hover:text-charcoal transition-colors duration-300 font-medium tracking-wide text-sm"
                >
                  {item.name}
                </a>
              )
            ))}
          </div>

          {/* Cart and User Icons */}
          <div className="flex items-center space-x-4 ml-auto">
            <button
              onClick={onCartClick}
              className="relative p-2 text-warm-gray hover:text-charcoal transition-colors duration-300"
              aria-label="Carrito de compras"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-charcoal text-cream text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
                  {cart.itemCount}
                </span>
              )}
            </button>

            <button className="p-2 text-warm-gray hover:text-charcoal transition-colors duration-300">
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-warm-gray hover:text-charcoal transition-colors duration-300"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-stone/20 animate-fade-in">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                item.isRoute ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (item.href === '/') window.scrollTo(0, 0);
                    }}
                    className="font-sans uppercase text-warm-gray hover:text-charcoal transition-colors duration-300 font-medium tracking-wide py-2"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-sans uppercase text-warm-gray hover:text-charcoal transition-colors duration-300 font-medium tracking-wide py-2"
                  >
                    {item.name}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}