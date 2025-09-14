import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';

const RoleBasedSidebar = ({ collapsed, onToggle }) => {
    const { user, hasRole, hasAnyRole } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    // Define navigation items based on roles
    const getNavigationItems = () => {
        const baseItems = [
            {
                label: 'Dashboard',
                icon: 'LayoutDashboard',
                path: '/dashboard',
                description: 'Overview and analytics'
            }
        ];

        // Add role-specific items
    if (hasRole('landowner')) {
      baseItems.push(
        {
          label: 'My Properties',
          icon: 'MapPin',
          path: '/landowner/properties',
          description: 'Manage your land listings'
        },
        {
          label: 'Register Site',
          icon: 'Plus',
          path: '/landowner/site-registration',
          description: 'Register new land for development'
        },
        {
          label: 'Inquiries',
          icon: 'MessageCircle',
          path: '/landowner/inquiries',
          description: 'View investor interest'
        },
        {
          label: 'Documents',
          icon: 'FileText',
          path: '/landowner/documents',
          description: 'Property documentation'
        }
      );
    }

        if (hasRole('investor')) {
            baseItems.push(
                {
                    label: 'Browse Properties',
                    icon: 'Search',
                    path: '/investor/browse',
                    description: 'Find investment opportunities'
                },
                {
                    label: 'My Portfolio',
                    icon: 'Briefcase',
                    path: '/investor/portfolio',
                    description: 'Manage investments'
                },
                {
                    label: 'Market Analysis',
                    icon: 'TrendingUp',
                    path: '/investor/analysis',
                    description: 'Market insights'
                }
            );
        }

    if (hasRole('administrator')) {
      baseItems.push(
        {
          label: 'Workflow Management',
          icon: 'Settings',
          path: '/admin/workflows',
          description: 'Manage site registration workflows'
        },
        {
          label: 'User Management',
          icon: 'Users',
          path: '/admin/users',
          description: 'Manage user accounts'
        },
        {
          label: 'System Reports',
          icon: 'BarChart3',
          path: '/admin/reports',
          description: 'Platform analytics'
        },
        {
          label: 'Content Review',
          icon: 'FileCheck',
          path: '/admin/review',
          description: 'Review properties'
        },
        {
          label: 'System Settings',
          icon: 'Settings',
          path: '/admin/settings',
          description: 'Platform configuration'
        }
      );
    }

        if (hasRole('re_governance_lead')) {
            baseItems.push(
                {
                    label: 'Review Queue',
                    icon: 'FileCheck',
                    path: '/governance/review',
                    description: 'Review submissions'
                },
                {
                    label: 'Compliance',
                    icon: 'Shield',
                    path: '/governance/compliance',
                    description: 'Compliance monitoring'
                },
                {
                    label: 'Policies',
                    icon: 'FileText',
                    path: '/governance/policies',
                    description: 'Policy management'
                }
            );
        }

    if (hasRole('re_sales_advisor')) {
      baseItems.push(
        {
          label: 'Task Management',
          icon: 'CheckSquare',
          path: '/roles/tasks',
          description: 'Manage assigned tasks'
        },
        {
          label: 'Sales Pipeline',
          icon: 'TrendingUp',
          path: '/sales/pipeline',
          description: 'Manage sales opportunities'
        },
        {
          label: 'Clients',
          icon: 'Users',
          path: '/sales/clients',
          description: 'Client management'
        },
        {
          label: 'Deals',
          icon: 'Handshake',
          path: '/sales/deals',
          description: 'Deal tracking'
        }
      );
    }

    if (hasRole('re_analyst')) {
      baseItems.push(
        {
          label: 'Task Management',
          icon: 'CheckSquare',
          path: '/roles/tasks',
          description: 'Manage assigned tasks'
        },
        {
          label: 'Analysis Queue',
          icon: 'BarChart3',
          path: '/analyst/queue',
          description: 'Pending analyses'
        },
        {
          label: 'Reports',
          icon: 'FileText',
          path: '/analyst/reports',
          description: 'Analysis reports'
        },
        {
          label: 'Data Tools',
          icon: 'Database',
          path: '/analyst/tools',
          description: 'Analysis tools'
        }
      );
    }

    if (hasRole('project_manager')) {
      baseItems.push(
        {
          label: 'Task Management',
          icon: 'CheckSquare',
          path: '/roles/tasks',
          description: 'Manage assigned tasks'
        },
        {
          label: 'Projects',
          icon: 'FolderOpen',
          path: '/project-management',
          description: 'Project lifecycle management'
        },
        {
          label: 'Team',
          icon: 'Users',
          path: '/project-management/team',
          description: 'Team management'
        }
      );
    }

        // Common items for all roles
        baseItems.push(
            {
                label: 'Marketplace',
                icon: 'Store',
                path: '/marketplace',
                description: 'Browse and manage PPAs'
            },
            {
                label: 'Documents',
                icon: 'FileText',
                path: '/document-management',
                description: 'Document repository'
            }
        );

        return baseItems;
    };

    const navigationItems = getNavigationItems();

    return (
        <div className={`fixed left-0 top-16 h-full bg-card border-r border-border transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'
            }`}>
            <div className="flex flex-col h-full">
                {/* Navigation Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        {!collapsed && (
                            <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
                        )}
                        <button
                            onClick={onToggle}
                            className="p-1 rounded-md hover:bg-muted transition-colors"
                        >
                            <Icon
                                name={collapsed ? 'ChevronRight' : 'ChevronLeft'}
                                size={16}
                                className="text-muted-foreground"
                            />
                        </button>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navigationItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${isActive(item.path)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon
                                name={item.icon}
                                size={20}
                                className={`flex-shrink-0 ${isActive(item.path) ? 'text-primary-foreground' : 'text-current'
                                    }`}
                            />
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{item.label}</div>
                                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Info Footer */}
                {!collapsed && (
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name="User" size={16} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                    {user?.first_name && user?.last_name
                                        ? `${user.first_name} ${user.last_name}`
                                        : 'User'
                                    }
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {user?.roles?.[0]?.replace('re_', '').replace('_', ' ') || 'User'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleBasedSidebar;
