import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters, onClearFilters }) => {
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
          No projects match your filters
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Try adjusting your search criteria or clearing filters to see all projects.
        </p>
        <Button
          variant="outline"
          onClick={onClearFilters}
          iconName="X"
          iconPosition="left"
        >
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-12 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Plus" size={40} className="text-primary" />
      </div>
      <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
        Start Your First Renewable Energy Project
      </h3>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
        Transform your land into a sustainable energy source. Upload your land documents and connect with renewable energy investors to monetize your property.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate('/document-upload')}
          iconName="Plus"
          iconPosition="left"
        >
          Add New Project
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/investor-portal')}
          iconName="TrendingUp"
          iconPosition="left"
        >
          View Opportunities
        </Button>
      </div>
      
      <div className="mt-8 pt-8 border-t border-border">
        <h4 className="font-body font-medium text-foreground mb-4">
          Get started in 3 simple steps:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Upload" size={24} className="text-primary" />
            </div>
            <h5 className="font-body font-medium text-foreground mb-1">Upload Documents</h5>
            <p className="text-sm text-muted-foreground">Submit land ownership and survey documents</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="FileCheck" size={24} className="text-primary" />
            </div>
            <h5 className="font-body font-medium text-foreground mb-1">Review Process</h5>
            <p className="text-sm text-muted-foreground">Our experts review and approve your submission</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Handshake" size={24} className="text-primary" />
            </div>
            <h5 className="font-body font-medium text-foreground mb-1">Connect & Earn</h5>
            <p className="text-sm text-muted-foreground">Match with investors and start earning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;