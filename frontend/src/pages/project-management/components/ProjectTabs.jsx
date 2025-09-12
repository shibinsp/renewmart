import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectTabs = ({ activeTab, onTabChange, tabCounts }) => {
  const tabs = [
    {
      id: 'active',
      label: 'Active Projects',
      icon: 'Play',
      count: tabCounts?.active || 0
    },
    {
      id: 'planning',
      label: 'Planning Phase',
      icon: 'Calendar',
      count: tabCounts?.planning || 0
    },
    {
      id: 'development',
      label: 'In Development',
      icon: 'Construction',
      count: tabCounts?.development || 0
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: 'CheckCircle',
      count: tabCounts?.completed || 0
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      <div className="flex flex-wrap">
        {tabs?.map((tab, index) => (
          <button
            key={tab?.id}
            onClick={() => onTabChange(tab?.id)}
            className={`flex-1 min-w-0 px-4 py-3 text-sm font-medium transition-smooth relative ${
              activeTab === tab?.id
                ? 'text-primary bg-primary/10 border-b-2 border-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
            } ${
              index === 0 ? 'rounded-tl-lg' : ''
            } ${
              index === tabs?.length - 1 ? 'rounded-tr-lg' : 'border-r border-border'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon 
                name={tab?.icon} 
                size={16} 
                className={activeTab === tab?.id ? 'text-primary' : 'text-current'}
              />
              <span className="hidden sm:inline truncate">{tab?.label}</span>
              <span className="sm:hidden truncate">{tab?.label?.split(' ')?.[0]}</span>
              {tab?.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {tab?.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectTabs;