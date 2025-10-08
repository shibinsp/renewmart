import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapView = ({ projects, onProjectSelect, selectedProject }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US
  const [zoom, setZoom] = useState(5);

  const projectMarkers = projects?.map(project => ({
    id: project?.id,
    lat: project?.coordinates?.lat || (39.8283 + (Math.random() - 0.5) * 20),
    lng: project?.coordinates?.lng || (-98.5795 + (Math.random() - 0.5) * 40),
    project
  }));

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

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 3));
  };

  const handleResetView = () => {
    setMapCenter({ lat: 39.8283, lng: -98.5795 });
    setZoom(5);
  };

  return (
    <div className="relative h-full bg-muted rounded-lg overflow-hidden">
      {/* Map Container */}
      <div className="w-full h-full relative">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Renewable Energy Projects Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=${zoom}&output=embed`}
          className="border-0"
        />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="bg-card shadow-elevation-1"
          >
            <Icon name="Plus" size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="bg-card shadow-elevation-1"
          >
            <Icon name="Minus" size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetView}
            className="bg-card shadow-elevation-1"
          >
            <Icon name="Home" size={16} />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 shadow-elevation-1 max-w-xs">
          <h4 className="font-heading font-medium text-sm text-foreground mb-2">
            Project Types
          </h4>
          <div className="space-y-1">
            {['Solar', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal']?.map(type => (
              <div key={type} className="flex items-center space-x-2 text-xs">
                <Icon name={getProjectTypeIcon(type)} size={12} className="text-primary" />
                <span className="text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Count */}
        <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-elevation-1">
          <div className="flex items-center space-x-2">
            <Icon name="MapPin" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {projects?.length} Projects
            </span>
          </div>
        </div>
      </div>
      {/* Selected Project Info */}
      {selectedProject && (
        <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-elevation-2 max-w-sm animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-heading font-semibold text-foreground line-clamp-1">
              {selectedProject?.name}
            </h4>
            <button
              onClick={() => onProjectSelect(null)}
              className="p-1 hover:bg-muted rounded transition-smooth"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Icon name="MapPin" size={12} className="mr-1" />
              <span className="line-clamp-1">{selectedProject?.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium text-foreground">
                {selectedProject?.capacity?.toLocaleString('en-US')} MW
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium text-foreground">
                {formatPrice(selectedProject?.pricePerMWh)}/MWh
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type:</span>
              <div className="flex items-center space-x-1">
                <Icon name={getProjectTypeIcon(selectedProject?.type)} size={12} />
                <span className="font-medium text-foreground">{selectedProject?.type}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onProjectSelect(selectedProject?.id, 'view')}
              className="flex-1"
            >
              View Details
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onProjectSelect(selectedProject?.id, 'interest')}
              className="flex-1"
            >
              Express Interest
            </Button>
          </div>
        </div>
      )}
      {/* No Projects Message */}
      {projects?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center">
            <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No projects to display on map</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;