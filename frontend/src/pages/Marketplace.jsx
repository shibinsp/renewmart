import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, RefreshCw, Heart, Bookmark, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Marketplace = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');
  
  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    projectTypes: [],
    capacityMin: '',
    capacityMax: '',
    priceMin: '',
    priceMax: '',
    timeline: ''
  });

  // Sample project data matching the image
  const [projects] = useState([
    {
      id: 1,
      title: 'California Solar 50MW+',
      type: 'Solar',
      location: 'Riverside County, CA',
      capacity: 75,
      price: 48.50,
      timeline: '6-12 months',
      contract: '20 years',
      status: 'New Listing',
      image: '/api/placeholder/300/200',
      saved: false,
      liked: false
    },
    {
      id: 2,
      title: 'Texas Wind Projects',
      type: 'Wind',
      location: 'Lubbock County, TX',
      capacity: 120,
      price: 52.75,
      timeline: '12-24 months',
      contract: '25 years',
      status: 'Hot',
      image: '/api/placeholder/300/200',
      saved: true,
      liked: true
    },
    {
      id: 3,
      title: 'Nevada Solar Farm',
      type: 'Solar',
      location: 'Clark County, NV',
      capacity: 60,
      price: 46.25,
      timeline: '0-6 months',
      contract: '15 years',
      status: 'New Listing',
      image: '/api/placeholder/300/200',
      saved: false,
      liked: false
    },
    {
      id: 4,
      title: 'Oregon Hydro Project',
      type: 'Hydro',
      location: 'Columbia River, OR',
      capacity: 85,
      price: 55.00,
      timeline: '24+ months',
      contract: '30 years',
      status: 'New Listing',
      image: '/api/placeholder/300/200',
      saved: true,
      liked: false
    }
  ]);

  const [savedSearches] = useState([
    { name: 'California Solar 50MW+', type: 'Solar, California, 50-100MW', results: 12, time: '2 hours ago' },
    { name: 'Texas Wind Projects', type: 'Wind, Texas, $45-50/MWh', results: 8, time: '1 day ago' }
  ]);

  const [recentActivity] = useState([
    { name: 'Hydro Northeast', type: 'Hydro, Northeast, 6-12 months', results: 3, time: '3 days ago' }
  ]);

  const projectTypes = ['Solar', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal'];
  const timelineOptions = ['0-6 months', '6-12 months', '12-24 months', '24+ months'];
  const locationOptions = ['Select states...', 'California', 'Texas', 'Nevada', 'Oregon', 'New York'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProjectTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      location: '',
      projectTypes: [],
      capacityMin: '',
      capacityMax: '',
      priceMin: '',
      priceMax: '',
      timeline: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hot': return 'bg-red-500';
      case 'New Listing': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Solar': return 'bg-yellow-100 text-yellow-800';
      case 'Wind': return 'bg-blue-100 text-blue-800';
      case 'Hydro': return 'bg-cyan-100 text-cyan-800';
      case 'Hydroelectric': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search renewable energy projects, locations, or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Showing 1-6 of 6 results</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="capacity">Capacity</option>
                <option value="timeline">Timeline</option>
              </select>
            </div>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {locationOptions.map(option => (
                  <option key={option} value={option === 'Select states...' ? '' : option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
              <div className="space-y-2">
                {projectTypes.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.projectTypes.includes(type)}
                      onChange={() => handleProjectTypeToggle(type)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (MW)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min MW"
                  value={filters.capacityMin}
                  onChange={(e) => handleFilterChange('capacityMin', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max MW"
                  value={filters.capacityMax}
                  onChange={(e) => handleFilterChange('capacityMax', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($/MWh)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Timeline Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
              <select
                value={filters.timeline}
                onChange={(e) => handleFilterChange('timeline', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select timeline...</option>
                {timelineOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Projects Grid */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold mb-2">{project.type}</div>
                        <div className="text-sm opacity-90">{project.location}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(project.type)}`}>
                        {project.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-1">
                      <button className="p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors">
                        <Heart className={`w-4 h-4 ${project.liked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                      </button>
                      <button className="p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors">
                        <Bookmark className={`w-4 h-4 ${project.saved ? 'text-blue-500 fill-current' : 'text-gray-600'}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{project.location}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Capacity</div>
                        <div className="font-semibold">{project.capacity} MW</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="font-semibold">${project.price}/MWh</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Timeline</div>
                        <div className="text-sm">{project.timeline}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Contract</div>
                        <div className="text-sm">{project.contract}</div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
            
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              {['Saved', 'Recent', 'For You'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Saved Searches */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Saved Searches</h4>
                  <button className="text-sm text-blue-600 hover:text-blue-800">+ New</button>
                </div>
                {savedSearches.map((search, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-1">{search.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{search.type}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{search.results} results</span>
                      <span>{search.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            {activeTab === 'recent' && (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-1">{activity.name}</h5>
                    <p className="text-xs text-gray-600 mb-2">{activity.type}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{activity.results} results</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* User Stats */}
            {activeTab === 'for you' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-600">Projects Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Inquiries Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600">Watchlisted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-gray-600">Saved Searches</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;