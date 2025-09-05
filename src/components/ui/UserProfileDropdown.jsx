import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userInfo = {
    name: 'John Doe',
    email: 'john.doe@renewmart.com',
    role: 'Project Manager',
    avatar: null
  };

  const menuItems = [
    { label: 'Profile Settings', icon: 'User', path: '/profile' },
    { label: 'Account Settings', icon: 'Settings', path: '/settings' },
    { label: 'Billing', icon: 'CreditCard', path: '/billing' },
    { label: 'Team Management', icon: 'Users', path: '/team' },
    { type: 'divider' },
    { label: 'Help Center', icon: 'HelpCircle', path: '/help' },
    { label: 'Keyboard Shortcuts', icon: 'Keyboard', action: 'shortcuts' },
    { type: 'divider' },
    { label: 'Sign Out', icon: 'LogOut', action: 'logout', variant: 'destructive' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    if (item?.action === 'logout') {
      // Handle logout logic
      console.log('Logging out...');
    } else if (item?.action === 'shortcuts') {
      // Handle shortcuts modal
      console.log('Opening shortcuts...');
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
      >
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="User" size={16} className="text-primary" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-foreground">{userInfo?.name}</div>
          <div className="text-xs text-muted-foreground">{userInfo?.role}</div>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevated z-300 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{userInfo?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{userInfo?.email}</div>
                <div className="text-xs text-primary font-medium">{userInfo?.role}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems?.map((item, index) => {
              if (item?.type === 'divider') {
                return <div key={index} className="my-1 border-t border-border" />;
              }

              const ItemComponent = item?.path ? Link : 'button';
              const itemProps = item?.path 
                ? { to: item?.path } 
                : { onClick: () => handleItemClick(item) };

              return (
                <ItemComponent
                  key={index}
                  {...itemProps}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-smooth ${
                    item?.variant === 'destructive' ?'text-error hover:bg-error/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={item?.icon} 
                    size={16} 
                    className={item?.variant === 'destructive' ? 'text-error' : 'text-current'}
                  />
                  <span>{item?.label}</span>
                </ItemComponent>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;