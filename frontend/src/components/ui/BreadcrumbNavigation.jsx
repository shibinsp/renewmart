import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbNavigation = ({ customBreadcrumbs = null }) => {
  const location = useLocation();

  // Default breadcrumb mapping based on routes
  const routeMapping = {
    '/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/marketplace': { label: 'Marketplace', icon: 'Store' },
    '/project-management': { label: 'Projects', icon: 'FolderOpen' },
    '/document-management': { label: 'Documents', icon: 'FileText' },
    '/profile': { label: 'Profile', icon: 'User' },
    '/settings': { label: 'Settings', icon: 'Settings' },
    '/billing': { label: 'Billing', icon: 'CreditCard' },
    '/team': { label: 'Team', icon: 'Users' },
    '/help': { label: 'Help', icon: 'HelpCircle' }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Dashboard as home
    if (location?.pathname !== '/dashboard') {
      breadcrumbs?.push({
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMapping?.[currentPath];
      
      if (routeInfo) {
        breadcrumbs?.push({
          label: routeInfo?.label,
          path: currentPath,
          icon: routeInfo?.icon,
          isLast: index === pathSegments?.length - 1
        });
      } else {
        // Handle dynamic segments (like IDs)
        const formattedLabel = segment?.split('-')?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1))?.join(' ');
        
        breadcrumbs?.push({
          label: formattedLabel,
          path: currentPath,
          icon: 'ChevronRight',
          isLast: index === pathSegments?.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render breadcrumbs on login/registration pages or if only one item
  if (location?.pathname === '/login' || 
      location?.pathname === '/registration' || 
      breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path} className="flex items-center space-x-2">
            {index > 0 && (
              <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
            )}
            
            {crumb?.isLast ? (
              <span className="flex items-center space-x-1.5 text-foreground font-medium">
                <Icon name={crumb?.icon} size={14} />
                <span>{crumb?.label}</span>
              </span>
            ) : (
              <Link
                to={crumb?.path}
                className="flex items-center space-x-1.5 hover:text-foreground transition-smooth"
              >
                <Icon name={crumb?.icon} size={14} />
                <span>{crumb?.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;