import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ filters, onFiltersChange, onClearFilters, isCollapsed, onToggleCollapse }) => {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    projectType: true,
    capacity: true,
    price: true,
    timeline: true,
    certification: false
  });

  const locationOptions = [
    { value: 'california', label: 'California' },
    { value: 'texas', label: 'Texas' },
    { value: 'florida', label: 'Florida' },
    { value: 'arizona', label: 'Arizona' },
    { value: 'nevada', label: 'Nevada' },
    { value: 'new-york', label: 'New York' }
  ];

  const projectTypeOptions = [
    { value: 'solar', label: 'Solar' },
    { value: 'wind', label: 'Wind' },
    { value: 'hydro', label: 'Hydroelectric' },
    { value: 'biomass', label: 'Biomass' },
    { value: 'geothermal', label: 'Geothermal' }
  ];

  const timelineOptions = [
    { value: '0-6', label: '0-6 months' },
    { value: '6-12', label: '6-12 months' },
    { value: '12-24', label: '1-2 years' },
    { value: '24+', label: '2+ years' }
  ];

  const certificationOptions = [
    { value: 'nabcep', label: 'NABCEP Certified' },
    { value: 'irec', label: 'IREC Certified' },
    { value: 'leed', label: 'LEED Certified' },
    { value: 'iso14001', label: 'ISO 14001' }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.location?.length) count++;
    if (filters?.projectType?.length) count++;
    if (filters?.minCapacity || filters?.maxCapacity) count++;
    if (filters?.minPrice || filters?.maxPrice) count++;
    if (filters?.timeline?.length) count++;
    if (filters?.certifications?.length) count++;
    return count;
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-card border-r border-border p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="w-full"
        >
          <Icon name="Filter" size={20} />
        </Button>
        {getActiveFilterCount() > 0 && (
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-2 mx-auto">
            {getActiveFilterCount()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            {getActiveFilterCount() > 0 && (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={getActiveFilterCount() === 0}
            >
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
          </div>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('location')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="text-sm font-medium text-foreground">Location</h3>
            <Icon 
              name={expandedSections?.location ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          {expandedSections?.location && (
            <div className="mt-3 space-y-3">
              <Select
                placeholder="Select states..."
                multiple
                searchable
                clearable
                options={locationOptions}
                value={filters?.location || []}
                onChange={(value) => handleFilterChange('location', value)}
              />
            </div>
          )}
        </div>

        {/* Project Type Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('projectType')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="text-sm font-medium text-foreground">Project Type</h3>
            <Icon 
              name={expandedSections?.projectType ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          {expandedSections?.projectType && (
            <div className="mt-3 space-y-2">
              {projectTypeOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={filters?.projectType?.includes(option?.value) || false}
                  onChange={(e) => {
                    const currentTypes = filters?.projectType || [];
                    const newTypes = e?.target?.checked
                      ? [...currentTypes, option?.value]
                      : currentTypes?.filter(type => type !== option?.value);
                    handleFilterChange('projectType', newTypes);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Capacity Range Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('capacity')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="text-sm font-medium text-foreground">Capacity (MW)</h3>
            <Icon 
              name={expandedSections?.capacity ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          {expandedSections?.capacity && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min MW"
                  value={filters?.minCapacity || ''}
                  onChange={(e) => handleFilterChange('minCapacity', e?.target?.value)}
                />
                <Input
                  type="number"
                  placeholder="Max MW"
                  value={filters?.maxCapacity || ''}
                  onChange={(e) => handleFilterChange('maxCapacity', e?.target?.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="text-sm font-medium text-foreground">Price ($/MWh)</h3>
            <Icon 
              name={expandedSections?.price ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          {expandedSections?.price && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters?.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e?.target?.value)}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters?.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e?.target?.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Timeline Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('timeline')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="text-sm font-medium text-foreground">Timeline</h3>
            <Icon 
              name={expandedSections?.timeline ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          {expandedSections?.timeline && (
            <div className="mt-3 space-y-3">
              <Select
                placeholder="Select timeline..."
                multiple
                options={timelineOptions}
                value={filters?.timeline || []}
                onChange={(value) => handleFilterChange('timeline', value)}
              />
            </div>
          )}
        </div>

        {/* Certification Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('certification')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="text-sm font-medium text-foreground">Certifications</h3>
            <Icon 
              name={expandedSections?.certification ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
              className="text-muted-foreground"
            />
          </button>
          {expandedSections?.certification && (
            <div className="mt-3 space-y-2">
              {certificationOptions?.map((option) => (
                <Checkbox
                  key={option?.value}
                  label={option?.label}
                  checked={filters?.certifications?.includes(option?.value) || false}
                  onChange={(e) => {
                    const currentCerts = filters?.certifications || [];
                    const newCerts = e?.target?.checked
                      ? [...currentCerts, option?.value]
                      : currentCerts?.filter(cert => cert !== option?.value);
                    handleFilterChange('certifications', newCerts);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;