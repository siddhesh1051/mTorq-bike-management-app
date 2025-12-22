import React from 'react';
import { DollarSign, Lock, BarChart3, Map, Bike } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <DollarSign size={32} />,
      title: 'Smart Expense Tracking',
      description: 'Track fuel, service, insurance, and all bike-related expenses. Log odometer readings, add detailed notes, and manage multiple motorcycles from one dashboard. Advanced filtering and search make finding any expense instant.',
      image: 'https://images.unsplash.com/photo-1764231467896-73f0ef4438aa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxleHBlbnNlJTIwdHJhY2tpbmd8ZW58MHx8fHwxNzY2NDE3MjQwfDA&ixlib=rb-4.1.0&q=85',
    },
    {
      icon: <Lock size={32} />,
      title: 'Digital Document Vault',
      description: 'Never lose important documents again. Securely store RC certificates, insurance policies, PUC certificates, service records, and more. Access, view, download, or share documents anytime, anywhere.',
      image: 'https://images.unsplash.com/photo-1654764450215-c37782b66dd3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2V8ZW58MHx8fHwxNzY2NDE3MjM1fDA&ixlib=rb-4.1.0&q=85',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Powerful Analytics',
      description: 'Visualize your spending with intuitive charts and breakdowns. Track category-wise expenses, identify patterns, and optimize your bike maintenance costs with real-time insights.',
      image: 'https://images.pexels.com/photos/35271266/pexels-photo-35271266.jpeg',
    },
    {
      icon: <Map size={32} />,
      title: 'Trip Timeline & Mileage Tracker',
      description: 'View your complete riding history in a beautiful timeline. Track mileage for each trip, monitor distance covered, and see your bike\'s journey unfold with detailed expense logs mapped to every ride.',
      image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlfGVufDB8fHx8MTc2NjQxNzI0Nnww&ixlib=rb-4.1.0&q=85',
    },
    {
      icon: <Bike size={32} />,
      title: 'Multi-Bike Management',
      description: 'Own multiple bikes? No problem. Track expenses and documents separately for each motorcycle. Switch between bikes effortlessly and get individual analytics for each.',
      image: 'https://images.unsplash.com/photo-1588627541420-fce3f661b779?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxtb3RvcmN5Y2xlfGVufDB8fHx8MTc2NjQxNzI0Nnww&ixlib=rb-4.1.0&q=85',
    },
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Powerful Features</span> for Complete Control
          </h2>
          <p className="text-xl text-white/85 max-w-3xl mx-auto">
            Everything you need to manage your motorcycle expenses in one comprehensive platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-8 group"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* iPhone Mockup */}
              <div className="mb-6 relative overflow-hidden h-48 rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ccfbf1]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Icon */}
              <div className="mb-4 text-[#ccfbf1] group-hover:text-[#99f6e4] transition-colors duration-400">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-white/70 text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;