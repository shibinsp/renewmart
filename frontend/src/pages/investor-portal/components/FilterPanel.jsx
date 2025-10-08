import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  isOpen, 
  onToggle,
  totalResults = 0 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const projectTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Solar', label: 'Solar' },
    { value: 'Wind', label: 'Wind' },
    { value: 'Hydroelectric', label: 'Hydroelectric' },
    { value: 'Biomass', label: 'Biomass' },
    { value: 'Geothermal', label: 'Geothermal' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'California', label: 'California' },
    { value: 'Texas', label: 'Texas' },
    { value: 'Arizona', label: 'Arizona' },
    { value: 'Nevada', label: 'Nevada' },
    { value: 'Colorado', label: 'Colorado' },
    { value: 'New Mexico', label: 'New Mexico' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'capacity-high', label: 'Capacity: High to Low' },
    { value: 'capacity-low', label: 'Capacity: Low to High' }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleRangeChange = (key, field, value) => {
    const updatedFilters = {
      ...localFilters,
      [key]: {
        ...localFilters?.[key],
        [field]: value
      }
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      projectType: '',
      location: '',
      capacityRange: { min: '', max: '' },
      priceRange: { min: '', max: '' },
      timeline: '',
      sortBy: 'newest',
      availableOnly: true
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters?.search) count++;
    if (localFilters?.projectType) count++;
    if (localFilters?.location) count++;
    if (localFilters?.capacityRange?.min || localFilters?.capacityRange?.max) count++;
    if (localFilters?.priceRange?.min || localFilters?.priceRange?.max) count++;
    if (localFilters?.timeline) count++;
    return count;
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full justify-between"
          iconName="Filter"
          iconPosition="left"
        >
          <span>Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}</span>
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} />
        </Button>
      </div>
      {/* Filter Panel */}
      <div className={`
        bg-card border border-border rounded-lg p-4 space-y-4
        ${isOpen ? 'block' : 'hidden lg:block'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Filter" size={18} />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            iconName="X"
            iconPosition="left"
            iconSize={14}
          >
            Clear All
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {totalResults?.toLocaleString('en-US')} opportunities found
        </div>

        {/* Search */}
        <div>
          <Input
            label="Search Projects"
            type="search"
            placeholder="Search by name, location..."
            value={localFilters?.search || ''}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Project Type */}
        <div>
          <Select
            label="Project Type"
            options={projectTypeOptions}
            value={localFilters?.projectType || ''}
            onChange={(value) => handleFilterChange('projectType', value)}
          />
        </div>

        {/* Location */}
        <div>
          <Select
            label="Location"
            options={locationOptions}
            value={localFilters?.location || ''}
            onChange={(value) => handleFilterChange('location', value)}
            searchable
          />
        </div>

        {/* Capacity Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Capacity Range (MW)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min MW"
              value={localFilters?.capacityRange?.min || ''}
              onChange={(e) => handleRangeChange('capacityRange', 'min', e?.target?.value)}
            />
            <Input
              type="number"
              placeholder="Max MW"
              value={localFilters?.capacityRange?.max || ''}
              onChange={(e) => handleRangeChange('capacityRange', 'max', e?.target?.value)}
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Price Range ($/MWh)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min Price"
              value={localFilters?.priceRange?.min || ''}
              onChange={(e) => handleRangeChange('priceRange', 'min', e?.target?.value)}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={localFilters?.priceRange?.max || ''}
              onChange={(e) => handleRangeChange('priceRange', 'max', e?.target?.value)}
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <Select
            label="Sort By"
            options={sortOptions}
            value={localFilters?.sortBy || 'newest'}
            onChange={(value) => handleFilterChange('sortBy', value)}
          />
        </div>

        {/* Available Only */}
        <div>
          <Checkbox
            label="Show available opportunities only"
            description="Hide projects with expressed interest"
            checked={localFilters?.availableOnly || false}
            onChange={(e) => handleFilterChange('availableOnly', e?.target?.checked)}
          />
        </div>
      </div>
    </>
  );
};

export default FilterPanel;