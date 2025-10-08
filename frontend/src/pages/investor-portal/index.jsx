import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowBreadcrumbs from '../../components/ui/WorkflowBreadcrumbs';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActions from '../../components/ui/QuickActions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProjectCard from './components/ProjectCard';
import FilterPanel from './components/FilterPanel';
import MapView from './components/MapView';
import SavedSearches from './components/SavedSearches';
import WatchlistPanel from './components/WatchlistPanel';

const InvestorPortal = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    projectType: '',
    location: '',
    capacityRange: { min: '', max: '' },
    priceRange: { min: '', max: '' },
    timeline: '',
    sortBy: 'newest',
    availableOnly: true
  });

  // Mock data for renewable energy projects
  const mockProjects = [
    {
      id: '1',
      name: 'Desert Solar Farm Alpha',
      location: 'Mojave Desert, California',
      type: 'Solar',
      capacity: 250,
      pricePerMWh: 45.50,
      timeline: '18-24 months',
      contractDuration: '25 years',
      partners: ['SunPower Corp', 'Tesla Energy'],
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
      status: 'Available',
      coordinates: { lat: 35.0178, lng: -115.4734 },
      description: `Large-scale solar installation project in prime desert location with excellent solar irradiance levels.\n\nProject includes advanced tracking systems and battery storage integration for maximum efficiency.`,
      publishedAt: new Date('2025-01-10'),
      isAvailable: true
    },
    {
      id: '2',
      name: 'Prairie Wind Energy Complex',
      location: 'Texas Panhandle, Texas',
      type: 'Wind',
      capacity: 400,
      pricePerMWh: 38.75,
      timeline: '24-30 months',
      contractDuration: '20 years',
      partners: ['Vestas', 'General Electric'],
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
      status: 'Available',
      coordinates: { lat: 35.2211, lng: -101.8313 },
      description: `High-capacity wind farm development in one of the most consistent wind corridors in North America.\n\nFeatures state-of-the-art turbine technology with advanced grid integration capabilities.`,
      publishedAt: new Date('2025-01-08'),
      isAvailable: true
    },
    {
      id: '3',
      name: 'Mountain Hydro Project',
      location: 'Colorado Rockies, Colorado',
      type: 'Hydroelectric',
      capacity: 150,
      pricePerMWh: 52.25,
      timeline: '36-42 months',
      contractDuration: '30 years',
      partners: ['Voith Hydro', 'Andritz'],
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      status: 'Available',
      coordinates: { lat: 39.5501, lng: -105.7821 },
      description: `Run-of-river hydroelectric facility utilizing natural water flow for sustainable energy generation.\n\nMinimal environmental impact with fish-friendly turbine design and habitat preservation measures.`,
      publishedAt: new Date('2025-01-05'),
      isAvailable: true
    },
    {
      id: '4',
      name: 'Biomass Energy Center',
      location: 'Central Valley, California',
      type: 'Biomass',
      capacity: 75,
      pricePerMWh: 48.90,
      timeline: '12-18 months',
      contractDuration: '15 years',
      partners: ['Babcock & Wilcox', 'Renewable Energy Group'],
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop',
      status: 'Available',
      coordinates: { lat: 36.7783, lng: -119.4179 },
      description: `Agricultural waste-to-energy facility converting local farming residues into clean electricity.\n\nSupports local agricultural economy while providing reliable baseload renewable power.`,
      publishedAt: new Date('2025-01-12'),
      isAvailable: true
    },
    {
      id: '5',
      name: 'Geothermal Valley Station',
      location: 'Imperial Valley, California',
      type: 'Geothermal',
      capacity: 200,
      pricePerMWh: 41.60,
      timeline: '30-36 months',
      contractDuration: '25 years',
      partners: ['Ormat Technologies', 'Calpine Corporation'],
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop',
      status: 'Available',
      coordinates: { lat: 33.0114, lng: -115.4734 },
      description: `Enhanced geothermal system utilizing proven reservoir technology for consistent power generation.\n\nProvides 24/7 renewable baseload power with minimal surface footprint and environmental impact.`,
      publishedAt: new Date('2025-01-07'),
      isAvailable: true
    },
    {
      id: '6',
      name: 'Coastal Wind Farm Beta',
      location: 'Offshore California',
      type: 'Wind',
      capacity: 600,
      pricePerMWh: 42.30,
      timeline: '48-60 months',
      contractDuration: '25 years',
      partners: ['Ørsted', 'Siemens Gamesa'],
      image: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&h=300&fit=crop',
      status: 'Available',
      coordinates: { lat: 34.0522, lng: -118.2437 },
      description: `Floating offshore wind development leveraging consistent ocean winds for maximum energy yield.\n\nCutting-edge floating platform technology enables deployment in deeper waters with superior wind resources.`,
      publishedAt: new Date('2025-01-03'),
      isAvailable: true
    }
  ];

  // Mock saved searches
  const mockSavedSearches = [
    {
      id: '1',
      name: 'Large Solar Projects',
      filters: { projectType: 'Solar', capacityRange: { min: '200', max: '' } },
      createdAt: new Date('2025-01-01'),
      resultCount: 2
    },
    {
      id: '2',
      name: 'California Opportunities',
      filters: { location: 'California', priceRange: { min: '', max: '50' } },
      createdAt: new Date('2024-12-28'),
      resultCount: 4
    }
  ];

  // Mock watchlist items
  const mockWatchlistItems = [
    mockProjects?.[0], // Desert Solar Farm Alpha
    mockProjects?.[2], // Mountain Hydro Project
    mockProjects?.[4]  // Geothermal Valley Station
  ];

  // Filter projects based on current filters
  const filteredProjects = mockProjects?.filter(project => {
    if (filters?.search && !project?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) && 
        !project?.location?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    if (filters?.projectType && project?.type !== filters?.projectType) {
      return false;
    }
    if (filters?.location && !project?.location?.includes(filters?.location)) {
      return false;
    }
    if (filters?.capacityRange?.min && project?.capacity < parseInt(filters?.capacityRange?.min)) {
      return false;
    }
    if (filters?.capacityRange?.max && project?.capacity > parseInt(filters?.capacityRange?.max)) {
      return false;
    }
    if (filters?.priceRange?.min && project?.pricePerMWh < parseFloat(filters?.priceRange?.min)) {
      return false;
    }
    if (filters?.priceRange?.max && project?.pricePerMWh > parseFloat(filters?.priceRange?.max)) {
      return false;
    }
    if (filters?.availableOnly && !project?.isAvailable) {
      return false;
    }
    return true;
  });

  // Sort filtered projects
  const sortedProjects = [...filteredProjects]?.sort((a, b) => {
    switch (filters?.sortBy) {
      case 'price-low':
        return a?.pricePerMWh - b?.pricePerMWh;
      case 'price-high':
        return b?.pricePerMWh - a?.pricePerMWh;
      case 'capacity-high':
        return b?.capacity - a?.capacity;
      case 'capacity-low':
        return a?.capacity - b?.capacity;
      case 'newest':
      default:
        return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
  });

  useEffect(() => {
    // Initialize with mock data
    setWatchlistItems(mockWatchlistItems);
    setSavedSearches(mockSavedSearches);

    // Show welcome notification
    const welcomeNotification = {
      id: 'welcome',
      type: 'info',
      title: 'Welcome to Investor Portal',
      message: 'Discover renewable energy investment opportunities and express your interest in promising projects.',
      timestamp: new Date(),
      actions: [
        {
          label: 'View Tutorial',
          onClick: () => console.log('Tutorial clicked')
        }
      ]
    };
    setNotifications([welcomeNotification]);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      projectType: '',
      location: '',
      capacityRange: { min: '', max: '' },
      priceRange: { min: '', max: '' },
      timeline: '',
      sortBy: 'newest',
      availableOnly: true
    };
    setFilters(clearedFilters);
  };

  const handleViewDetails = (projectId) => {
    console.log('View details for project:', projectId);
    // In a real app, this would navigate to project details page
    const notification = {
      id: `view-${projectId}-${Date.now()}`,
      type: 'info',
      message: 'Project details would open in a new view.',
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const handleExpressInterest = (projectId) => {
    const project = mockProjects?.find(p => p?.id === projectId);
    if (project) {
      const notification = {
        id: `interest-${projectId}-${Date.now()}`,
        type: 'success',
        title: 'Interest Expressed',
        message: `Your interest in "${project?.name}" has been recorded. The project team will contact you soon.`,
        timestamp: new Date()
      };
      setNotifications(prev => [...prev, notification]);
    }
  };

  const handleSaveToWatchlist = (projectId) => {
    const project = mockProjects?.find(p => p?.id === projectId);
    const isAlreadyWatchlisted = watchlistItems?.some(item => item?.id === projectId);
    
    if (isAlreadyWatchlisted) {
      setWatchlistItems(prev => prev?.filter(item => item?.id !== projectId));
      const notification = {
        id: `remove-watchlist-${projectId}-${Date.now()}`,
        type: 'info',
        message: `"${project?.name}" removed from watchlist.`,
        timestamp: new Date()
      };
      setNotifications(prev => [...prev, notification]);
    } else {
      setWatchlistItems(prev => [...prev, project]);
      const notification = {
        id: `add-watchlist-${projectId}-${Date.now()}`,
        type: 'success',
        message: `"${project?.name}" added to watchlist.`,
        timestamp: new Date()
      };
      setNotifications(prev => [...prev, notification]);
    }
  };

  const handleRemoveFromWatchlist = (projectId) => {
    const project = mockProjects?.find(p => p?.id === projectId);
    setWatchlistItems(prev => prev?.filter(item => item?.id !== projectId));
    const notification = {
      id: `remove-watchlist-${projectId}-${Date.now()}`,
      type: 'info',
      message: `"${project?.name}" removed from watchlist.`,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const handleSaveSearch = (searchData) => {
    setSavedSearches(prev => [...prev, searchData]);
    const notification = {
      id: `save-search-${Date.now()}`,
      type: 'success',
      message: `Search "${searchData?.name}" has been saved.`,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const handleLoadSearch = (search) => {
    setFilters(search?.filters);
    const notification = {
      id: `load-search-${Date.now()}`,
      type: 'info',
      message: `Loaded search "${search?.name}".`,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const handleDeleteSearch = (searchId) => {
    const search = savedSearches?.find(s => s?.id === searchId);
    setSavedSearches(prev => prev?.filter(s => s?.id !== searchId));
    const notification = {
      id: `delete-search-${Date.now()}`,
      type: 'info',
      message: `Search "${search?.name}" has been deleted.`,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  const handleProjectSelect = (projectId, action = null) => {
    if (projectId) {
      const project = mockProjects?.find(p => p?.id === projectId);
      setSelectedProject(project);
      
      if (action === 'view') {
        handleViewDetails(projectId);
      } else if (action === 'interest') {
        handleExpressInterest(projectId);
      }
    } else {
      setSelectedProject(null);
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'express-interest':
        if (sortedProjects?.length > 0) {
          handleExpressInterest(sortedProjects?.[0]?.id);
        }
        break;
      case 'request-info':
        const notification = {
          id: `request-info-${Date.now()}`,
          type: 'info',
          message: 'Information request form would open.',
          timestamp: new Date()
        };
        setNotifications(prev => [...prev, notification]);
        break;
      case 'schedule-visit':
        const visitNotification = {
          id: `schedule-visit-${Date.now()}`,
          type: 'info',
          message: 'Site visit scheduling interface would open.',
          timestamp: new Date()
        };
        setNotifications(prev => [...prev, visitNotification]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="investor" notifications={{ opportunities: sortedProjects?.length }} />
      <WorkflowBreadcrumbs />
      <main className="max-w-9xl mx-auto px-4 lg:px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-heading font-bold text-3xl text-foreground">
              Investment Opportunities
            </h1>
            
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-smooth ${
                    viewMode === 'grid' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Grid3X3" size={18} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-smooth ${
                    viewMode === 'map' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name="Map" size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Discover and evaluate renewable energy projects ready for investment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters and Saved Content */}
          <div className="lg:col-span-1 space-y-6">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              isOpen={isFilterPanelOpen}
              onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              totalResults={sortedProjects?.length}
            />
            
            <div className="hidden lg:block">
              <SavedSearches
                savedSearches={savedSearches}
                onLoadSearch={handleLoadSearch}
                onSaveSearch={handleSaveSearch}
                onDeleteSearch={handleDeleteSearch}
                currentFilters={filters}
              />
            </div>
            
            <div className="hidden lg:block">
              <WatchlistPanel
                watchlistItems={watchlistItems}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                onViewProject={handleViewDetails}
                onExpressInterest={handleExpressInterest}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  {sortedProjects?.length} {sortedProjects?.length === 1 ? 'Project' : 'Projects'} Found
                </h2>
                
                {Object.values(filters)?.some(value => 
                  value && (typeof value === 'string' ? value : Object.values(value)?.some(v => v))
                ) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    iconName="X"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProjects?.map((project) => (
                  <ProjectCard
                    key={project?.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                    onExpressInterest={handleExpressInterest}
                    onSaveToWatchlist={handleSaveToWatchlist}
                    isWatchlisted={watchlistItems?.some(item => item?.id === project?.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapView
                  projects={sortedProjects}
                  onProjectSelect={handleProjectSelect}
                  selectedProject={selectedProject}
                />
              </div>
            )}

            {/* No Results */}
            {sortedProjects?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                  No projects found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to see more opportunities
                </p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  iconName="RotateCcw"
                  iconPosition="left"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Saved Content */}
        <div className="lg:hidden mt-8 space-y-6">
          <SavedSearches
            savedSearches={savedSearches}
            onLoadSearch={handleLoadSearch}
            onSaveSearch={handleSaveSearch}
            onDeleteSearch={handleDeleteSearch}
            currentFilters={filters}
          />
          
          <WatchlistPanel
            watchlistItems={watchlistItems}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onViewProject={handleViewDetails}
            onExpressInterest={handleExpressInterest}
          />
        </div>
      </main>
      {/* Notifications */}
      <NotificationIndicator
        notifications={notifications}
        position="top-right"
        maxVisible={3}
        autoHide={true}
        hideDelay={5000}
      />
      {/* Quick Actions */}
      <QuickActions
        userRole="investor"
        currentContext="investor-portal"
        onActionComplete={handleQuickAction}
        position="bottom-right"
      />
    </div>
  );
};

export default InvestorPortal;