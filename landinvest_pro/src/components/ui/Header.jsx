import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ userRole = 'landowner', notifications = {} }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: userRole === 'admin' ? '/admin-dashboard' : '/landowner-dashboard',
      icon: 'LayoutDashboard',
      roles: ['landowner', 'admin'],
      badge: notifications?.dashboard || 0
    },
    {
      label: 'Projects',
      path: userRole === 'admin' ? '/document-review' : '/document-upload',
      icon: 'FolderOpen',
      roles: ['landowner', 'admin', 'reviewer'],
      badge: notifications?.projects || 0
    },
    {
      label: 'Opportunities',
      path: '/investor-portal',
      icon: 'TrendingUp',
      roles: ['investor'],
      badge: notifications?.opportunities || 0
    },
    {
      label: 'Account',
      path: '/register',
      icon: 'User',
      roles: ['landowner', 'admin', 'investor', 'reviewer'],
      badge: notifications?.account || 0
    }
  ];

  const moreMenuItems = [
    {
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      roles: ['landowner', 'admin', 'investor', 'reviewer']
    },
    {
      label: 'Help',
      path: '/help',
      icon: 'HelpCircle',
      roles: ['landowner', 'admin', 'investor', 'reviewer']
    },
    {
      label: 'Admin',
      path: '/admin',
      icon: 'Shield',
      roles: ['admin']
    }
  ];

  const filteredNavItems = navigationItems?.filter(item => 
    item?.roles?.includes(userRole)
  );

  const filteredMoreItems = moreMenuItems?.filter(item => 
    item?.roles?.includes(userRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMoreMenuOpen && !event?.target?.closest('.more-menu-container')) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-elevation-1">
      <div className="max-w-9xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer transition-smooth hover:opacity-80"
            onClick={() => handleNavigation('/')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Leaf" size={20} color="white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-semibold text-lg text-foreground leading-tight">
                  LandInvest
                </span>
                <span className="font-heading font-medium text-xs text-primary leading-tight">
                  Pro
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {filteredNavItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  relative flex items-center space-x-2 px-4 py-2 rounded-lg font-body font-medium text-sm
                  transition-smooth hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring
                  ${isActivePath(item?.path) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:text-primary'
                  }
                `}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
                {item?.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item?.badge > 99 ? '99+' : item?.badge}
                  </span>
                )}
              </button>
            ))}

            {/* More Menu */}
            {filteredMoreItems?.length > 0 && (
              <div className="relative more-menu-container">
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-body font-medium text-sm text-foreground hover:bg-muted hover:text-primary transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Icon name="MoreHorizontal" size={18} />
                  <span>More</span>
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 animate-fade-in">
                    {filteredMoreItems?.map((item) => (
                      <button
                        key={item?.path}
                        onClick={() => handleNavigation(item?.path)}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-body text-popover-foreground hover:bg-muted transition-smooth"
                      >
                        <Icon name={item?.icon} size={16} />
                        <span>{item?.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative bg-card border-r border-border h-full w-80 max-w-[80vw] shadow-elevation-3 animate-slide-in">
            <nav className="p-4 space-y-2">
              {filteredNavItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`
                    relative w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-body font-medium text-base
                    transition-smooth focus:outline-none focus:ring-2 focus:ring-ring
                    ${isActivePath(item?.path) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-muted hover:text-primary'
                    }
                  `}
                >
                  <Icon name={item?.icon} size={20} />
                  <span className="flex-1 text-left">{item?.label}</span>
                  {item?.badge > 0 && (
                    <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full min-w-[24px] text-center">
                      {item?.badge > 99 ? '99+' : item?.badge}
                    </span>
                  )}
                </button>
              ))}

              {filteredMoreItems?.length > 0 && (
                <>
                  <div className="border-t border-border my-4" />
                  {filteredMoreItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-body font-medium text-base text-foreground hover:bg-muted hover:text-primary transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <Icon name={item?.icon} size={20} />
                      <span className="flex-1 text-left">{item?.label}</span>
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;