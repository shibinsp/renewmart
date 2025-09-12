import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
  const getFilterChips = () => {
    const chips = [];

    // Location filters
    if (filters?.location && filters?.location?.length > 0) {
      filters?.location?.forEach(location => {
        chips?.push({
          id: `location-${location}`,
          label: location?.charAt(0)?.toUpperCase() + location?.slice(1),
          type: 'location',
          value: location,
          icon: 'MapPin'
        });
      });
    }

    // Project type filters
    if (filters?.projectType && filters?.projectType?.length > 0) {
      filters?.projectType?.forEach(type => {
        const typeIcons = {
          solar: 'Sun',
          wind: 'Wind',
          hydro: 'Waves',
          biomass: 'Leaf',
          geothermal: 'Zap'
        };
        
        chips?.push({
          id: `projectType-${type}`,
          label: type?.charAt(0)?.toUpperCase() + type?.slice(1),
          type: 'projectType',
          value: type,
          icon: typeIcons?.[type] || 'Zap'
        });
      });
    }

    // Capacity range filter
    if (filters?.minCapacity || filters?.maxCapacity) {
      const min = filters?.minCapacity || '0';
      const max = filters?.maxCapacity || '∞';
      chips?.push({
        id: 'capacity-range',
        label: `${min}-${max} MW`,
        type: 'capacity',
        icon: 'Zap'
      });
    }

    // Price range filter
    if (filters?.minPrice || filters?.maxPrice) {
      const min = filters?.minPrice ? `$${filters?.minPrice}` : '$0';
      const max = filters?.maxPrice ? `$${filters?.maxPrice}` : '∞';
      chips?.push({
        id: 'price-range',
        label: `${min}-${max}/MWh`,
        type: 'price',
        icon: 'DollarSign'
      });
    }

    // Timeline filters
    if (filters?.timeline && filters?.timeline?.length > 0) {
      filters?.timeline?.forEach(timeline => {
        const timelineLabels = {
          '0-6': '0-6 months',
          '6-12': '6-12 months',
          '12-24': '1-2 years',
          '24+': '2+ years'
        };
        
        chips?.push({
          id: `timeline-${timeline}`,
          label: timelineLabels?.[timeline] || timeline,
          type: 'timeline',
          value: timeline,
          icon: 'Clock'
        });
      });
    }

    // Certification filters
    if (filters?.certifications && filters?.certifications?.length > 0) {
      filters?.certifications?.forEach(cert => {
        const certLabels = {
          nabcep: 'NABCEP',
          irec: 'IREC',
          leed: 'LEED',
          iso14001: 'ISO 14001'
        };
        
        chips?.push({
          id: `certification-${cert}`,
          label: certLabels?.[cert] || cert?.toUpperCase(),
          type: 'certifications',
          value: cert,
          icon: 'Shield'
        });
      });
    }

    return chips;
  };

  const handleRemoveChip = (chip) => {
    if (chip?.type === 'capacity') {
      onRemoveFilter('minCapacity', null);
      onRemoveFilter('maxCapacity', null);
    } else if (chip?.type === 'price') {
      onRemoveFilter('minPrice', null);
      onRemoveFilter('maxPrice', null);
    } else if (chip?.value) {
      // For array-based filters
      const currentValues = filters?.[chip?.type] || [];
      const newValues = currentValues?.filter(value => value !== chip?.value);
      onRemoveFilter(chip?.type, newValues);
    }
  };

  const chips = getFilterChips();

  if (chips?.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 border-b border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Active Filters ({chips?.length})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips?.map((chip) => (
          <div
            key={chip?.id}
            className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 text-sm font-medium"
          >
            <Icon name={chip?.icon} size={12} />
            <span>{chip?.label}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveChip(chip)}
              className="h-4 w-4 p-0 hover:bg-primary/20 rounded-full ml-1"
            >
              <Icon name="X" size={10} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterChips;