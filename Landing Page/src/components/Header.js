import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
      style={{ height: '80px' }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold gradient-text">mTorq</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-[#4D4D4D] hover:text-white transition-colors duration-300 text-lg"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('benefits')}
            className="text-[#4D4D4D] hover:text-white transition-colors duration-300 text-lg"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="text-[#4D4D4D] hover:text-white transition-colors duration-300 text-lg"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection('cta')}
            className="btn-primary"
          >
            Get Started
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 right-0 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/10">
          <nav className="flex flex-col p-6 gap-4">
            <button
              onClick={() => scrollToSection('features')}
              className="text-[#4D4D4D] hover:text-white transition-colors duration-300 text-lg text-left py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="text-[#4D4D4D] hover:text-white transition-colors duration-300 text-lg text-left py-2"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[#4D4D4D] hover:text-white transition-colors duration-300 text-lg text-left py-2"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('cta')}
              className="btn-primary mt-2"
            >
              Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;