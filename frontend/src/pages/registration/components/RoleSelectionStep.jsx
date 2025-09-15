import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleSelectionStep = ({ formData, setFormData, errors }) => {
  const roles = [
    {
      id: 'landowner',
      title: 'Landowner',
      icon: 'MapPin',
      description: 'Property owner seeking renewable energy opportunities',
      features: ['Property listing tools', 'Site assessment requests', 'Contract management', 'Revenue tracking']
    },
    {
      id: 'investor',
      title: 'Investor',
      icon: 'TrendingUp',
      description: 'Investment professional focused on renewable energy assets',
      features: ['Deal flow management', 'Due diligence tools', 'Portfolio tracking', 'Financial analysis']
    },
    {
      id: 're_sales_advisor',
      title: 'RE Sales Advisor',
      icon: 'Users',
      description: 'Sales professional managing client relationships',
      features: ['Market evaluation', 'Investor alignment', 'Land valuation reports', 'Sale contracts']
    },
    {
      id: 're_analyst',
      title: 'RE Analyst',
      icon: 'BarChart3',
      description: 'Technical and financial analysis specialist',
      features: ['Feasibility analysis', 'Financial models', 'Grid connectivity', 'Technical surveys']
    },
    {
      id: 'project_manager',
      title: 'Project Manager',
      icon: 'FolderOpen',
      description: 'Operations professional overseeing project development',
      features: ['Project tracking', 'Resource management', 'Timeline management', 'Team coordination']
    },
    {
      id: 're_governance_lead',
      title: 'RE Governance Lead',
      icon: 'Shield',
      description: 'Compliance and regulatory specialist',
      features: ['Regulatory compliance', 'Environmental assessments', 'Government approvals', 'Risk assessment']
    },
    {
      id: 'administrator',
      title: 'Administrator',
      icon: 'Settings',
      description: 'System administrator managing platform operations',
      features: ['User management', 'System configuration', 'Security monitoring', 'Platform analytics']
    }
  ];

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Choose Your Role</h2>
        <p className="text-muted-foreground">Select the role that best describes your involvement in renewable energy</p>
      </div>
      {errors?.role && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors?.role}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles?.map((role) => (
          <div
            key={role?.id}
            onClick={() => handleRoleSelect(role?.id)}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-moderate ${
              formData?.role === role?.id
                ? 'border-primary bg-primary/5 shadow-moderate'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                formData?.role === role?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon name={role?.icon} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{role?.title}</h3>
                  {formData?.role === role?.id && (
                    <Icon name="CheckCircle" size={20} className="text-primary" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {role?.description}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Key Features:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {role?.features?.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Need help choosing?</p>
            <p>Your role determines the features and tools available to you. You can contact support to change your role later if needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionStep;