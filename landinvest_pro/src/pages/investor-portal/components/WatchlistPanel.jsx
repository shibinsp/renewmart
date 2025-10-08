import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const WatchlistPanel = ({ watchlistItems, onRemoveFromWatchlist, onViewProject, onExpressInterest }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(price);
  };

  const getProjectTypeIcon = (type) => {
    const iconMap = {
      'Solar': 'Sun',
      'Wind': 'Wind',
      'Hydroelectric': 'Waves',
      'Biomass': 'Leaf',
      'Geothermal': 'Zap'
    };
    return iconMap?.[type] || 'Zap';
  };

  const displayItems = isExpanded ? watchlistItems : watchlistItems?.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Heart" size={18} />
          <span>Watchlist</span>
          {watchlistItems?.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {watchlistItems?.length}
            </span>
          )}
        </h3>
        
        {watchlistItems?.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={14}
          >
            {isExpanded ? 'Show Less' : `Show All (${watchlistItems?.length})`}
          </Button>
        )}
      </div>
      {/* Watchlist Items */}
      <div className="space-y-3">
        {watchlistItems?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Icon name="Heart" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No projects in watchlist</p>
            <p className="text-xs">Save interesting projects to track them here</p>
          </div>
        ) : (
          displayItems?.map((item) => (
            <div
              key={item?.id}
              className="flex items-center space-x-3 p-3 bg-muted hover:bg-muted/80 rounded-lg transition-smooth group"
            >
              {/* Project Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item?.image}
                  alt={`${item?.name} project thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm line-clamp-1">
                    {item?.name}
                  </h4>
                  <Icon 
                    name={getProjectTypeIcon(item?.type)} 
                    size={12} 
                    className="text-primary flex-shrink-0" 
                  />
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  <Icon name="MapPin" size={10} className="mr-1" />
                  <span className="line-clamp-1">{item?.location}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item?.capacity?.toLocaleString('en-US')} MW
                  </span>
                  <span className="font-medium text-foreground">
                    {formatPrice(item?.pricePerMWh)}/MWh
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewProject(item?.id)}
                  iconName="Eye"
                  iconSize={14}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExpressInterest(item?.id)}
                  iconName="Heart"
                  iconSize={14}
                  className="text-primary hover:text-primary"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFromWatchlist(item?.id)}
                  iconName="X"
                  iconSize={14}
                  className="text-destructive hover:text-destructive"
                />
              </div>
            </div>
          ))
        )}
      </div>
      {/* Quick Actions */}
      {watchlistItems?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                watchlistItems?.forEach(item => onExpressInterest(item?.id));
              }}
              iconName="Heart"
              iconPosition="left"
              iconSize={14}
              className="flex-1"
            >
              Express Interest in All
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                watchlistItems?.forEach(item => onRemoveFromWatchlist(item?.id));
              }}
              iconName="Trash2"
              iconSize={14}
              className="text-destructive hover:text-destructive"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPanel;