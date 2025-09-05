import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivitySidebar = ({ isCollapsed, onToggleCollapse }) => {
  const [activeTab, setActiveTab] = useState('saved');

  const savedSearches = [
    {
      id: 1,
      name: "California Solar 50MW+",
      filters: "Solar, California, 50-100MW",
      results: 12,
      lastUpdated: "2 hours ago"
    },
    {
      id: 2,
      name: "Texas Wind Projects",
      filters: "Wind, Texas, $45-55/MWh",
      results: 8,
      lastUpdated: "1 day ago"
    },
    {
      id: 3,
      name: "Hydro Northeast",
      filters: "Hydro, Northeast, 6-12 months",
      results: 3,
      lastUpdated: "3 days ago"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'view',
      title: 'Arizona Solar Farm Delta',
      action: 'Viewed details',
      timestamp: '15 minutes ago',
      icon: 'Eye'
    },
    {
      id: 2,
      type: 'interest',
      title: 'Nevada Wind Project Gamma',
      action: 'Expressed interest',
      timestamp: '1 hour ago',
      icon: 'MessageCircle'
    },
    {
      id: 3,
      type: 'watchlist',
      title: 'Florida Solar Installation',
      action: 'Added to watchlist',
      timestamp: '2 hours ago',
      icon: 'Heart'
    },
    {
      id: 4,
      type: 'view',
      title: 'Oregon Hydro Project',
      action: 'Viewed details',
      timestamp: '1 day ago',
      icon: 'Eye'
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: 'New Mexico Solar Farm',
      reason: 'Similar to your recent searches',
      capacity: '75 MW',
      price: '$48/MWh',
      match: 92
    },
    {
      id: 2,
      title: 'Colorado Wind Project',
      reason: 'Based on your location preferences',
      capacity: '120 MW',
      price: '$52/MWh',
      match: 87
    },
    {
      id: 3,
      title: 'Utah Solar Installation',
      reason: 'Matches your capacity requirements',
      capacity: '60 MW',
      price: '$46/MWh',
      match: 84
    }
  ];

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-l border-border p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="w-full mb-4"
        >
          <Icon name="Activity" size={20} />
        </Button>
        <div className="space-y-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Bookmark" size={14} className="text-primary" />
          </div>
          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
            <Icon name="Clock" size={14} className="text-secondary" />
          </div>
          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon name="Target" size={14} className="text-accent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Activity</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'saved' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'recent' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
              activeTab === 'recommended' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            For You
          </button>
        </div>

        {/* Saved Searches Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Saved Searches</h3>
              <Button variant="ghost" size="sm">
                <Icon name="Plus" size={14} className="mr-1" />
                New
              </Button>
            </div>
            {savedSearches?.map((search) => (
              <div key={search?.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">
                    {search?.name}
                  </h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Icon name="MoreVertical" size={12} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {search?.filters}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary font-medium">
                    {search?.results} results
                  </span>
                  <span className="text-muted-foreground">
                    {search?.lastUpdated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
            {recentActivity?.map((activity) => (
              <div key={activity?.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name={activity?.icon} size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-1">
                    {activity?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity?.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity?.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full">
              View All Activity
            </Button>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommended' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Recommended for You</h3>
            {recommendations?.map((rec) => (
              <div key={rec?.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">
                    {rec?.title}
                  </h4>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {rec?.match}% match
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {rec?.reason}
                </p>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-foreground font-medium">
                    {rec?.capacity}
                  </span>
                  <span className="text-foreground font-medium">
                    {rec?.price}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-xs text-muted-foreground">Projects Viewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">8</div>
              <div className="text-xs text-muted-foreground">Inquiries Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">12</div>
              <div className="text-xs text-muted-foreground">Watchlisted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">3</div>
              <div className="text-xs text-muted-foreground">Saved Searches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySidebar;