import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapView = ({ ppas, onSelectPPA, selectedPPA }) => {
  const [mapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Mock coordinates for demonstration
  const ppaLocations = ppas?.map(ppa => ({
    ...ppa,
    coordinates: {
      lat: 39.8283 + (Math.random() - 0.5) * 20,
      lng: -98.5795 + (Math.random() - 0.5) * 40
    }
  }));

  const handleMarkerClick = (ppa) => {
    setSelectedMarker(ppa);
    onSelectPPA(ppa);
  };

  const getProjectTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'solar': return '#EAB308'; // yellow-500
      case 'wind': return '#3B82F6'; // blue-500
      case 'hydro': return '#06B6D4'; // cyan-500
      case 'biomass': return '#10B981'; // emerald-500
      case 'geothermal': return '#F97316'; // orange-500
      default: return '#6366F1'; // indigo-500
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    })?.format(price);
  };

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Map Container */}
      <div className="w-full h-full relative">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Renewable Energy Projects Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=4&output=embed`}
          className="w-full h-full"
        />

        {/* Map Overlay with Project Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {ppaLocations?.map((ppa) => {
            // Calculate position based on map bounds (simplified)
            const x = ((ppa?.coordinates?.lng + 125) / 60) * 100;
            const y = ((50 - ppa?.coordinates?.lat) / 25) * 100;

            return (
              <div
                key={ppa?.id}
                className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(95, y))}%`
                }}
                onClick={() => handleMarkerClick(ppa)}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-moderate flex items-center justify-center transition-transform hover:scale-110 ${
                    selectedMarker?.id === ppa?.id ? 'scale-125 ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: getProjectTypeColor(ppa?.type) }}
                >
                  <span className="text-white text-xs font-bold">
                    {ppa?.capacity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          className="bg-white/90 hover:bg-white shadow-moderate"
        >
          <Icon name="Plus" size={16} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-white/90 hover:bg-white shadow-moderate"
        >
          <Icon name="Minus" size={16} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-white/90 hover:bg-white shadow-moderate"
        >
          <Icon name="Maximize" size={16} />
        </Button>
      </div>
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-moderate">
        <h3 className="text-sm font-semibold text-foreground mb-3">Project Types</h3>
        <div className="space-y-2">
          {['Solar', 'Wind', 'Hydro', 'Biomass', 'Geothermal']?.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: getProjectTypeColor(type) }}
              />
              <span className="text-xs text-foreground">{type}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Selected Project Info Panel */}
      {selectedMarker && (
        <div className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-elevated p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {selectedMarker?.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedMarker(null)}
              className="h-6 w-6"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="MapPin" size={14} />
              <span>{selectedMarker?.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <div className="font-medium text-foreground">{selectedMarker?.type}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Capacity:</span>
                <div className="font-medium text-foreground">{selectedMarker?.capacity} MW</div>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <div className="font-medium text-foreground">
                  {formatPrice(selectedMarker?.price)}/MWh
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Timeline:</span>
                <div className="font-medium text-foreground">{selectedMarker?.timeline}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)]?.map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={12}
                    className={i < Math.floor(selectedMarker?.seller?.rating) 
                      ? 'text-yellow-400 fill-current' :'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {selectedMarker?.seller?.rating} ({selectedMarker?.seller?.reviews} reviews)
              </span>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onSelectPPA(selectedMarker)}
              >
                View Details
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
              >
                Express Interest
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Map Statistics */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-moderate">
        <h3 className="text-sm font-semibold text-foreground mb-2">Map Statistics</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Projects:</span>
            <span className="font-medium text-foreground">{ppas?.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Capacity:</span>
            <span className="font-medium text-foreground">
              {ppas?.reduce((sum, ppa) => sum + ppa?.capacity, 0)} MW
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Price:</span>
            <span className="font-medium text-foreground">
              {formatPrice(ppas?.reduce((sum, ppa) => sum + ppa?.price, 0) / ppas?.length)}/MWh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;