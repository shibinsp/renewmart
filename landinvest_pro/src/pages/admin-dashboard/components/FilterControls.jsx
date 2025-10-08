import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterControls = ({ filters, onFilterChange, onClearFilters }) => {
  const reviewerRoleOptions = [
    { value: '', label: 'All Reviewers' },
    { value: 'RE Sales Advisor', label: 'RE Sales Advisor' },
    { value: 'RE Analyst', label: 'RE Analyst' },
    { value: 'RE Governance Lead', label: 'RE Governance Lead' }
  ];

  const projectTypeOptions = [
    { value: '', label: 'All Projects' },
    { value: 'Solar', label: 'Solar' },
    { value: 'Wind', label: 'Wind' },
    { value: 'Hydroelectric', label: 'Hydroelectric' },
    { value: 'Biomass', label: 'Biomass' },
    { value: 'Geothermal', label: 'Geothermal' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Delayed', label: 'Delayed' },
    { value: 'Completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-foreground">Filter Tasks</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconSize={16}
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Select
          label="Reviewer Role"
          options={reviewerRoleOptions}
          value={filters?.reviewerRole}
          onChange={(value) => onFilterChange('reviewerRole', value)}
          className="min-w-0"
        />

        <Select
          label="Project Type"
          options={projectTypeOptions}
          value={filters?.projectType}
          onChange={(value) => onFilterChange('projectType', value)}
          className="min-w-0"
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          className="min-w-0"
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => onFilterChange('priority', value)}
          className="min-w-0"
        />

        <Input
          label="Start Date From"
          type="date"
          value={filters?.startDateFrom}
          onChange={(e) => onFilterChange('startDateFrom', e?.target?.value)}
          className="min-w-0"
        />

        <Input
          label="End Date To"
          type="date"
          value={filters?.endDateTo}
          onChange={(e) => onFilterChange('endDateTo', e?.target?.value)}
          className="min-w-0"
        />
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Input
          label="Search Landowner"
          type="search"
          placeholder="Search by landowner name or location..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default FilterControls;