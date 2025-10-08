import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectSummaryCards = ({ summaryData }) => {
  const cards = [
    {
      id: 'total-land',
      title: 'Total Land Area',
      value: summaryData?.totalLandArea,
      unit: 'acres',
      icon: 'MapPin',
      color: 'bg-primary',
      textColor: 'text-primary-foreground'
    },
    {
      id: 'active-projects',
      title: 'Active Projects',
      value: summaryData?.activeProjects,
      unit: 'projects',
      icon: 'Activity',
      color: 'bg-success',
      textColor: 'text-success-foreground'
    },
    {
      id: 'completed-submissions',
      title: 'Completed Submissions',
      value: summaryData?.completedSubmissions,
      unit: 'submissions',
      icon: 'CheckCircle',
      color: 'bg-accent',
      textColor: 'text-accent-foreground'
    },
    {
      id: 'estimated-revenue',
      title: 'Estimated Revenue',
      value: `$${summaryData?.estimatedRevenue}`,
      unit: '/MWh',
      icon: 'DollarSign',
      color: 'bg-warning',
      textColor: 'text-warning-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card border border-border rounded-lg p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card?.color} ${card?.textColor} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-heading font-semibold text-foreground">
                {card?.value}
              </div>
              <div className="text-sm font-body text-muted-foreground">
                {card?.unit}
              </div>
            </div>
          </div>
          <h3 className="text-sm font-body font-medium text-muted-foreground">
            {card?.title}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default ProjectSummaryCards;