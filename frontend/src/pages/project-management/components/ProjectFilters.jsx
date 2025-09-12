import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ProjectFilters = ({ filters, onFiltersChange, onCreateProject, onImportTemplate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'planning', label: 'Planning' },
    { value: 'in-development', label: 'In Development' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  const teamMemberOptions = [
    { value: 'all', label: 'All Team Members' },
    { value: 'sarah-chen', label: 'Sarah Chen' },
    { value: 'michael-rodriguez', label: 'Michael Rodriguez' },
    { value: 'emily-johnson', label: 'Emily Johnson' },
    { value: 'david-kim', label: 'David Kim' },
    { value: 'lisa-anderson', label: 'Lisa Anderson' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      teamMember: 'all',
      priority: 'all',
      search: '',
      budgetMin: '',
      budgetMax: '',
      deadlineFrom: '',
      deadlineTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value && value !== 'all' && value !== ''
  );

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      {/* Filter Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </button>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <div className="space-y-3">
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            fullWidth
            onClick={onCreateProject}
          >
            Create New Project
          </Button>
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            fullWidth
            onClick={onImportTemplate}
          >
            Import from Template
          </Button>
        </div>
      </div>
      {/* Basic Filters */}
      <div className="p-4 space-y-4">
        <Input
          type="search"
          placeholder="Search projects..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Select
          label="Team Member"
          options={teamMemberOptions}
          value={filters?.teamMember}
          onChange={(value) => handleFilterChange('teamMember', value)}
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => handleFilterChange('priority', value)}
        />
      </div>
      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 border-t border-border bg-muted/30 space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Advanced Filters</h4>
          
          {/* Budget Range */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Budget Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min ($)"
                value={filters?.budgetMin}
                onChange={(e) => handleFilterChange('budgetMin', e?.target?.value)}
              />
              <Input
                type="number"
                placeholder="Max ($)"
                value={filters?.budgetMax}
                onChange={(e) => handleFilterChange('budgetMax', e?.target?.value)}
              />
            </div>
          </div>

          {/* Deadline Range */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Deadline Range</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters?.deadlineFrom}
                onChange={(e) => handleFilterChange('deadlineFrom', e?.target?.value)}
              />
              <Input
                type="date"
                value={filters?.deadlineTo}
                onChange={(e) => handleFilterChange('deadlineTo', e?.target?.value)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Filter Actions */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            iconName="X"
            iconPosition="left"
            fullWidth
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;