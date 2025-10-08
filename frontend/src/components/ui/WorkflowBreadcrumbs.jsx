import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const WorkflowBreadcrumbs = ({ customBreadcrumbs = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/': { label: 'Home', icon: 'Home' },
    '/register': { label: 'Account Registration', icon: 'UserPlus' },
    '/landowner-dashboard': { label: 'Landowner Dashboard', icon: 'LayoutDashboard' },
    '/document-upload': { label: 'Document Upload', icon: 'Upload' },
    '/admin-dashboard': { label: 'Admin Dashboard', icon: 'Shield' },
    '/document-review': { label: 'Document Review', icon: 'FileCheck' },
    '/investor-portal': { label: 'Investment Opportunities', icon: 'TrendingUp' },
    '/settings': { label: 'Settings', icon: 'Settings' },
    '/help': { label: 'Help Center', icon: 'HelpCircle' },
    '/admin': { label: 'Administration', icon: 'ShieldCheck' }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [{ label: 'Home', path: '/', icon: 'Home' }];

    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap?.[currentPath];
      
      if (routeInfo) {
        breadcrumbs?.push({
          label: routeInfo?.label,
          path: currentPath,
          icon: routeInfo?.icon,
          isLast: index === pathSegments?.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  const handleNavigation = (path) => {
    if (path && path !== location?.pathname) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 py-3 px-4 lg:px-6 bg-background border-b border-border" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm font-body">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path || index} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-muted-foreground mx-2" 
              />
            )}
            
            {crumb?.isLast || !crumb?.path ? (
              <span className="flex items-center space-x-2 text-foreground font-medium">
                <Icon name={crumb?.icon} size={16} />
                <span>{crumb?.label}</span>
              </span>
            ) : (
              <button
                onClick={() => handleNavigation(crumb?.path)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 py-0.5"
              >
                <Icon name={crumb?.icon} size={16} />
                <span>{crumb?.label}</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default WorkflowBreadcrumbs;