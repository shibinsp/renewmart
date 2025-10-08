import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeadlineAlerts = ({ alerts }) => {
  const navigate = useNavigate();

  const getAlertIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'AlertTriangle';
      case 'warning':
        return 'Clock';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getAlertStyles = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-error/10 border-error/20 text-error';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
        return 'bg-primary/10 border-primary/20 text-primary';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const formatDeadline = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffInHours = Math.ceil((deadlineDate - now) / (1000 * 60 * 60));

    if (diffInHours < 0) return 'Overdue';
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    if (diffInHours < 168) return `${Math.ceil(diffInHours / 24)}d remaining`;
    return deadlineDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleViewTask = (taskId) => {
    navigate('/document-review', { state: { taskId } });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground">Deadline Alerts</h3>
          {alerts?.length > 0 && (
            <span className="bg-error text-error-foreground text-xs font-medium px-2 py-1 rounded-full">
              {alerts?.length}
            </span>
          )}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {alerts?.length === 0 ? (
          <div className="p-6 text-center">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-3" />
            <p className="font-body text-sm text-muted-foreground">No upcoming deadlines</p>
            <p className="font-body text-xs text-muted-foreground mt-1">All tasks are on track</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts?.map((alert) => (
              <div key={alert?.id} className="p-4">
                <div className={`rounded-lg border p-3 ${getAlertStyles(alert?.urgency)}`}>
                  <div className="flex items-start space-x-3">
                    <Icon name={getAlertIcon(alert?.urgency)} size={20} className="flex-shrink-0 mt-0.5" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-body font-medium text-sm">
                          {alert?.taskTitle}
                        </h4>
                        <span className="font-body text-xs font-medium">
                          {formatDeadline(alert?.deadline)}
                        </span>
                      </div>
                      
                      <p className="font-body text-xs opacity-90 mb-2">
                        Assigned to: {alert?.assignedTo}
                      </p>
                      
                      <p className="font-body text-xs opacity-80 leading-relaxed mb-3">
                        {alert?.description}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTask(alert?.taskId)}
                          className="text-current hover:bg-current/10"
                        >
                          View Task
                        </Button>
                        {alert?.urgency === 'critical' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-current hover:bg-current/10"
                          >
                            Escalate
                          </Button>
                        )}
                      </div>
                    </div>
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

export default DeadlineAlerts;