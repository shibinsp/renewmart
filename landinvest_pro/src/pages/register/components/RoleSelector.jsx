import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RoleSelector = ({ selectedRole, onRoleChange, error }) => {
  const roles = [
    {
      id: 'landowner',
      label: 'Landowner',
      description: 'I own land suitable for renewable energy projects and want to explore monetization opportunities.',
      icon: 'MapPin',
      features: ['List land parcels', 'Upload documentation', 'Connect with investors', 'Track project progress']
    },
    {
      id: 'investor',
      label: 'Investor',
      description: 'I represent an investment firm or energy company looking for renewable energy land opportunities.',
      icon: 'TrendingUp',
      features: ['Browse land opportunities', 'Express investment interest', 'Access due diligence documents', 'Schedule site visits']
    },
    {
      id: 'admin',
      label: 'Administrative',
      description: 'I work in document review, compliance, or project management for renewable energy initiatives.',
      icon: 'Shield',
      features: ['Review documentation', 'Manage approval workflows', 'Assign tasks to specialists', 'Generate compliance reports']
    }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {roles?.map((role) => (
          <div
            key={role?.id}
            className={`
              relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedRole === role?.id 
                ? 'border-primary bg-primary/5 shadow-elevation-1' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
            onClick={() => onRoleChange(role?.id)}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                ${selectedRole === role?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                <Icon name={role?.icon} size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {role?.label}
                  </h3>
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedRole === role?.id 
                      ? 'border-primary bg-primary' :'border-border bg-background'
                    }
                  `}>
                    {selectedRole === role?.id && (
                      <Icon name="Check" size={12} color="white" />
                    )}
                  </div>
                </div>
                
                <p className="font-body text-sm text-muted-foreground mb-3 leading-relaxed">
                  {role?.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {role?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Icon name="CheckCircle" size={14} className="text-success flex-shrink-0" />
                      <span className="font-body text-xs text-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="flex items-center space-x-2 text-error">
          <Icon name="AlertCircle" size={16} />
          <span className="font-body text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;