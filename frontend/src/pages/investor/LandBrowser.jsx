import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkflow, WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const LandBrowser = () => {
  const { 
    workflows, 
    loadWorkflows, 
    updateWorkflowState,
    canPerformWorkflowAction 
  } = useWorkflow();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    energy_type: '',
    min_capacity: '',
    max_capacity: '',
    min_price: '',
    max_price: '',
    location: ''
  });
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showInterestModal, setShowInterestModal] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      await loadWorkflows();
      setLoading(false);
    };
    fetchWorkflows();
  }, [loadWorkflows]);

  // Filter workflows that are available for investment (in progress state)
  const availableLands = workflows.filter(workflow => 
    workflow.state === WORKFLOW_STATES.IN_PROGRESS
  );

  // Apply filters
  const filteredLands = availableLands.filter(land => {
    if (filters.energy_type && land.energy_key !== filters.energy_type) return false;
    if (filters.min_capacity && land.capacity_mw < parseFloat(filters.min_capacity)) return false;
    if (filters.max_capacity && land.capacity_mw > parseFloat(filters.max_capacity)) return false;
    if (filters.min_price && land.price_per_mwh < parseFloat(filters.min_price)) return false;
    if (filters.max_price && land.price_per_mwh > parseFloat(filters.max_price)) return false;
    if (filters.location && !land.location_text.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  const handleSendInterest = async (workflowId) => {
    try {
      await updateWorkflowState(workflowId, WORKFLOW_STATES.INTEREST_REQUEST);
      setShowInterestModal(false);
      setSelectedWorkflow(null);
      // Refresh workflows
      await loadWorkflows();
    } catch (error) {
      console.error('Error sending interest:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      energy_type: '',
      min_capacity: '',
      max_capacity: '',
      min_price: '',
      max_price: '',
      location: ''
    });
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Browse Properties', icon: 'Search' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading available properties...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Properties - RenewMart Investor</title>
        <meta name="description" content="Browse available renewable energy properties for investment" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="flex">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
            <div className="p-6">
              <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
              
              <div className="mt-6">
                <div className="max-w-7xl mx-auto">
                  {/* Header */}
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Browse Properties</h1>
                    <p className="text-muted-foreground mt-1">
                      Discover available renewable energy properties for investment
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Energy Type
                        </label>
                        <select
                          value={filters.energy_type}
                          onChange={(e) => handleFilterChange('energy_type', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">All Types</option>
                          <option value="solar">Solar</option>
                          <option value="wind">Wind</option>
                          <option value="hydroelectric">Hydroelectric</option>
                          <option value="biomass">Biomass</option>
                          <option value="geothermal">Geothermal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Location
                        </label>
                        <Input
                          type="text"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          placeholder="Search by location"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Min Capacity (MW)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={filters.min_capacity}
                          onChange={(e) => handleFilterChange('min_capacity', e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Max Capacity (MW)
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={filters.max_capacity}
                          onChange={(e) => handleFilterChange('max_capacity', e.target.value)}
                          placeholder="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Min Price ($/MWh)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={filters.min_price}
                          onChange={(e) => handleFilterChange('min_price', e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Max Price ($/MWh)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={filters.max_price}
                          onChange={(e) => handleFilterChange('max_price', e.target.value)}
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="mb-4">
                    <p className="text-muted-foreground">
                      Showing {filteredLands.length} of {availableLands.length} available properties
                    </p>
                  </div>

                  {/* Properties Grid */}
                  {filteredLands.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {availableLands.length === 0 
                          ? "No properties are currently available for investment."
                          : "No properties match your current filters."
                        }
                      </p>
                      {availableLands.length > 0 && (
                        <Button variant="outline" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLands.map((land) => (
                        <div key={land.id} className="bg-card border border-border rounded-lg shadow-subtle hover:shadow-moderate transition-shadow">
                          {/* Property Header */}
                          <div className="p-6 border-b border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-foreground truncate">
                                {land.title}
                              </h3>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Available
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Icon name="MapPin" size={14} className="mr-1" />
                              {land.location_text}
                            </p>
                          </div>

                          {/* Property Details */}
                          <div className="p-6 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Area:</span>
                                <span className="ml-1 font-medium text-foreground">
                                  {land.area_acres} acres
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <span className="ml-1 font-medium text-foreground">
                                  {land.capacity_mw} MW
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Energy:</span>
                                <span className="ml-1 font-medium text-foreground capitalize">
                                  {land.energy_key}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <span className="ml-1 font-medium text-foreground">
                                  ${land.price_per_mwh}/MWh
                                </span>
                              </div>
                            </div>

                            {land.timeline_text && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Timeline:</span>
                                <span className="ml-1 text-foreground">{land.timeline_text}</span>
                              </div>
                            )}

                            {land.contract_term_years && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Contract Term:</span>
                                <span className="ml-1 text-foreground">{land.contract_term_years} years</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="p-6 pt-0">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setSelectedWorkflow(land)}
                              >
                                <Icon name="Eye" size={14} className="mr-2" />
                                View Details
                              </Button>
                              <Button 
                                className="flex-1"
                                onClick={() => {
                                  setSelectedWorkflow(land);
                                  setShowInterestModal(true);
                                }}
                              >
                                <Icon name="Heart" size={14} className="mr-2" />
                                Send Interest
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Send Interest Request
            </h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to send an interest request for <strong>{selectedWorkflow.title}</strong>?
              <br />
              <span className="text-sm text-warning">
                Note: You can only send one interest request at a time.
              </span>
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowInterestModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSendInterest(selectedWorkflow.id)}
                className="flex-1"
              >
                Send Interest
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LandBrowser;
