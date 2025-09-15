import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, subtitle, icon, trend, trendValue, color = 'primary' }) => {
  const getColorClasses = (colorName) => {
    const colors = {
      primary: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        icon: 'text-primary'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'text-green-600'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'text-blue-600'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'text-orange-600'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'text-purple-600'
      }
    };
    return colors[colorName] || colors.primary;
  };

  const getTrendIcon = (trendType) => {
    if (trendType === 'up') return 'TrendingUp';
    if (trendType === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = (trendType) => {
    if (trendType === 'up') return 'text-green-600';
    if (trendType === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-background border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
          <Icon name={icon} className={`w-6 h-6 ${colorClasses.icon}`} />
        </div>
        
        {trend && trendValue && (
          <div className={`flex items-center text-sm ${getTrendColor(trend)}`}>
            <Icon name={getTrendIcon(trend)} className="w-4 h-4 mr-1" />
            <span className="font-medium">{trendValue}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-1">
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${colorClasses.text}`}>
            {value}
          </span>
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;