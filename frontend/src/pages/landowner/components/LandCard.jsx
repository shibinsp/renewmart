import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LandCard = ({ land, onEdit, onViewDetails }) => {
  const getEnergyIcon = (energyType) => {
    const icons = {
      solar: 'Sun',
      wind: 'Wind',
      hydro: 'Droplets',
      biomass: 'Leaf',
      geothermal: 'Zap'
    };
    return icons[energyType] || 'Zap';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      inactive: 'text-gray-600 bg-gray-50 border-gray-200',
      under_review: 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[status] || colors.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {land.title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm mb-2">
            <Icon name="MapPin" className="w-4 h-4 mr-1" />
            {land.location_text}
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
          getStatusColor(land.status_key || 'pending')
        }`}>
          {(land.status_key || 'pending').replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Energy Type and Capacity */}
      <div className="flex items-center mb-4">
        <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          <Icon name={getEnergyIcon(land.energy_key)} className="w-4 h-4 mr-2" />
          {land.energy_key ? land.energy_key.charAt(0).toUpperCase() + land.energy_key.slice(1) : 'Solar'} Energy
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Area
          </p>
          <p className="text-sm font-semibold text-foreground">
            {land.area_acres} acres
          </p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Capacity
          </p>
          <p className="text-sm font-semibold text-foreground">
            {land.capacity_mw} MW
          </p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Price/MWh
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(land.price_per_mwh)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Contract Term
          </p>
          <p className="text-sm font-semibold text-foreground">
            {land.contract_term_years} years
          </p>
        </div>
      </div>

      {/* Land Type */}
      {land.land_type && (
        <div className="mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
            <Icon name="Layers" className="w-3 h-3 mr-1" />
            {land.land_type}
          </span>
        </div>
      )}

      {/* Developer Info */}
      {land.developer_name && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Developer
          </p>
          <p className="text-sm text-foreground">
            {land.developer_name}
          </p>
        </div>
      )}

      {/* Timeline */}
      {land.timeline_text && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Timeline
          </p>
          <p className="text-sm text-foreground line-clamp-2">
            {land.timeline_text}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Registered: {formatDate(land.created_at)}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(land)}
            className="text-xs"
          >
            <Icon name="Edit" className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewDetails && onViewDetails(land)}
            className="text-xs"
          >
            <Icon name="Eye" className="w-3 h-3 mr-1" />
            View Details
          </Button>
        </div>
      </div>

      {/* Interest Indicator */}
      {land.investor_interests && land.investor_interests.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center text-sm">
            <Icon name="Users" className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-green-600 font-medium">
              {land.investor_interests.length} investor{land.investor_interests.length !== 1 ? 's' : ''} interested
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandCard;