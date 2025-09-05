import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'PPA Agreement Signed',
      message: 'Solar Farm Project Alpha agreement has been successfully executed.',
      timestamp: '2 minutes ago',
      read: false,
      category: 'project'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Document Review Required',
      message: 'Environmental impact assessment needs your review by EOD.',
      timestamp: '15 minutes ago',
      read: false,
      category: 'document'
    },
    {
      id: 3,
      type: 'info',
      title: 'New Marketplace Listing',
      message: '50MW Wind Farm available in Texas region.',
      timestamp: '1 hour ago',
      read: true,
      category: 'marketplace'
    },
    {
      id: 4,
      type: 'error',
      title: 'Payment Processing Failed',
      message: 'Monthly subscription payment could not be processed.',
      timestamp: '2 hours ago',
      read: false,
      category: 'billing'
    },
    {
      id: 5,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance window this weekend from 2-4 AM EST.',
      timestamp: '1 day ago',
      read: true,
      category: 'system'
    }
  ]);

  const dropdownRef = useRef(null);
  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev?.map(notification => 
        notification?.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev?.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev?.filter(notification => notification?.id !== id));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevated z-300 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-smooth"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications?.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications?.map((notification) => (
                  <div
                    key={notification?.id}
                    className={`relative px-4 py-3 hover:bg-muted transition-smooth cursor-pointer ${
                      !notification?.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification?.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon 
                        name={getNotificationIcon(notification?.type)} 
                        size={16} 
                        className={`mt-0.5 ${getNotificationColor(notification?.type)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {notification?.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e?.stopPropagation();
                              deleteNotification(notification?.id);
                            }}
                            className="ml-2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification?.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {notification?.timestamp}
                          </span>
                          <span className="text-xs text-primary font-medium capitalize">
                            {notification?.category}
                          </span>
                        </div>
                      </div>
                      {!notification?.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;