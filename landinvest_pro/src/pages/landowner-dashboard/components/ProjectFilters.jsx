import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ProjectFilters = ({ filters, onFilterChange, onSearch }) => {
  const projectTypeOptions = [
    { value: 'all', label: 'All Project Types' },
    { value: 'solar', label: 'Solar' },
    { value: 'wind', label: 'Wind' },
    { value: 'hydroelectric', label: 'Hydroelectric' },
    { value: 'biomass', label: 'Biomass' },
    { value: 'geothermal', label: 'Geothermal' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'published', label: 'Published' }
  ];

  const timelineOptions = [
    { value: 'all', label: 'All Timelines' },
    { value: '6-months', label: '6 Months' },
    { value: '12-months', label: '12 Months' },
    { value: '18-months', label: '18 Months' },
    { value: '24-months', label: '24+ Months' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Input
              type="search"
              placeholder="Search projects..."
              value={filters?.search}
              onChange={(e) => onSearch(e?.target?.value)}
              className="pl-10"
            />
            <Icon 
              name="Search" 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" 
            />
          </div>
          
          <Select
            options={projectTypeOptions}
            value={filters?.projectType}
            onChange={(value) => onFilterChange('projectType', value)}
            placeholder="Project Type"
            className="min-w-[160px]"
          />
          
          <Select
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => onFilterChange('status', value)}
            placeholder="Status"
            className="min-w-[140px]"
          />
          
          <Select
            options={timelineOptions}
            value={filters?.timeline}
            onChange={(value) => onFilterChange('timeline', value)}
            placeholder="Timeline"
            className="min-w-[140px]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-body text-muted-foreground">
            Sort by:
          </span>
          <Select
            options={[
              { value: 'name', label: 'Project Name' },
              { value: 'location', label: 'Location' },
              { value: 'capacity', label: 'Capacity' },
              { value: 'updated', label: 'Last Updated' }
            ]}
            value={filters?.sortBy}
            onChange={(value) => onFilterChange('sortBy', value)}
            className="min-w-[120px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;