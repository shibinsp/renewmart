import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';

const BrowseProperties = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    location: 'all',
    size: 'all',
    priceRange: 'all'
  });

  useEffect(() => {
    // Simulate loading properties data
    const loadProperties = () => {
      setTimeout(() => {
        setProperties([
          {
            id: 1,
            name: 'Green Valley Solar Farm',
            location: 'Texas, USA',
            type: 'Solar',
            size: '150 acres',
            capacity: '50 MW',
            price: '$2.5M',
            roi: '12.5%',
            status: 'Available',
            description: 'Prime solar development site with excellent sun exposure and grid connectivity.',
            features: ['Grid Connected', 'Environmental Cleared', 'Permits Ready'],
            images: ['/api/placeholder/400/300'],
            owner: 'John Smith',
            listedDate: '2024-01-15'
          },
          {
            id: 2,
            name: 'Prairie Wind Development',
            location: 'Oklahoma, USA',
            type: 'Wind',
            size: '200 acres',
            capacity: '75 MW',
            price: '$3.2M',
            roi: '14.2%',
            status: 'Available',
            description: 'Excellent wind resource area with consistent wind patterns and minimal obstacles.',
            features: ['High Wind Speed', 'Transmission Access', 'Local Support'],
            images: ['/api/placeholder/400/300'],
            owner: 'Sarah Johnson',
            listedDate: '2024-01-10'
          },
          {
            id: 3,
            name: 'Desert Solar Complex',
            location: 'Nevada, USA',
            type: 'Solar',
            size: '300 acres',
            capacity: '100 MW',
            price: '$4.8M',
            roi: '15.8%',
            status: 'Under Review',
            description: 'Large-scale solar development opportunity in high-irradiance desert location.',
            features: ['High Irradiance', 'Flat Terrain', 'Water Access'],
            images: ['/api/placeholder/400/300'],
            owner: 'Desert Land Co.',
            listedDate: '2024-01-05'
          },
          {
            id: 4,
            name: 'Coastal Wind Project',
            location: 'California, USA',
            type: 'Wind',
            size: '180 acres',
            capacity: '60 MW',
            price: '$2.8M',
            roi: '11.3%',
            status: 'Available',
            description: 'Coastal wind development site with strong and consistent offshore wind patterns.',
            features: ['Coastal Location', 'Strong Winds', 'Environmental Study Complete'],
            images: ['/api/placeholder/400/300'],
            owner: 'Pacific Energy LLC',
            listedDate: '2024-01-12'
          },
          {
            id: 5,
            name: 'Hybrid Energy Hub',
            location: 'Arizona, USA',
            type: 'Hybrid',
            size: '250 acres',
            capacity: '80 MW',
            price: '$3.5M',
            roi: '13.7%',
            status: 'Available',
            description: 'Unique hybrid solar and wind development opportunity with battery storage potential.',
            features: ['Solar + Wind', 'Storage Ready', 'Grid Interconnection'],
            images: ['/api/placeholder/400/300'],
            owner: 'Southwest Renewables',
            listedDate: '2024-01-08'
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadProperties();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         property.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || property.type.toLowerCase() === filters.type;
    const matchesStatus = property.status === 'Available'; // Only show available properties
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExpressInterest = (propertyId) => {
    // Simulate expressing interest
    alert(`Interest expressed in property ${propertyId}. The landowner will be notified.`);
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'solar': return 'Sun';
      case 'wind': return 'Wind';
      case 'hybrid': return 'Zap';
      default: return 'MapPin';
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'solar': return 'text-yellow-600';
      case 'wind': return 'text-blue-600';
      case 'hybrid': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Helmet>
        <title>Browse Properties - RenewMart</title>
        <meta name="description" content="Browse available renewable energy development properties" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}>
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <BreadcrumbNavigation />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Browse Properties
                  </h1>
                  <p className="text-muted-foreground">
                    Discover renewable energy development opportunities
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredProperties.length} properties available
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Search"
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  iconName="Search"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="solar">Solar</option>
                    <option value="wind">Wind</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Locations</option>
                    <option value="texas">Texas</option>
                    <option value="california">California</option>
                    <option value="nevada">Nevada</option>
                    <option value="oklahoma">Oklahoma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-3m">Under $3M</option>
                    <option value="3m-5m">$3M - $5M</option>
                    <option value="over-5m">Over $5M</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-card border border-border rounded-lg shadow-subtle overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Property Image */}
                    <div className="h-48 bg-muted relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name={getTypeIcon(property.type)} size={48} className={`${getTypeColor(property.type)} opacity-50`} />
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/90 ${getTypeColor(property.type)}`}>
                          {property.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 bg-success/90 text-white text-xs font-medium rounded-full">
                          {property.status}
                        </span>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{property.name}</h3>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">{property.price}</div>
                          <div className="text-sm text-success font-medium">{property.roi} ROI</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <Icon name="MapPin" size={16} className="mr-1" />
                        {property.location}
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>
                      
                      {/* Property Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Size</div>
                          <div className="text-sm font-medium text-foreground">{property.size}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Capacity</div>
                          <div className="text-sm font-medium text-foreground">{property.capacity}</div>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {property.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Listed by {property.owner}
                        </div>
                        <Button
                          size="sm"
                          iconName="Heart"
                          onClick={() => handleExpressInterest(property.id)}
                        >
                          Express Interest
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProperties.length === 0 && !loading && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters to find more properties.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default BrowseProperties;