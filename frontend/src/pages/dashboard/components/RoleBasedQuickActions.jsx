import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const RoleBasedQuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getActionsForRole = (roles) => {
    // Check if user has specific roles
    const hasRole = (role) => roles?.includes(role);
    
    if (hasRole('landowner')) {
      return [
        {
          id: 1,
          title: 'List New Property',
          description: 'Add your land to the marketplace',
          icon: 'MapPin',
          color: 'primary',
          path: '/landowner/properties/new'
        },
        {
          id: 2,
          title: 'Upload Documents',
          description: 'Add property documentation',
          icon: 'Upload',
          color: 'success',
          path: '/landowner/documents'
        },
        {
          id: 3,
          title: 'View Inquiries',
          description: 'Check investor interest',
          icon: 'MessageCircle',
          color: 'secondary',
          path: '/landowner/inquiries'
        },
        {
          id: 4,
          title: 'Property Analytics',
          description: 'View performance metrics',
          icon: 'BarChart3',
          color: 'warning',
          path: '/landowner/analytics'
        }
      ];
    }
    
    if (hasRole('investor')) {
      return [
        {
          id: 1,
          title: 'Browse Properties',
          description: 'Find investment opportunities',
          icon: 'Search',
          color: 'primary',
          path: '/investor/browse'
        },
        {
          id: 2,
          title: 'My Portfolio',
          description: 'Manage investments',
          icon: 'Briefcase',
          color: 'success',
          path: '/investor/portfolio'
        },
        {
          id: 3,
          title: 'Express Interest',
          description: 'Contact property owners',
          icon: 'Heart',
          color: 'secondary',
          path: '/investor/interests'
        },
        {
          id: 4,
          title: 'Market Analysis',
          description: 'View market trends',
          icon: 'TrendingUp',
          color: 'warning',
          path: '/investor/analysis'
        }
      ];
    }
    
    if (hasRole('administrator') || hasRole('re_governance_lead')) {
      return [
        {
          id: 1,
          title: 'User Management',
          description: 'Manage user accounts and roles',
          icon: 'Users',
          color: 'primary',
          path: '/admin/users'
        },
        {
          id: 2,
          title: 'Review Properties',
          description: 'Approve property listings',
          icon: 'CheckCircle',
          color: 'success',
          path: '/admin/properties/review'
        },
        {
          id: 3,
          title: 'System Reports',
          description: 'View platform analytics',
          icon: 'FileText',
          color: 'secondary',
          path: '/admin/reports'
        },
        {
          id: 4,
          title: 'Platform Settings',
          description: 'Configure system settings',
          icon: 'Settings',
          color: 'warning',
          path: '/admin/settings'
        }
      ];
    }
    
    // Default actions for other roles (sales advisor, analyst, project manager)
    return [
      {
        id: 1,
        title: 'Browse Marketplace',
        description: 'Find new opportunities',
        icon: 'Store',
        color: 'primary',
        path: '/marketplace'
      },
      {
        id: 2,
        title: 'Create Project',
        description: 'Start a new project',
        icon: 'Plus',
        color: 'success',
        path: '/projects/new'
      },
      {
        id: 3,
        title: 'Client Management',
        description: 'Manage client relationships',
        icon: 'Users',
        color: 'secondary',
        path: '/clients'
      },
      {
        id: 4,
        title: 'Reports & Analytics',
        description: 'View performance data',
        icon: 'BarChart3',
        color: 'warning',
        path: '/reports'
      }
    ];
  };

  const actions = getActionsForRole(user?.roles || []);
  const userRoleDisplay = user?.roles?.[0]?.replace('re_', '').replace('_', ' ') || 'User';

  const handleActionClick = (action) => {
    if (action?.path) {
      navigate(action?.path);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground capitalize">{userRoleDisplay} Dashboard</p>
        </div>
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

export default RoleBasedQuickActions;