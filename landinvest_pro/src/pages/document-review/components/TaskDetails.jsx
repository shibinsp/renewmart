import React from 'react';
import Icon from '../../../components/AppIcon';

const TaskDetails = ({ 
  taskInfo = {},
  reviewerInfo = {},
  projectInfo = {}
}) => {
  const mockTaskInfo = {
    id: 'TASK-2025-001',
    title: 'Land Ownership Documentation Review',
    assignedDate: '2025-01-10T09:00:00Z',
    dueDate: '2025-01-15T17:00:00Z',
    priority: 'high',
    status: 'in_progress',
    estimatedHours: 8,
    completedHours: 3.5,
    category: 'ownership_documents',
    ...taskInfo
  };

  const mockReviewerInfo = {
    name: 'Sarah Johnson',
    role: 'RE Analyst',
    department: 'Technical Review',
    email: 'sarah.johnson@landinvest.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    ...reviewerInfo
  };

  const mockProjectInfo = {
    name: 'Riverside Solar Farm Development',
    location: 'Madison County, Texas',
    capacity: '50 MW',
    projectType: 'Solar',
    landowner: 'Robert Martinez',
    totalDocuments: 12,
    reviewedDocuments: 7,
    ...projectInfo
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10 border-error/20';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'low':
        return 'text-success bg-success/10 border-success/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success/20';
      case 'in_progress':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'pending':
        return 'text-muted-foreground bg-muted border-border';
      case 'overdue':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const dueDate = new Date(mockTaskInfo.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false };
    } else if (diffDays === 1) {
      return { text: '1 day remaining', isOverdue: false };
    } else {
      return { text: `${diffDays} days remaining`, isOverdue: false };
    }
  };

  const timeRemaining = calculateTimeRemaining();
  const progressPercentage = Math.round((mockTaskInfo?.completedHours / mockTaskInfo?.estimatedHours) * 100);

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {mockTaskInfo?.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Task ID: {mockTaskInfo?.id}
            </p>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(mockTaskInfo?.priority)}`}>
                {mockTaskInfo?.priority?.toUpperCase()} PRIORITY
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mockTaskInfo?.status)}`}>
                {mockTaskInfo?.status?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
          </div>
          <Icon name="Clock" size={24} className="text-muted-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                Assigned: {new Date(mockTaskInfo.assignedDate)?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CalendarX" size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                Due: {new Date(mockTaskInfo.dueDate)?.toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className={`text-sm font-medium ${timeRemaining?.isOverdue ? 'text-error' : 'text-foreground'}`}>
                {timeRemaining?.text}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Target" size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                {mockTaskInfo?.completedHours}h / {mockTaskInfo?.estimatedHours}h
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Task Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      {/* Reviewer Information */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Icon name="User" size={18} className="text-primary" />
          <span>Assigned Reviewer</span>
        </h4>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
            <img
              src={mockReviewerInfo?.avatar}
              alt={mockReviewerInfo?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/assets/images/no_image.png';
              }}
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {mockReviewerInfo?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {mockReviewerInfo?.role} • {mockReviewerInfo?.department}
            </p>
            <p className="text-xs text-muted-foreground">
              {mockReviewerInfo?.email}
            </p>
          </div>
        </div>
      </div>
      {/* Project Information */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Building" size={18} className="text-primary" />
          <span>Project Details</span>
        </h4>
        
        <div className="space-y-3">
          <div>
            <p className="font-medium text-foreground">
              {mockProjectInfo?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {mockProjectInfo?.location}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Zap" size={16} className="text-primary" />
              <span className="text-foreground">
                {mockProjectInfo?.capacity} {mockProjectInfo?.projectType}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="User" size={16} className="text-primary" />
              <span className="text-foreground">
                {mockProjectInfo?.landowner}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Document Progress</span>
              <span className="text-foreground font-medium">
                {mockProjectInfo?.reviewedDocuments} / {mockProjectInfo?.totalDocuments}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(mockProjectInfo?.reviewedDocuments / mockProjectInfo?.totalDocuments) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Zap" size={18} className="text-primary" />
          <span>Quick Actions</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth text-left">
            <Icon name="MessageSquare" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Add Comment</span>
          </button>
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth text-left">
            <Icon name="Flag" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Flag Issue</span>
          </button>
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth text-left">
            <Icon name="Users" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Request Collaboration</span>
          </button>
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth text-left">
            <Icon name="Clock" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Request Extension</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;