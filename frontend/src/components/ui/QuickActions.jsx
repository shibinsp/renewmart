import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActions = ({ 
  userRole = 'landowner', 
  currentContext = null,
  onActionComplete = () => {},
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getContextualActions = () => {
    const currentPath = location?.pathname;
    
    const actionMap = {
      '/landowner-dashboard': [
        {
          id: 'new-project',
          label: 'New Project',
          icon: 'Plus',
          variant: 'default',
          onClick: () => navigate('/document-upload'),
          roles: ['landowner']
        },
        {
          id: 'view-opportunities',
          label: 'View Opportunities',
          icon: 'TrendingUp',
          variant: 'outline',
          onClick: () => navigate('/investor-portal'),
          roles: ['landowner']
        }
      ],
      '/document-upload': [
        {
          id: 'upload-documents',
          label: 'Upload Files',
          icon: 'Upload',
          variant: 'default',
          onClick: () => document.getElementById('file-upload')?.click(),
          roles: ['landowner']
        },
        {
          id: 'save-draft',
          label: 'Save Draft',
          icon: 'Save',
          variant: 'outline',
          onClick: () => onActionComplete('save-draft'),
          roles: ['landowner']
        }
      ],
      '/admin-dashboard': [
        {
          id: 'review-pending',
          label: 'Review Pending',
          icon: 'FileCheck',
          variant: 'default',
          onClick: () => navigate('/document-review'),
          roles: ['admin']
        },
        {
          id: 'generate-report',
          label: 'Generate Report',
          icon: 'BarChart3',
          variant: 'outline',
          onClick: () => onActionComplete('generate-report'),
          roles: ['admin']
        }
      ],
      '/document-review': [
        {
          id: 'approve-document',
          label: 'Approve',
          icon: 'CheckCircle',
          variant: 'success',
          onClick: () => onActionComplete('approve'),
          roles: ['admin', 'reviewer']
        },
        {
          id: 'request-changes',
          label: 'Request Changes',
          icon: 'AlertCircle',
          variant: 'warning',
          onClick: () => onActionComplete('request-changes'),
          roles: ['admin', 'reviewer']
        },
        {
          id: 'reject-document',
          label: 'Reject',
          icon: 'XCircle',
          variant: 'destructive',
          onClick: () => onActionComplete('reject'),
          roles: ['admin', 'reviewer']
        }
      ],
      '/investor-portal': [
        {
          id: 'express-interest',
          label: 'Express Interest',
          icon: 'Heart',
          variant: 'default',
          onClick: () => onActionComplete('express-interest'),
          roles: ['investor']
        },
        {
          id: 'request-info',
          label: 'Request Info',
          icon: 'MessageCircle',
          variant: 'outline',
          onClick: () => onActionComplete('request-info'),
          roles: ['investor']
        },
        {
          id: 'schedule-visit',
          label: 'Schedule Visit',
          icon: 'Calendar',
          variant: 'outline',
          onClick: () => onActionComplete('schedule-visit'),
          roles: ['investor']
        }
      ],
      '/register': [
        {
          id: 'quick-register',
          label: 'Quick Register',
          icon: 'Zap',
          variant: 'default',
          onClick: () => onActionComplete('quick-register'),
          roles: ['landowner', 'investor']
        }
      ]
    };

    const actions = actionMap?.[currentPath] || [];
    return actions?.filter(action => action?.roles?.includes(userRole));
  };

  const actions = getContextualActions();

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-24 right-6';
      case 'top-left':
        return 'top-24 left-6';
      case 'center-right':
        return 'top-1/2 right-6 transform -translate-y-1/2';
      case 'center-left':
        return 'top-1/2 left-6 transform -translate-y-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  if (actions?.length === 0) {
    return null;
  }

  const primaryAction = actions?.[0];
  const secondaryActions = actions?.slice(1);

  return (
    <div className={`fixed z-40 ${getPositionStyles()}`}>
      <div className="flex flex-col items-end space-y-3">
        {/* Secondary Actions */}
        {isExpanded && secondaryActions?.length > 0 && (
          <div className="flex flex-col items-end space-y-2 animate-fade-in">
            {secondaryActions?.map((action, index) => (
              <div
                key={action?.id}
                className="flex items-center space-x-3"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <span className="bg-card text-card-foreground px-3 py-1.5 rounded-lg shadow-elevation-1 text-sm font-body font-medium whitespace-nowrap">
                  {action?.label}
                </span>
                <Button
                  variant={action?.variant}
                  size="icon"
                  onClick={action?.onClick}
                  className="w-12 h-12 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200"
                >
                  <Icon name={action?.icon} size={20} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3">
          {isExpanded && (
            <span className="bg-card text-card-foreground px-3 py-1.5 rounded-lg shadow-elevation-1 text-sm font-body font-medium whitespace-nowrap animate-fade-in">
              {primaryAction?.label}
            </span>
          )}
          
          <div className="relative">
            <Button
              variant={primaryAction?.variant}
              size="icon"
              onClick={primaryAction?.onClick}
              className="w-14 h-14 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200"
            >
              <Icon name={primaryAction?.icon} size={24} />
            </Button>
            
            {/* Expand/Collapse Button */}
            {secondaryActions?.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -top-2 -left-2 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center shadow-elevation-1 hover:bg-accent hover:text-accent-foreground transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Icon 
                  name={isExpanded ? "Minus" : "Plus"} 
                  size={12} 
                />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-background/20 backdrop-blur-sm lg:hidden -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default QuickActions;