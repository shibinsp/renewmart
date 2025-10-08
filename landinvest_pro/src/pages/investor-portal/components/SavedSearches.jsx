import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedSearches = ({ savedSearches, onLoadSearch, onSaveSearch, onDeleteSearch, currentFilters }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSaveSearch = () => {
    if (searchName?.trim()) {
      const newSearch = {
        id: Date.now()?.toString(),
        name: searchName?.trim(),
        filters: currentFilters,
        createdAt: new Date(),
        resultCount: 0 // This would be calculated based on current results
      };
      onSaveSearch(newSearch);
      setSearchName('');
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setSearchName('');
    setIsCreating(false);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSearchDescription = (filters) => {
    const parts = [];
    if (filters?.projectType) parts?.push(filters?.projectType);
    if (filters?.location) parts?.push(filters?.location);
    if (filters?.capacityRange?.min || filters?.capacityRange?.max) {
      const min = filters?.capacityRange?.min || '0';
      const max = filters?.capacityRange?.max || '∞';
      parts?.push(`${min}-${max} MW`);
    }
    return parts?.length > 0 ? parts?.join(' • ') : 'All projects';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Search" size={18} />
          <span>Saved Searches</span>
        </h3>
        
        {!isCreating && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            iconName="Plus"
            iconPosition="left"
            iconSize={14}
          >
            Save Current
          </Button>
        )}
      </div>
      {/* Create New Search */}
      {isCreating && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="space-y-3">
            <Input
              label="Search Name"
              type="text"
              placeholder="Enter a name for this search..."
              value={searchName}
              onChange={(e) => setSearchName(e?.target?.value)}
              required
            />
            
            <div className="text-xs text-muted-foreground">
              <strong>Current filters:</strong> {getSearchDescription(currentFilters)}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveSearch}
                disabled={!searchName?.trim()}
                iconName="Save"
                iconPosition="left"
                iconSize={14}
              >
                Save Search
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelCreate}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Saved Searches List */}
      <div className="space-y-2">
        {savedSearches?.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Icon name="Search" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved searches yet</p>
            <p className="text-xs">Save your current filters to quickly access them later</p>
          </div>
        ) : (
          savedSearches?.map((search) => (
            <div
              key={search?.id}
              className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-smooth group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm line-clamp-1">
                    {search?.name}
                  </h4>
                  {search?.resultCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {search?.resultCount}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  {getSearchDescription(search?.filters)}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  Saved {formatDate(search?.createdAt)}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadSearch(search)}
                  iconName="Search"
                  iconSize={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Load
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSearch(search?.id)}
                  iconName="Trash2"
                  iconSize={14}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedSearches;