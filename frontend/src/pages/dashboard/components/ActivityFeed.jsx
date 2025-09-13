import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { dummyActivities, getActivitiesByUser } from '../../../data/dummyData';
import { useAuth } from '../../../contexts/AuthContext';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load activities using dummy data
    const loadActivities = () => {
      setTimeout(() => {
        // Get user-specific activities or show all activities
        let userActivities = dummyActivities;
        
        // If user has specific roles, filter activities accordingly
        if (user?.roles?.includes('landowner')) {
          userActivities = dummyActivities.filter(activity => 
            activity.type === 'land_listing' || 
            activity.type === 'document_upload' ||
            activity.userId === user.id
          );
        } else if (user?.roles?.includes('investor')) {
          userActivities = dummyActivities.filter(activity => 
            activity.type === 'investment' || 
            activity.type === 'project_update' ||
            activity.userId === user.id
          );
        }
        
        // Format activities for display
        const formattedActivities = userActivities.map(activity => {
          const timeAgo = getTimeAgo(activity.timestamp);
          return {
            id: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            timestamp: timeAgo,
            user: activity.user?.name || 'System',
            avatar: activity.user?.avatar || null,
            status: getActivityStatus(activity.type)
          };
        });
        
        setActivities(formattedActivities);
        setLoading(false);
      }, 1000);
    };

    loadActivities();
  }, [user]);
  
  // Helper function to calculate time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return activityTime.toLocaleDateString();
  };
  
  // Helper function to get activity status
  const getActivityStatus = (type) => {
    switch (type) {
      case 'project_update':
      case 'task_completion':
      case 'document_upload':
        return 'success';
      case 'investment':
      case 'land_listing':
        return 'info';
      case 'system_alert':
        return 'warning';
      default:
        return 'info';
    }
  };

  const oldActivities = [
    {
      id: 1,
      type: 'project',
      title: 'Solar Farm Project Alpha',
      description: 'Environmental impact assessment completed',
      user: 'Sarah Johnson',
      timestamp: '2 hours ago',
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      id: 2,
      type: 'marketplace',
      title: 'New PPA Listing',
      description: '100MW Wind Farm available in Texas',
      user: 'Michael Chen',
      timestamp: '4 hours ago',
      icon: 'Plus',
      color: 'primary'
    },
    {
      id: 3,
      type: 'document',
      title: 'Contract Signed',
      description: 'Power Purchase Agreement executed for Project Beta',
      user: 'Emily Rodriguez',
      timestamp: '6 hours ago',
      icon: 'FileText',
      color: 'secondary'
    },
    {
      id: 4,
      type: 'project',
      title: 'Site Assessment',
      description: 'Technical evaluation scheduled for tomorrow',
      user: 'David Park',
      timestamp: '8 hours ago',
      icon: 'Calendar',
      color: 'warning'
    },
    {
      id: 5,
      type: 'marketplace',
      title: 'Investor Interest',
      description: 'New inquiry for California Solar Project',
      user: 'Lisa Thompson',
      timestamp: '1 day ago',
      icon: 'Users',
      color: 'primary'
    }
  ];

  const getIconColor = (color) => {
    switch (color) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'secondary': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
            <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getIconColor(activity?.color)}`}>
              <Icon name={activity?.icon} size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {activity?.title}
                </h4>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {activity?.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activity?.description}
              </p>
              <p className="text-xs text-primary font-medium mt-1">
                by {activity?.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;