import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProjectCard = ({ project, onViewDetails, onExpressInterest, onSaveToWatchlist, isWatchlisted = false }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(price);
  };

  const formatCapacity = (capacity) => {
    return `${capacity?.toLocaleString('en-US')} MW`;
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

  const getProjectTypeColor = (type) => {
    const colorMap = {
      'Solar': 'text-yellow-600 bg-yellow-50',
      'Wind': 'text-blue-600 bg-blue-50',
      'Hydroelectric': 'text-cyan-600 bg-cyan-50',
      'Biomass': 'text-green-600 bg-green-50',
      'Geothermal': 'text-orange-600 bg-orange-50'
    };
    return colorMap?.[type] || 'text-primary bg-primary/10';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-300 overflow-hidden group">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={project?.image}
          alt={`${project?.name} renewable energy project`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Project Type Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getProjectTypeColor(project?.type)}`}>
          <Icon name={getProjectTypeIcon(project?.type)} size={12} />
          <span>{project?.type}</span>
        </div>

        {/* Watchlist Button */}
        <button
          onClick={() => onSaveToWatchlist(project?.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Icon 
            name={isWatchlisted ? "Heart" : "Heart"} 
            size={16} 
            className={isWatchlisted ? "text-red-500 fill-current" : "text-muted-foreground"} 
          />
        </button>

        {/* Status Indicator */}
        {project?.status && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
            {project?.status}
          </div>
        )}
      </div>
      {/* Project Details */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-1 line-clamp-1">
            {project?.name}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <Icon name="MapPin" size={14} className="mr-1" />
            <span className="line-clamp-1">{project?.location}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Capacity</div>
            <div className="font-heading font-semibold text-foreground">
              {formatCapacity(project?.capacity)}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Price/MWh</div>
            <div className="font-heading font-semibold text-foreground">
              {formatPrice(project?.pricePerMWh)}
            </div>
          </div>
        </div>

        {/* Timeline & Contract */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timeline:</span>
            <span className="font-medium text-foreground">{project?.timeline}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Contract:</span>
            <span className="font-medium text-foreground">{project?.contractDuration}</span>
          </div>
        </div>

        {/* Partners */}
        {project?.partners && project?.partners?.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">Partners</div>
            <div className="flex flex-wrap gap-1">
              {project?.partners?.slice(0, 2)?.map((partner, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
                >
                  {partner}
                </span>
              ))}
              {project?.partners?.length > 2 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  +{project?.partners?.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(project?.id)}
            className="flex-1"
            iconName="Eye"
            iconPosition="left"
            iconSize={14}
          >
            View Details
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onExpressInterest(project?.id)}
            className="flex-1"
            iconName="Heart"
            iconPosition="left"
            iconSize={14}
          >
            Express Interest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;