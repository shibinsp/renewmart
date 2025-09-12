import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const ProjectCard = ({ project, onViewDetails, isExpanded, onToggleExpand }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-success bg-success/10';
      case 'planning': return 'text-warning bg-warning/10';
      case 'in development': return 'text-primary bg-primary/10';
      case 'completed': return 'text-muted-foreground bg-muted';
      case 'on hold': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 60) return 'bg-primary';
    if (progress >= 40) return 'bg-warning';
    return 'bg-error';
  };

  const formatBudget = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle hover:shadow-moderate transition-smooth">
      {/* Card Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{project?.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status)}`}>
                {project?.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span>{project?.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Zap" size={14} />
                <span>{project?.capacity}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Calendar" size={14} />
                <span>{project?.timeline}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDetails(project)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
            >
              <Icon name="ExternalLink" size={16} />
            </button>
            <button
              onClick={() => onToggleExpand(project?.id)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Card Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">{project?.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project?.progress)}`}
                style={{ width: `${project?.progress}%` }}
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <span className="text-sm font-medium text-foreground block mb-2">Budget</span>
            <div className="text-lg font-semibold text-foreground">
              {formatBudget(project?.budget?.spent)} / {formatBudget(project?.budget?.total)}
            </div>
            <div className="text-xs text-muted-foreground">
              {((project?.budget?.spent / project?.budget?.total) * 100)?.toFixed(1)}% utilized
            </div>
          </div>

          {/* Next Milestone */}
          <div>
            <span className="text-sm font-medium text-foreground block mb-2">Next Milestone</span>
            <div className="text-sm text-foreground">{project?.nextMilestone?.title}</div>
            <div className="text-xs text-muted-foreground">{project?.nextMilestone?.date}</div>
          </div>
        </div>

        {/* Team Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-foreground">Team:</span>
            <div className="flex -space-x-2">
              {project?.team?.slice(0, 4)?.map((member, index) => (
                <div
                  key={member?.id}
                  className="w-8 h-8 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-xs font-medium text-primary"
                  title={member?.name}
                >
                  {member?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                </div>
              ))}
              {project?.team?.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{project?.team?.length - 4}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Updated {project?.lastUpdated}</span>
          </div>
        </div>
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border p-6 bg-muted/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Recent Activities</h4>
              <div className="space-y-3">
                {project?.recentActivities?.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity?.description}</p>
                      <p className="text-xs text-muted-foreground">{activity?.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Tasks Completed</div>
                  <div className="text-lg font-semibold text-foreground">
                    {project?.metrics?.tasksCompleted}/{project?.metrics?.totalTasks}
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Days Remaining</div>
                  <div className="text-lg font-semibold text-foreground">
                    {project?.metrics?.daysRemaining}
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                  <div className={`text-sm font-medium ${
                    project?.metrics?.riskLevel === 'Low' ? 'text-success' :
                    project?.metrics?.riskLevel === 'Medium' ? 'text-warning' : 'text-error'
                  }`}>
                    {project?.metrics?.riskLevel}
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">ROI Forecast</div>
                  <div className="text-lg font-semibold text-success">
                    {project?.metrics?.roiForecast}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;