'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { href: '/#hero', label: t.nav.home },
    { href: '/#story', label: t.nav.story },
    { href: '/menu', label: t.nav.menu },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'gl' : 'es');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-charcoal-dark/95 backdrop-blur-lg border-b border-flame-blue/20 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
              <img 
                src="/images/logo.svg" 
                alt="La Parrilla de Champi" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white leading-tight">
                La Parrilla de Champi
              </h1>
              <p className="text-xs text-gray-400">{t.nav.subtitle}</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-fire-red transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <span className={`text-sm font-medium ${language === 'es' ? 'text-fire-red' : 'text-gray-400'}`}>ES</span>
              <span className="text-gray-600">|</span>
              <span className={`text-sm font-medium ${language === 'gl' ? 'text-fire-blue' : 'text-gray-400'}`}>GL</span>
            </button>

            <Link href="/menu" className="btn-fire !py-2 !px-6 !text-base">
              {t.nav.menu}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/5 border border-white/10"
            >
              <span className={`text-xs font-bold ${language === 'es' ? 'text-fire-red' : 'text-gray-400'}`}>ES</span>
              <span className="text-gray-600">/</span>
              <span className={`text-xs font-bold ${language === 'gl' ? 'text-fire-blue' : 'text-gray-400'}`}>GL</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-fire-red transition-colors font-medium text-lg"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-fire w-full text-center"
                >
                  {t.nav.menu}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

