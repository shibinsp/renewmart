import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowBreadcrumbs from '../../components/ui/WorkflowBreadcrumbs';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActions from '../../components/ui/QuickActions';
import Button from '../../components/ui/Button';
import ProjectSummaryCards from './components/ProjectSummaryCards';
import ProjectFilters from './components/ProjectFilters';
import ProjectTable from './components/ProjectTable';
import EmptyState from './components/EmptyState';

const LandownerDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    projectType: 'all',
    status: 'all',
    timeline: 'all',
    sortBy: 'updated'
  });
  const [notifications, setNotifications] = useState([]);

  // Mock data for projects
  const mockProjects = [
    {
      id: "PRJ-001",
      name: "Sunrise Solar Farm",
      location: "Austin, Texas",
      type: "solar",
      capacity: 25.5,
      status: "published",
      lastUpdated: "2025-01-10T14:30:00Z",
      timeline: "12-months",
      estimatedRevenue: 85.50
    },
    {
      id: "PRJ-002",
      name: "Prairie Wind Project",
      location: "Oklahoma City, Oklahoma",
      type: "wind",
      capacity: 45.0,
      status: "approved",
      lastUpdated: "2025-01-08T09:15:00Z",
      timeline: "18-months",
      estimatedRevenue: 92.75
    },
    {
      id: "PRJ-003",
      name: "Green Valley Hydro",
      location: "Denver, Colorado",
      type: "hydroelectric",
      capacity: 12.8,
      status: "under-review",
      lastUpdated: "2025-01-05T16:45:00Z",
      timeline: "24-months",
      estimatedRevenue: 78.25
    },
    {
      id: "PRJ-004",
      name: "Mountain View Solar",
      location: "Phoenix, Arizona",
      type: "solar",
      capacity: 18.2,
      status: "draft",
      lastUpdated: "2025-01-03T11:20:00Z",
      timeline: "6-months",
      estimatedRevenue: 88.00
    },
    {
      id: "PRJ-005",
      name: "Coastal Wind Farm",
      location: "San Diego, California",
      type: "wind",
      capacity: 67.5,
      status: "published",
      lastUpdated: "2024-12-28T13:10:00Z",
      timeline: "18-months",
      estimatedRevenue: 95.50
    }
  ];

  // Mock summary data
  const summaryData = {
    totalLandArea: 1247,
    activeProjects: 5,
    completedSubmissions: 3,
    estimatedRevenue: 439.00
  };

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Project Approved',
      message: 'Prairie Wind Project has been approved and is ready for document upload.',
      timestamp: new Date(Date.now() - 300000),
      actions: [
        {
          label: 'Upload Documents',
          onClick: () => navigate('/document-upload')
        }
      ]
    },
    {
      id: 2,
      type: 'info',
      title: 'Investor Interest',
      message: 'New investor has expressed interest in Sunrise Solar Farm.',
      timestamp: new Date(Date.now() - 600000)
    }
  ];

  useEffect(() => {
    // Simulate API call
    setProjects(mockProjects);
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter
    if (filters?.search) {
      filtered = filtered?.filter(project =>
        project?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        project?.location?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        project?.id?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    // Apply project type filter
    if (filters?.projectType !== 'all') {
      filtered = filtered?.filter(project => project?.type === filters?.projectType);
    }

    // Apply status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(project => project?.status === filters?.status);
    }

    // Apply timeline filter
    if (filters?.timeline !== 'all') {
      filtered = filtered?.filter(project => project?.timeline === filters?.timeline);
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'location':
          return a?.location?.localeCompare(b?.location);
        case 'capacity':
          return b?.capacity - a?.capacity;
        case 'updated':
        default:
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      }
    });

    setFilteredProjects(filtered);
  }, [projects, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      projectType: 'all',
      status: 'all',
      timeline: 'all',
      sortBy: 'updated'
    });
  };

  const handleEditProject = (project) => {
    navigate('/document-upload', { state: { projectId: project?.id, mode: 'edit' } });
  };

  const handleViewProject = (project) => {
    // In a real app, this would navigate to a project detail page
    console.log('Viewing project:', project);
  };

  const handleContinueDraft = (project) => {
    navigate('/document-upload', { state: { projectId: project?.id, mode: 'continue' } });
  };

  const handleActionComplete = (action) => {
    switch (action) {
      case 'save-draft':
        // Handle save draft action
        console.log('Saving draft...');
        break;
      default:
        break;
    }
  };

  const hasActiveFilters = filters?.search || 
    filters?.projectType !== 'all' || 
    filters?.status !== 'all' || 
    filters?.timeline !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="landowner" 
        notifications={{
          dashboard: notifications?.length,
          projects: 2
        }} 
      />
      <WorkflowBreadcrumbs />
      <main className="pt-4 pb-20">
        <div className="max-w-9xl mx-auto px-4 lg:px-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                Landowner Dashboard
              </h1>
              <p className="text-muted-foreground font-body">
                Manage your renewable energy projects and track investment opportunities
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0">
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate('/document-upload')}
                iconName="Plus"
                iconPosition="left"
              >
                Add New Project
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <ProjectSummaryCards summaryData={summaryData} />

          {/* Filters */}
          <ProjectFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />

          {/* Projects Table or Empty State */}
          {filteredProjects?.length > 0 ? (
            <ProjectTable
              projects={filteredProjects}
              onEdit={handleEditProject}
              onView={handleViewProject}
              onContinueDraft={handleContinueDraft}
            />
          ) : (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </main>
      {/* Notifications */}
      <NotificationIndicator
        notifications={notifications}
        position="top-right"
        maxVisible={3}
        autoHide={true}
        hideDelay={8000}
      />
      {/* Quick Actions */}
      <QuickActions
        userRole="landowner"
        currentContext="dashboard"
        onActionComplete={handleActionComplete}
        position="bottom-right"
      />
    </div>
  );
};

export default LandownerDashboard;