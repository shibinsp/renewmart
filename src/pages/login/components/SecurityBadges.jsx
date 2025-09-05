import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Encryption',
      description: 'Bank-level security for all data transmission'
    },
    {
      icon: 'Lock',
      title: 'SOC 2 Compliant',
      description: 'Audited security controls and procedures'
    },
    {
      icon: 'Eye',
      title: 'Privacy Protected',
      description: 'GDPR and CCPA compliant data handling'
    },
    {
      icon: 'Server',
      title: '99.9% Uptime',
      description: 'Enterprise-grade infrastructure reliability'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mt-6">
      <div className="text-center mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Enterprise Security & Compliance
        </h3>
        <p className="text-xs text-muted-foreground">
          Your data is protected by industry-leading security measures
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {securityFeatures?.map((feature, index) => (
          <div 
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-smooth"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name={feature?.icon} size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-foreground mb-1">
                {feature?.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Certification Badges */}
      <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle" size={12} className="text-success" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">NABCEP Certified</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle" size={12} className="text-success" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">IREC Member</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;