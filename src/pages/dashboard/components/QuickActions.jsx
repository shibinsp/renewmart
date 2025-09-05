import React from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../../../components/AppIcon';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Browse Marketplace',
      description: 'Find new PPA opportunities',
      icon: 'Store',
      color: 'primary',
      path: '/marketplace'
    },
    {
      id: 2,
      title: 'Create Project',
      description: 'Start a new renewable energy project',
      icon: 'Plus',
      color: 'success',
      action: 'create-project'
    },
    {
      id: 3,
      title: 'Upload Documents',
      description: 'Add project documentation',
      icon: 'Upload',
      color: 'secondary',
      path: '/document-management'
    },
    {
      id: 4,
      title: 'Schedule Meeting',
      description: 'Book consultation with advisor',
      icon: 'Calendar',
      color: 'warning',
      action: 'schedule-meeting'
    }
  ];

  const handleActionClick = (action) => {
    if (action?.path) {
      navigate(action?.path);
    } else if (action?.action === 'create-project') {
      navigate('/project-management');
    } else if (action?.action === 'schedule-meeting') {
      // Handle meeting scheduling
      console.log('Opening meeting scheduler...');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Icon name="Zap" size={20} className="text-primary" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => handleActionClick(action)}
            className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/5 transition-smooth text-left group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              action?.color === 'success' ? 'bg-success/10 text-success' :
              action?.color === 'warning' ? 'bg-warning/10 text-warning' :
              action?.color === 'secondary'? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
            }`}>
              <Icon name={action?.icon} size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth">
                {action?.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {action?.description}
              </p>
            </div>
            
            <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-smooth" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;