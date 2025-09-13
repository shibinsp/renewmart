import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import FilterSidebar from './components/FilterSidebar';
import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import PPACard from './components/PPACard';
import ActivitySidebar from './components/ActivitySidebar';
import MapView from './components/MapView';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { landsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Marketplace = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterSidebarCollapsed, setFilterSidebarCollapsed] = useState(false);
  const [activitySidebarCollapsed, setActivitySidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    priceRange: [0, 100],
    capacityRange: [0, 200],
    timeline: '',
    certifications: []
  });
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLands = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 12,
          search: searchQuery,
          sort_by: sortBy,
          ...filters
        };
        
        const response = await landsAPI.getLands(params);
        setLands(response.data.lands || []);
        setTotalPages(Math.ceil((response.data.total || 0) / 12));
      } catch (error) {
        console.error('Failed to fetch lands:', error);
        setLands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, [currentPage, searchQuery, sortBy, filters]);

  // Mock PPA data (fallback for development)
  const mockPPAs = [
    {
      id: 1,
      title: "California Solar Farm Alpha",
      type: "Solar",
      location: "Riverside County, CA",
      capacity: 75,
      price: 48.50,
      timeline: "6-12 months",
      contractLength: "20 years",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
      seller: {
        name: "SunPower Energy",
        rating: 4.8,
        reviews: 124
      },
      certifications: ["NABCEP", "LEED"],
      isNew: true,
      isWatchlisted: false,
      listedDate: "2 days ago",
      views: 1247,
      inquiries: 23
    },
    {
      id: 2,
      title: "Texas Wind Project Beta",
      type: "Wind",
      location: "Lubbock County, TX",
      capacity: 120,
      price: 52.75,
      timeline: "12-24 months",
      contractLength: "25 years",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop",
      seller: {
        name: "WindTech Solutions",
        rating: 4.6,
        reviews: 89
      },
      certifications: ["IREC", "ISO14001"],
      isNew: false,
      isWatchlisted: true,
      listedDate: "1 week ago",
      views: 892,
      inquiries: 18
    },
    {
      id: 3,
      title: "Nevada Solar Installation Gamma",
      type: "Solar",
      location: "Clark County, NV",
      capacity: 60,
      price: 46.25,
      timeline: "0-6 months",
      contractLength: "15 years",
      image: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&h=300&fit=crop",
      seller: {
        name: "Desert Solar Corp",
        rating: 4.9,
        reviews: 156
      },
      certifications: ["NABCEP", "LEED", "IREC"],
      isNew: false,
      isWatchlisted: false,
      listedDate: "3 days ago",
      views: 634,
      inquiries: 12
    },
    {
      id: 4,
      title: "Oregon Hydro Project Delta",
      type: "Hydro",
      location: "Columbia River, OR",
      capacity: 85,
      price: 55.00,
      timeline: "24+ months",
      contractLength: "30 years",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
      seller: {
        name: "Pacific Hydro Energy",
        rating: 4.7,
        reviews: 67
      },
      certifications: ["ISO14001"],
      isNew: true,
      isWatchlisted: false,
      listedDate: "1 day ago",
      views: 423,
      inquiries: 8
    },
    {
      id: 5,
      title: "Arizona Solar Complex Epsilon",
      type: "Solar",
      location: "Maricopa County, AZ",
      capacity: 150,
      price: 49.75,
      timeline: "6-12 months",
      contractLength: "20 years",
      image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop",
      seller: {
        name: "Arizona Solar Partners",
        rating: 4.5,
        reviews: 203
      },
      certifications: ["NABCEP", "LEED"],
      isNew: false,
      isWatchlisted: true,
      listedDate: "5 days ago",
      views: 1156,
      inquiries: 31
    },
    {
      id: 6,
      title: "Florida Biomass Plant Zeta",
      type: "Biomass",
      location: "Polk County, FL",
      capacity: 45,
      price: 58.25,
      timeline: "12-24 months",
      contractLength: "18 years",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop",
      seller: {
        name: "BioEnergy Florida",
        rating: 4.3,
        reviews: 45
      },
      certifications: ["IREC"],
      isNew: false,
      isWatchlisted: false,
      listedDate: "1 week ago",
      views: 287,
      inquiries: 6
    }
  ];

  const totalResults = lands?.length || 0;

  // Transform lands data to match the expected PPA format for existing components
  const transformedLands = lands.map(land => ({
    id: land.id,
    title: land.name || `${land.land_type} Project`,
    type: land.land_type || 'Solar',
    location: `${land.city || ''}, ${land.state || ''}`.trim(),
    capacity: land.size_acres || 0,
    price: land.lease_rate || 0,
    timeline: land.availability_status || 'Available',
    contractLength: '20 years', // Default value
    image: land.image_url || 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&h=300&fit=crop',
    seller: {
      name: land.owner_name || 'Property Owner',
      rating: 4.5,
      reviews: 50
    },
    certifications: land.certifications || [],
    isNew: new Date(land.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isWatchlisted: false,
    listedDate: new Date(land.created_at).toLocaleDateString(),
    views: Math.floor(Math.random() * 1000) + 100,
    inquiries: Math.floor(Math.random() * 50) + 5
  }));

  const filteredPPAs = transformedLands;

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      location: [],
      projectType: [],
      minCapacity: '',
      maxCapacity: '',
      minPrice: '',
      maxPrice: '',
      timeline: [],
      certifications: []
    });
  };

  const handleViewDetails = (ppaId) => {
    console.log('View details for PPA:', ppaId);
    // Navigate to PPA details page
  };

  const handleExpressInterest = (ppaId) => {
    console.log('Express interest in PPA:', ppaId);
    // Open interest modal or navigate to contact form
  };

  const handleToggleWatchlist = (ppaId, isWatchlisted) => {
    console.log('Toggle watchlist for PPA:', ppaId, isWatchlisted);
    // Update watchlist status
  };

  const handleSelectPPA = (ppa) => {
    console.log('Selected PPA from map:', ppa);
    // Handle PPA selection from map
  };

  // Get current page items
  const startIndex = (currentPage - 1) * 12;
  const currentPPAs = loading ? [] : transformedLands;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}>
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearAllFilters}
              isCollapsed={filterSidebarCollapsed}
              onToggleCollapse={() => setFilterSidebarCollapsed(!filterSidebarCollapsed)}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${
              filterSidebarCollapsed ? 'ml-0' : 'ml-0'
            } ${
              activitySidebarCollapsed ? 'mr-0' : 'mr-0'
            }`}>
              {/* Search Header */}
              <SearchHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalResults={totalResults}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />

              {/* Filter Chips */}
              <FilterChips
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />

              {/* Breadcrumb */}
              <div className="px-6 pt-4">
                <BreadcrumbNavigation />
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'map' ? (
                  <MapView
                    ppas={filteredPPAs}
                    onSelectPPA={handleSelectPPA}
                    selectedPPA={null}
                  />
                ) : (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          <p className="text-muted-foreground">Loading renewable energy projects...</p>
                        </div>
                      </div>
                    ) : currentPPAs?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Icon name="Search" size={48} className="text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No projects found
                        </h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          Try adjusting your search criteria or filters to find more renewable energy projects.
                        </p>
                        <Button
                          variant="outline"
                          onClick={handleClearAllFilters}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className={`grid gap-6 ${
                        viewMode === 'grid' ?'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :'grid-cols-1'
                      }`}>
                        {currentPPAs?.map((ppa) => (
                          <PPACard
                            key={ppa?.id}
                            ppa={ppa}
                            onViewDetails={handleViewDetails}
                            onExpressInterest={handleExpressInterest}
                            onToggleWatchlist={handleToggleWatchlist}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Activity Sidebar */}
            <ActivitySidebar
              isCollapsed={activitySidebarCollapsed}
              onToggleCollapse={() => setActivitySidebarCollapsed(!activitySidebarCollapsed)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;