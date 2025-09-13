import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  const trustSignals = [
    { name: 'NABCEP', description: 'North American Board of Certified Energy Practitioners' },
    { name: 'IREC', description: 'Interstate Renewable Energy Council' },
    { name: 'SSL', description: 'Secure Socket Layer Encryption' },
    { name: 'SOC 2', description: 'System and Organization Controls 2' }
  ];

  const platformStats = [
    { value: '2.5GW+', label: 'Projects Facilitated' },
    { value: '500+', label: 'Active Partners' },
    { value: '$1.2B+', label: 'Transactions Processed' },
    { value: '99.9%', label: 'Platform Uptime' }
  ];

  return (
    <div className="h-full flex flex-col justify-between p-8 lg:p-12">
      {/* Logo and Branding */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="Zap" size={24} color="white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">RenewMart</h2>
          <p className="text-green-800 text-sm">Renewable Energy Marketplace</p>
        </div>
      </div>
      {/* Hero Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
            Accelerating the Energy Transition
          </h1>
          <p className="text-xl text-green-800 mb-8 leading-relaxed">
            Connect landowners, investors, and industry stakeholders through our integrated 
            marketplace and project management ecosystem for renewable energy assets.
          </p>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {platformStats?.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-black mb-1">{stat?.value}</div>
              <div className="text-sm text-green-700">{stat?.label}</div>
            </div>
          ))}
        </div>

        {/* Value Propositions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Shield" size={16} color="white" />
            </div>
            <span className="text-green-800">Enterprise-grade security and compliance</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Users" size={16} color="white" />
            </div>
            <span className="text-green-800">Multi-stakeholder collaboration platform</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="BarChart3" size={16} color="white" />
            </div>
            <span className="text-green-800">Real-time analytics and reporting</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="FileText" size={16} color="white" />
            </div>
            <span className="text-green-800">End-to-end project lifecycle management</span>
          </div>
        </div>
      </div>
      {/* Trust Signals */}
      <div className="mt-8">
        <p className="text-green-800 text-sm mb-4 text-center">Trusted by industry leaders</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustSignals?.map((signal, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center hover:bg-white/20 transition-smooth"
              title={signal?.description}
            >
              <div className="text-black font-semibold text-sm">{signal?.name}</div>
              <div className="text-green-700 text-xs mt-1">Certified</div>
            </div>
          ))}
        </div>
      </div>
      {/* Background Image Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Renewable energy solar panels and wind turbines landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/90"></div>
      </div>
    </div>
  );
};

export default HeroSection;