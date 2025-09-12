import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingTasks = () => {
  const tasks = [
    {
      id: 1,
      title: 'Review Environmental Impact Assessment',
      project: 'Solar Farm Project Alpha',
      dueDate: 'Today, 5:00 PM',
      priority: 'high',
      assignee: 'You',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Schedule Site Inspection',
      project: 'Wind Energy Project Beta',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'medium',
      assignee: 'Sarah Johnson',
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Finalize PPA Terms',
      project: 'Hydroelectric Project Gamma',
      dueDate: 'Dec 27, 2024',
      priority: 'high',
      assignee: 'Michael Chen',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Submit Regulatory Documentation',
      project: 'Solar Farm Project Alpha',
      dueDate: 'Dec 28, 2024',
      priority: 'low',
      assignee: 'Emily Rodriguez',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Investor Presentation Prep',
      project: 'Wind Energy Project Beta',
      dueDate: 'Dec 30, 2024',
      priority: 'medium',
      assignee: 'David Park',
      status: 'pending'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'in-progress': return 'Clock';
      case 'pending': return 'Circle';
      default: return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in-progress': return 'text-warning';
      case 'pending': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Tasks</h3>
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
          Add Task
        </Button>
      </div>
      <div className="space-y-4">
        {tasks?.map((task) => (
          <div key={task?.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
            <button className={`flex-shrink-0 ${getStatusColor(task?.status)}`}>
              <Icon name={getStatusIcon(task?.status)} size={16} />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium truncate ${
                  task?.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}>
                  {task?.title}
                </h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task?.priority)}`}>
                  {task?.priority}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground truncate mb-1">
                {task?.project}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Due: {task?.dueDate}
                </span>
                <span className="text-xs text-primary font-medium">
                  {task?.assignee}
                </span>
              </div>
            </div>
            
            <button className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
              <Icon name="MoreHorizontal" size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Button variant="ghost" fullWidth iconName="ArrowRight" iconPosition="right">
          View All Tasks
        </Button>
      </div>
    </div>
  );
};

export default UpcomingTasks;