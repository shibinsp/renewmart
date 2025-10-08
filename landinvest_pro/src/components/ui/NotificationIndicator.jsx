import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const NotificationIndicator = ({ 
  notifications = [], 
  position = 'top-right',
  maxVisible = 5,
  autoHide = true,
  hideDelay = 5000 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setVisibleNotifications(notifications?.slice(0, maxVisible));
  }, [notifications, maxVisible]);

  useEffect(() => {
    if (autoHide && visibleNotifications?.length > 0) {
      const timer = setTimeout(() => {
        setVisibleNotifications(prev => prev?.slice(1));
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [visibleNotifications, autoHide, hideDelay]);

  const handleDismiss = (notificationId) => {
    setVisibleNotifications(prev => 
      prev?.filter(notification => notification?.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success text-success-foreground border-success';
      case 'warning':
        return 'bg-warning text-warning-foreground border-warning';
      case 'error':
        return 'bg-error text-error-foreground border-error';
      case 'info':
        return 'bg-primary text-primary-foreground border-primary';
      default:
        return 'bg-card text-card-foreground border-border';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-4';
      case 'top-right':
        return 'top-20 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-20 right-4';
    }
  };

  if (visibleNotifications?.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionStyles()} max-w-sm w-full space-y-2`}>
      {visibleNotifications?.map((notification, index) => (
        <div
          key={notification?.id}
          className={`
            relative p-4 rounded-lg border shadow-elevation-2 animate-fade-in
            ${getNotificationStyles(notification?.type)}
            ${index > 0 ? 'mt-2' : ''}
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start space-x-3">
            <Icon 
              name={getNotificationIcon(notification?.type)} 
              size={20} 
              className="flex-shrink-0 mt-0.5"
            />
            
            <div className="flex-1 min-w-0">
              {notification?.title && (
                <h4 className="font-body font-medium text-sm mb-1">
                  {notification?.title}
                </h4>
              )}
              
              <p className="font-body text-sm opacity-90 leading-relaxed">
                {notification?.message}
              </p>
              
              {notification?.timestamp && (
                <p className="font-caption text-xs opacity-70 mt-2">
                  {new Date(notification.timestamp)?.toLocaleTimeString()}
                </p>
              )}
              
              {notification?.actions && notification?.actions?.length > 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  {notification?.actions?.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action?.onClick}
                      className="text-xs font-medium underline hover:no-underline transition-smooth focus:outline-none focus:ring-2 focus:ring-ring rounded px-1"
                    >
                      {action?.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleDismiss(notification?.id)}
              className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          
          {notification?.progress !== undefined && (
            <div className="mt-3 bg-black/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-current h-full transition-all duration-300 ease-out"
                style={{ width: `${notification?.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
      {notifications?.length > maxVisible && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-2 text-center text-sm font-body text-muted-foreground hover:text-primary bg-card border border-border rounded-lg shadow-elevation-1 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {isExpanded ? 'Show Less' : `+${notifications?.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
};

export default NotificationIndicator;