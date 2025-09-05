import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const DocumentSearch = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState({
    fileType: '',
    dateRange: '',
    owner: '',
    status: '',
    tags: []
  });

  const fileTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'word', label: 'Word Documents' },
    { value: 'excel', label: 'Excel Spreadsheets' },
    { value: 'image', label: 'Images' },
    { value: 'folder', label: 'Folders' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'Any Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const ownerOptions = [
    { value: '', label: 'Any Owner' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'michael-chen', label: 'Michael Chen' },
    { value: 'david-rodriguez', label: 'David Rodriguez' },
    { value: 'emily-watson', label: 'Emily Watson' },
    { value: 'james-wilson', label: 'James Wilson' }
  ];

  const statusOptions = [
    { value: '', label: 'Any Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'final', label: 'Final' },
    { value: 'archived', label: 'Archived' }
  ];

  const tagOptions = [
    { value: 'ppa', label: 'PPA' },
    { value: 'contract', label: 'Contract' },
    { value: 'legal', label: 'Legal' },
    { value: 'permit', label: 'Permit' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'financial', label: 'Financial' },
    { value: 'technical', label: 'Technical' },
    { value: 'solar', label: 'Solar' },
    { value: 'wind', label: 'Wind' }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchQuery, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      fileType: '',
      dateRange: '',
      owner: '',
      status: '',
      tags: []
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFilterChange(clearedFilters);
    onSearch('', clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    Array.isArray(value) ? value?.length > 0 : value !== ''
  ) || searchQuery !== '';

  return (
    <div className="bg-card border-b border-border">
      {/* Main Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search documents, folders, and content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>
          
          <Button type="submit" variant="default" iconName="Search">
            Search
          </Button>
          
          <Button
            type="button"
            variant="outline"
            iconName={isAdvancedOpen ? "ChevronUp" : "ChevronDown"}
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              iconName="X"
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </form>
      </div>
      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="px-4 pb-4 border-t border-border bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Select
              label="File Type"
              options={fileTypeOptions}
              value={filters?.fileType}
              onChange={(value) => handleFilterChange('fileType', value)}
              placeholder="Select type"
            />
            
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
              placeholder="Select range"
            />
            
            <Select
              label="Owner"
              options={ownerOptions}
              value={filters?.owner}
              onChange={(value) => handleFilterChange('owner', value)}
              placeholder="Select owner"
            />
            
            <Select
              label="Status"
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => handleFilterChange('status', value)}
              placeholder="Select status"
            />
          </div>
          
          <div className="mt-4">
            <Select
              label="Tags"
              options={tagOptions}
              value={filters?.tags}
              onChange={(value) => handleFilterChange('tags', value)}
              placeholder="Select tags"
              multiple
              searchable
              clearable
            />
          </div>
          
          {/* Quick Filters */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('fileType', 'pdf')}
                className="text-xs bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary px-3 py-1.5 rounded-full transition-smooth"
              >
                PDF Documents
              </button>
              <button
                onClick={() => handleFilterChange('status', 'under-review')}
                className="text-xs bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary px-3 py-1.5 rounded-full transition-smooth"
              >
                Under Review
              </button>
              <button
                onClick={() => handleFilterChange('dateRange', 'week')}
                className="text-xs bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary px-3 py-1.5 rounded-full transition-smooth"
              >
                This Week
              </button>
              <button
                onClick={() => handleFilterChange('tags', ['contract'])}
                className="text-xs bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary px-3 py-1.5 rounded-full transition-smooth"
              >
                Contracts
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-muted/30 border-t border-border">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            <div className="flex flex-wrap gap-1">
              {searchQuery && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Search: "{searchQuery}"
                </span>
              )}
              {filters?.fileType && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Type: {fileTypeOptions?.find(opt => opt?.value === filters?.fileType)?.label}
                </span>
              )}
              {filters?.dateRange && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Date: {dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}
                </span>
              )}
              {filters?.owner && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Owner: {ownerOptions?.find(opt => opt?.value === filters?.owner)?.label}
                </span>
              )}
              {filters?.status && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
                </span>
              )}
              {filters?.tags?.length > 0 && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  Tags: {filters?.tags?.length} selected
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSearch;