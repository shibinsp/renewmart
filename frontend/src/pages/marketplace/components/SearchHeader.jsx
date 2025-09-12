import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';

const SearchHeader = ({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  viewMode, 
  onViewModeChange,
  totalResults,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'capacity-low', label: 'Capacity: Low to High' },
    { value: 'capacity-high', label: 'Capacity: High to Low' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const formatResultsText = () => {
    const start = (currentPage - 1) * 12 + 1;
    const end = Math.min(currentPage * 12, totalResults);
    return `Showing ${start}-${end} of ${totalResults?.toLocaleString()} results`;
  };

  return (
    <div className="bg-card border-b border-border p-6">
      {/* Main Search Bar */}
      <div className="mb-6">
        <div className={`relative transition-all duration-200 ${
          isSearchFocused ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}>
          <Icon 
            name="Search" 
            size={20} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search renewable energy projects, locations, or sellers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e?.target?.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-12 pr-12 py-4 text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
      </div>
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Results Info */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {formatResultsText()}
          </span>
          {searchQuery && (
            <span className="text-sm text-foreground">
              for "<span className="font-medium">{searchQuery}</span>"
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              className="min-w-[160px]"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="px-3"
            >
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="px-3"
            >
              <Icon name="List" size={16} />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('map')}
              className="px-3"
            >
              <Icon name="Map" size={16} />
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location?.reload()}
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Icon name="ChevronLeft" size={16} className="mr-1" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="text-muted-foreground">...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <Icon name="ChevronRight" size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchHeader;