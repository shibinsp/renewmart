import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigationItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: 'LayoutDashboard',
      description: 'Overview and analytics'
    },
    { 
      label: 'Marketplace', 
      path: '/marketplace', 
      icon: 'Store',
      description: 'Browse and manage PPAs'
    },
    { 
      label: 'Projects', 
      path: '/project-management', 
      icon: 'FolderOpen',
      description: 'Project lifecycle management'
    },
    { 
      label: 'Documents', 
      path: '/document-management', 
      icon: 'FileText',
      description: 'Document repository'
    }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 bg-card border-r border-border z-100 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-sm font-medium text-muted-foreground">Navigation</h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems?.map((item) => (
              <li key={item?.path}>
                <Link
                  to={item?.path}
                  onMouseEnter={() => setHoveredItem(item?.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`relative flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-smooth group ${
                    isActivePath(item?.path)
                      ? 'text-primary bg-primary/10 border border-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={item?.icon} 
                    size={18} 
                    className={isActivePath(item?.path) ? 'text-primary' : 'text-current'}
                  />
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item?.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item?.description}
                      </div>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActivePath(item?.path) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}

                  {/* Tooltip for Collapsed State */}
                  {isCollapsed && hoveredItem === item?.path && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-popover border border-border rounded-md shadow-moderate z-300 whitespace-nowrap">
                      <div className="font-medium text-sm">{item?.label}</div>
                      <div className="text-xs text-muted-foreground">{item?.description}</div>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center space-x-3 px-3 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">John Doe</div>
                <div className="text-xs text-muted-foreground">Project Manager</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;