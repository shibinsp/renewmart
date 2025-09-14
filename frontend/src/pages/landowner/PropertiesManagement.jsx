import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useWorkflow, WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PropertiesManagement = () => {
  const { workflows, loadWorkflows, getWorkflowsByState } = useWorkflow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedState, setSelectedState] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      await loadWorkflows();
      setLoading(false);
    };
    fetchWorkflows();
  }, [loadWorkflows]);

  const getStateColor = (state) => {
    const colors = {
      [WORKFLOW_STATES.SUBMITTED]: 'bg-blue-100 text-blue-800',
      [WORKFLOW_STATES.VERIFIED_BY_ADMIN]: 'bg-yellow-100 text-yellow-800',
      [WORKFLOW_STATES.TASKS_ASSIGNED]: 'bg-purple-100 text-purple-800',
      [WORKFLOW_STATES.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
      [WORKFLOW_STATES.INTEREST_REQUEST]: 'bg-indigo-100 text-indigo-800',
      [WORKFLOW_STATES.INTEREST_ACCEPTED]: 'bg-green-100 text-green-800',
      [WORKFLOW_STATES.READY_TO_BUILD]: 'bg-green-100 text-green-800'
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
  };

  const getStateLabel = (state) => {
    const labels = {
      [WORKFLOW_STATES.SUBMITTED]: 'Submitted',
      [WORKFLOW_STATES.VERIFIED_BY_ADMIN]: 'Verified by Admin',
      [WORKFLOW_STATES.TASKS_ASSIGNED]: 'Tasks Assigned',
      [WORKFLOW_STATES.IN_PROGRESS]: 'In Progress',
      [WORKFLOW_STATES.INTEREST_REQUEST]: 'Interest Request',
      [WORKFLOW_STATES.INTEREST_ACCEPTED]: 'Interest Accepted',
      [WORKFLOW_STATES.READY_TO_BUILD]: 'Ready to Build'
    };
    return labels[state] || state;
  };

  const filteredWorkflows = selectedState === 'all' 
    ? workflows 
    : getWorkflowsByState(selectedState);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Properties', icon: 'MapPin' }
  ];

  const stateOptions = [
    { value: 'all', label: 'All Properties' },
    { value: WORKFLOW_STATES.SUBMITTED, label: 'Submitted' },
    { value: WORKFLOW_STATES.VERIFIED_BY_ADMIN, label: 'Verified by Admin' },
    { value: WORKFLOW_STATES.TASKS_ASSIGNED, label: 'Tasks Assigned' },
    { value: WORKFLOW_STATES.IN_PROGRESS, label: 'In Progress' },
    { value: WORKFLOW_STATES.INTEREST_REQUEST, label: 'Interest Request' },
    { value: WORKFLOW_STATES.INTEREST_ACCEPTED, label: 'Interest Accepted' },
    { value: WORKFLOW_STATES.READY_TO_BUILD, label: 'Ready to Build' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Properties - RenewMart</title>
        <meta name="description" content="Manage your land properties and track development progress" />
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
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
                      <p className="text-muted-foreground mt-1">
                        Manage your land properties and track development progress
                      </p>
                    </div>
                    <div className="mt-4 lg:mt-0">
                      <Link to="/landowner/site-registration">
                        <Button>
                          <Icon name="Plus" size={16} className="mr-2" />
                          Register New Site
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-card border border-border rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Icon name="Filter" size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Filter by status:</span>
                      </div>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {stateOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Properties Grid */}
                  {filteredWorkflows.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <Icon name="MapPin" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {selectedState === 'all' 
                          ? "You haven't registered any properties yet."
                          : `No properties found with status "${getStateLabel(selectedState)}".`
                        }
                      </p>
                      <Link to="/landowner/site-registration">
                        <Button>
                          <Icon name="Plus" size={16} className="mr-2" />
                          Register Your First Site
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredWorkflows.map((property) => (
                        <div key={property.id} className="bg-card border border-border rounded-lg shadow-subtle hover:shadow-moderate transition-shadow">
                          {/* Property Header */}
                          <div className="p-6 border-b border-border">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-foreground truncate">
                                {property.title}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(property.state)}`}>
                                {getStateLabel(property.state)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Icon name="MapPin" size={14} className="mr-1" />
                              {property.location_text}
                            </p>
                          </div>

                          {/* Property Details */}
                          <div className="p-6 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Area:</span>
                                <span className="ml-1 font-medium text-foreground">
                                  {property.area_acres} acres
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>
                                <span className="ml-1 font-medium text-foreground">
                                  {property.capacity_mw} MW
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Energy:</span>
                                <span className="ml-1 font-medium text-foreground capitalize">
                                  {property.energy_key}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <span className="ml-1 font-medium text-foreground">
                                  ${property.price_per_mwh}/MWh
                                </span>
                              </div>
                            </div>

                            {property.timeline_text && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Timeline:</span>
                                <span className="ml-1 text-foreground">{property.timeline_text}</span>
                              </div>
                            )}

                            {property.developer_name && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Developer:</span>
                                <span className="ml-1 text-foreground">{property.developer_name}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="p-6 pt-0">
                            <div className="flex space-x-2">
                              <Link 
                                to={`/landowner/properties/${property.id}`}
                                className="flex-1"
                              >
                                <Button variant="outline" className="w-full">
                                  <Icon name="Eye" size={14} className="mr-2" />
                                  View Details
                                </Button>
                              </Link>
                              <Link 
                                to={`/landowner/properties/${property.id}/tasks`}
                                className="flex-1"
                              >
                                <Button variant="outline" className="w-full">
                                  <Icon name="CheckSquare" size={14} className="mr-2" />
                                  Tasks
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary Stats */}
                  {workflows.length > 0 && (
                    <div className="mt-8 bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Property Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{workflows.length}</div>
                          <div className="text-sm text-muted-foreground">Total Properties</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {getWorkflowsByState(WORKFLOW_STATES.READY_TO_BUILD).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Ready to Build</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {getWorkflowsByState(WORKFLOW_STATES.IN_PROGRESS).length}
                          </div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {getWorkflowsByState(WORKFLOW_STATES.SUBMITTED).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Submitted</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default PropertiesManagement;
