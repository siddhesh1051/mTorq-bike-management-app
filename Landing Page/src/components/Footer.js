import React from 'react';
import { ArrowRight } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative">
      {/* CTA Section */}
      <section id="cta" className="py-32 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <div className="glass-card p-12 md:p-16 relative overflow-hidden group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ccfbf1]/10 via-transparent to-[#115e59]/10 opacity-50 group-hover:opacity-100 transition-opacity duration-400" />
            
            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Ready to Take Control of Your <span className="gradient-text">Bike Expenses?</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/85 mb-8 leading-relaxed">
                Start tracking your motorcycle expenses smarter, not harder. Join mTorq today and never lose track of another expense, trip, or document.
              </p>
              <button className="btn-primary text-xl px-8 group">
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Bottom */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo */}
            <button onClick={scrollToTop} className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity">
              mTorq
            </button>

            {/* Copyright */}
            <p className="text-white/50 text-sm">
              © 2025 mTorq. All rights reserved.
            </p>

            {/* Links */}
            <div className="flex gap-6">
              <a href="#" className="text-white/50 hover:text-[#ccfbf1] transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-white/50 hover:text-[#ccfbf1] transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;