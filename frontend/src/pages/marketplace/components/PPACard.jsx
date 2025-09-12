import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PPACard = ({ ppa, onViewDetails, onExpressInterest, onToggleWatchlist }) => {
  const [isWatchlisted, setIsWatchlisted] = useState(ppa?.isWatchlisted || false);

  const handleWatchlistToggle = () => {
    setIsWatchlisted(!isWatchlisted);
    onToggleWatchlist(ppa?.id, !isWatchlisted);
  };

  const getProjectTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'solar': return 'Sun';
      case 'wind': return 'Wind';
      case 'hydro': return 'Waves';
      case 'biomass': return 'Leaf';
      case 'geothermal': return 'Zap';
      default: return 'Zap';
    }
  };

  const getProjectTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'solar': return 'text-yellow-600';
      case 'wind': return 'text-blue-600';
      case 'hydro': return 'text-cyan-600';
      case 'biomass': return 'text-green-600';
      case 'geothermal': return 'text-orange-600';
      default: return 'text-primary';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(price);
  };

  const formatCapacity = (capacity) => {
    return `${capacity} MW`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle hover:shadow-moderate transition-all duration-200 overflow-hidden">
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={ppa?.image}
          alt={ppa?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${getProjectTypeColor(ppa?.type)}`}>
            <Icon name={getProjectTypeIcon(ppa?.type)} size={12} className="mr-1" />
            {ppa?.type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWatchlistToggle}
            className="bg-white/90 hover:bg-white"
          >
            <Icon 
              name={isWatchlisted ? 'Heart' : 'Heart'} 
              size={16} 
              className={isWatchlisted ? 'text-red-500 fill-current' : 'text-muted-foreground'}
            />
          </Button>
        </div>
        {ppa?.isNew && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              New Listing
            </span>
          </div>
        )}
      </div>
      {/* Content */}
      <div className="p-4">
        {/* Title and Location */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
            {ppa?.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon name="MapPin" size={14} className="mr-1" />
            <span>{ppa?.location}</span>
          </div>
        </div>

        {/* Key Specifications */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Capacity</div>
            <div className="text-sm font-medium text-foreground">
              {formatCapacity(ppa?.capacity)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Price</div>
            <div className="text-sm font-medium text-foreground">
              {formatPrice(ppa?.price)}/MWh
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Timeline</div>
            <div className="text-sm font-medium text-foreground">
              {ppa?.timeline}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Contract</div>
            <div className="text-sm font-medium text-foreground">
              {ppa?.contractLength}
            </div>
          </div>
        </div>

        {/* Seller Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Building" size={14} className="text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {ppa?.seller?.name}
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={12}
                      className={i < Math.floor(ppa?.seller?.rating) 
                        ? 'text-yellow-400 fill-current' :'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {ppa?.seller?.rating} ({ppa?.seller?.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        {ppa?.certifications && ppa?.certifications?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {ppa?.certifications?.slice(0, 2)?.map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/10 text-success"
                >
                  <Icon name="Shield" size={10} className="mr-1" />
                  {cert}
                </span>
              ))}
              {ppa?.certifications?.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                  +{ppa?.certifications?.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(ppa?.id)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onExpressInterest(ppa?.id)}
            className="flex-1"
            iconName="MessageCircle"
            iconPosition="left"
            iconSize={14}
          >
            Express Interest
          </Button>
        </div>

        {/* Quick Info */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Listed {ppa?.listedDate}</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Icon name="Eye" size={12} className="mr-1" />
                {ppa?.views} views
              </span>
              <span className="flex items-center">
                <Icon name="MessageCircle" size={12} className="mr-1" />
                {ppa?.inquiries} inquiries
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPACard;