import React from 'react';
import Spline from '@splinetool/react-spline';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ paddingTop: '80px' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 1px, transparent 1px, transparent 7.6923%), repeating-linear-gradient(-90deg, #fff, #fff 1px, transparent 1px, transparent 7.6923%)',
            backgroundSize: '100% 100%',
          }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Track Every Mile,{' '}
              <span className="gradient-text glow-text">Manage Every Rupee</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/85 leading-relaxed">
              The complete bike expense management solution. Track expenses, store documents securely, and gain powerful insights into your motorcycle's financial journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection('cta')}
                className="btn-primary group"
              >
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button className="btn-secondary group">
                <Play size={20} />
                View Demo
              </button>
            </div>
          </div>

          {/* Right 3D Animation */}
          <div className="relative h-[500px] lg:h-[700px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div style={{ width: '700px', height: '700px', overflow: 'visible', position: 'relative' }}>
                <Spline scene="https://prod.spline.design/NbVmy6DPLhY-5Lvg/scene.splinecode" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
};

export default Hero;