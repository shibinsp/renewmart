import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'document_uploaded':
        return 'Upload';
      case 'review_assigned':
        return 'UserCheck';
      case 'status_changed':
        return 'RefreshCw';
      case 'comment_added':
        return 'MessageCircle';
      case 'deadline_approaching':
        return 'Clock';
      case 'task_completed':
        return 'CheckCircle';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'document_uploaded':
        return 'text-primary';
      case 'review_assigned':
        return 'text-secondary';
      case 'status_changed':
        return 'text-warning';
      case 'comment_added':
        return 'text-accent';
      case 'deadline_approaching':
        return 'text-error';
      case 'task_completed':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 border-b border-border">
        <h3 className="font-heading font-semibold text-lg text-foreground">Recent Activity</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities?.map((activity) => (
              <div key={activity?.id} className="p-4 hover:bg-muted/30 transition-smooth">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                    <Icon name={getActivityIcon(activity?.type)} size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground leading-relaxed">
                      <span className="font-medium">{activity?.user}</span> {activity?.action}
                      {activity?.target && (
                        <span className="font-medium"> {activity?.target}</span>
                      )}
                    </p>
                    
                    {activity?.details && (
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        {activity?.details}
                      </p>
                    )}
                    
                    <p className="font-body text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(activity?.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;