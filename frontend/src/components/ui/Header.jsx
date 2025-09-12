import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Marketplace', path: '/marketplace', icon: 'Store' },
    { label: 'Projects', path: '/project-management', icon: 'FolderOpen' },
    { label: 'Documents', path: '/document-management', icon: 'FileText' }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-200 h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">RenewMart</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                isActivePath(item?.path)
                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Global Search - Desktop */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          {/* Notification Center */}
          <NotificationCenter />

          {/* User Profile */}
          <UserProfileDropdown />

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-card border-b border-border shadow-moderate z-250">
          <div className="px-6 py-4 space-y-2">
            {/* Mobile Search */}
            <div className="md:hidden mb-4">
              <GlobalSearch />
            </div>

            {/* Mobile Navigation Items */}
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-smooth ${
                  isActivePath(item?.path)
                    ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;