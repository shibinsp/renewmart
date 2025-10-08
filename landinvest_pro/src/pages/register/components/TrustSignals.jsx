import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const certifications = [
    {
      name: 'SSL Secured',
      icon: 'Shield',
      description: 'Your data is encrypted and secure'
    },
    {
      name: 'GDPR Compliant',
      icon: 'Lock',
      description: 'Privacy protection guaranteed'
    },
    {
      name: 'Industry Certified',
      icon: 'Award',
      description: 'Renewable energy industry standards'
    },
    {
      name: 'SOC 2 Type II',
      icon: 'CheckCircle',
      description: 'Security and availability verified'
    }
  ];

  const stats = [
    { label: 'Active Projects', value: '2,500+', icon: 'Zap' },
    { label: 'MW Capacity', value: '15,000+', icon: 'Battery' },
    { label: 'Registered Users', value: '50,000+', icon: 'Users' },
    { label: 'Success Rate', value: '98%', icon: 'TrendingUp' }
  ];

  return (
    <div className="space-y-6">
      {/* Security Badges */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center">
          <Icon name="Shield" size={16} className="mr-2 text-primary" />
          Security & Compliance
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {certifications?.map((cert, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={cert?.icon} size={14} className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-body font-medium text-xs text-foreground">
                  {cert?.name}
                </div>
                <div className="font-body text-xs text-muted-foreground leading-tight">
                  {cert?.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Platform Statistics */}
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center">
          <Icon name="BarChart3" size={16} className="mr-2 text-primary" />
          Platform Statistics
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {stats?.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon name={stat?.icon} size={18} color="white" />
              </div>
              <div className="font-heading font-bold text-lg text-primary">
                {stat?.value}
              </div>
              <div className="font-body text-xs text-muted-foreground">
                {stat?.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-4 text-center">
        <div className="flex items-center space-x-1">
          <Icon name="Users" size={14} className="text-success" />
          <span className="font-body text-xs text-muted-foreground">Trusted by 500+ companies</span>
        </div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
        <div className="flex items-center space-x-1">
          <Icon name="Star" size={14} className="text-warning fill-current" />
          <span className="font-body text-xs text-muted-foreground">4.9/5 rating</span>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;