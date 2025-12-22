import React from 'react';
import { TrendingDown, Folder, TrendingUp } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: <TrendingDown size={40} />,
      title: 'Save Money',
      description: 'Identify spending patterns and optimize maintenance costs with data-driven insights.',
      gradient: 'from-[#ccfbf1]/20 to-[#99f6e4]/10',
    },
    {
      icon: <Folder size={40} />,
      title: 'Stay Organized',
      description: 'All your bike documents in one secure digital vault - accessible from anywhere.',
      gradient: 'from-[#99f6e4]/20 to-[#115e59]/10',
    },
    {
      icon: <TrendingUp size={40} />,
      title: 'Track Your Journey',
      description: 'Visualize every trip with mileage tracking and expense logging in an intuitive timeline view.',
      gradient: 'from-[#115e59]/20 to-[#ccfbf1]/10',
    },
  ];

  return (
    <section id="benefits" className="py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Why Choose <span className="gradient-text">mTorq?</span>
          </h2>
          <p className="text-xl text-white/85 max-w-3xl mx-auto">
            Experience the benefits of comprehensive motorcycle expense management
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="glass-card p-10 relative overflow-hidden group"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-6 text-[#ccfbf1] group-hover:scale-110 transition-transform duration-400 inline-block">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">{benefit.title}</h3>
                <p className="text-white/70 text-lg leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;