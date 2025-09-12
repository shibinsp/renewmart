import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import ProjectTabs from './components/ProjectTabs';
import ProjectCard from './components/ProjectCard';
import ProjectFilters from './components/ProjectFilters';
import ProjectInsights from './components/ProjectInsights';
import ProjectDetailModal from './components/ProjectDetailModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ProjectManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    teamMember: 'all',
    priority: 'all',
    search: '',
    budgetMin: '',
    budgetMax: '',
    deadlineFrom: '',
    deadlineTo: ''
  });

  // Mock project data
  const mockProjects = [
    {
      id: 1,
      name: 'Solar Farm Alpha',
      location: 'California, USA',
      capacity: '50MW Solar PV',
      status: 'Active',
      progress: 75,
      timeline: '12 months',
      budget: { total: 30000000, spent: 16000000 },
      nextMilestone: { title: 'Grid Connection', date: 'Jan 15, 2025' },
      lastUpdated: '2 hours ago',
      team: [
        { id: 1, name: 'Sarah Chen', role: 'Project Manager', email: 'sarah.chen@renewmart.com' },
        { id: 2, name: 'Michael Rodriguez', role: 'Lead Engineer', email: 'michael.r@renewmart.com' },
        { id: 3, name: 'Emily Johnson', role: 'Environmental Specialist', email: 'emily.j@renewmart.com' },
        { id: 4, name: 'David Kim', role: 'Financial Analyst', email: 'david.kim@renewmart.com' },
        { id: 5, name: 'Lisa Anderson', role: 'Compliance Officer', email: 'lisa.a@renewmart.com' }
      ],
      recentActivities: [
        { description: 'Environmental permits approved', timestamp: '2 hours ago' },
        { description: 'Equipment delivery scheduled', timestamp: '1 day ago' },
        { description: 'Site preparation completed', timestamp: '3 days ago' }
      ],
      metrics: {
        tasksCompleted: 45,
        totalTasks: 60,
        daysRemaining: 180,
        riskLevel: 'Low',
        roiForecast: 12.5
      }
    },
    {
      id: 2,
      name: 'Wind Energy Beta',
      location: 'Texas, USA',
      capacity: '100MW Wind',
      status: 'In Development',
      progress: 45,
      timeline: '18 months',
      budget: { total: 85000000, spent: 25000000 },
      nextMilestone: { title: 'Turbine Installation', date: 'Feb 28, 2025' },
      lastUpdated: '4 hours ago',
      team: [
        { id: 6, name: 'Robert Wilson', role: 'Project Manager', email: 'robert.w@renewmart.com' },
        { id: 7, name: 'Jennifer Davis', role: 'Wind Specialist', email: 'jennifer.d@renewmart.com' },
        { id: 8, name: 'Thomas Brown', role: 'Site Engineer', email: 'thomas.b@renewmart.com' }
      ],
      recentActivities: [
        { description: 'Wind assessment report finalized', timestamp: '4 hours ago' },
        { description: 'Foundation design approved', timestamp: '2 days ago' },
        { description: 'Access road construction started', timestamp: '1 week ago' }
      ],
      metrics: {
        tasksCompleted: 28,
        totalTasks: 65,
        daysRemaining: 420,
        riskLevel: 'Medium',
        roiForecast: 15.2
      }
    },
    {
      id: 3,
      name: 'Hydro Project Gamma',
      location: 'Oregon, USA',
      capacity: '25MW Hydro',
      status: 'Planning',
      progress: 25,
      timeline: '24 months',
      budget: { total: 45000000, spent: 5000000 },
      nextMilestone: { title: 'Environmental Impact Study', date: 'Mar 15, 2025' },
      lastUpdated: '1 day ago',
      team: [
        { id: 9, name: 'Amanda Taylor', role: 'Project Manager', email: 'amanda.t@renewmart.com' },
        { id: 10, name: 'Christopher Lee', role: 'Hydro Engineer', email: 'chris.lee@renewmart.com' }
      ],
      recentActivities: [
        { description: 'Feasibility study completed', timestamp: '1 day ago' },
        { description: 'Stakeholder meeting scheduled', timestamp: '3 days ago' },
        { description: 'Initial site survey conducted', timestamp: '1 week ago' }
      ],
      metrics: {
        tasksCompleted: 15,
        totalTasks: 55,
        daysRemaining: 720,
        riskLevel: 'High',
        roiForecast: 18.7
      }
    },
    {
      id: 4,
      name: 'Solar Farm Delta',
      location: 'Arizona, USA',
      capacity: '75MW Solar PV',
      status: 'Completed',
      progress: 100,
      timeline: 'Completed',
      budget: { total: 42000000, spent: 41500000 },
      nextMilestone: { title: 'Operations & Maintenance', date: 'Ongoing' },
      lastUpdated: '1 week ago',
      team: [
        { id: 11, name: 'Mark Johnson', role: 'Operations Manager', email: 'mark.j@renewmart.com' },
        { id: 12, name: 'Rachel Green', role: 'Maintenance Lead', email: 'rachel.g@renewmart.com' }
      ],
      recentActivities: [
        { description: 'Final commissioning completed', timestamp: '1 week ago' },
        { description: 'Grid synchronization successful', timestamp: '2 weeks ago' },
        { description: 'Performance testing passed', timestamp: '3 weeks ago' }
      ],
      metrics: {
        tasksCompleted: 80,
        totalTasks: 80,
        daysRemaining: 0,
        riskLevel: 'Low',
        roiForecast: 14.3
      }
    }
  ];

  // Filter projects based on active tab and filters
  const getFilteredProjects = () => {
    let filtered = mockProjects;

    // Filter by tab
    switch (activeTab) {
      case 'active':
        filtered = filtered?.filter(p => p?.status === 'Active');
        break;
      case 'planning':
        filtered = filtered?.filter(p => p?.status === 'Planning');
        break;
      case 'development':
        filtered = filtered?.filter(p => p?.status === 'In Development');
        break;
      case 'completed':
        filtered = filtered?.filter(p => p?.status === 'Completed');
        break;
      default:
        break;
    }

    // Apply additional filters
    if (filters?.search) {
      filtered = filtered?.filter(p => 
        p?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        p?.location?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      );
    }

    if (filters?.status !== 'all') {
      filtered = filtered?.filter(p => p?.status?.toLowerCase() === filters?.status);
    }

    if (filters?.teamMember !== 'all') {
      filtered = filtered?.filter(p => 
        p?.team?.some(member => 
          member?.name?.toLowerCase()?.replace(' ', '-') === filters?.teamMember
        )
      );
    }

    return filtered;
  };

  // Calculate tab counts
  const getTabCounts = () => {
    return {
      active: mockProjects?.filter(p => p?.status === 'Active')?.length,
      planning: mockProjects?.filter(p => p?.status === 'Planning')?.length,
      development: mockProjects?.filter(p => p?.status === 'In Development')?.length,
      completed: mockProjects?.filter(p => p?.status === 'Completed')?.length
    };
  };

  const handleToggleExpand = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded?.has(projectId)) {
      newExpanded?.delete(projectId);
    } else {
      newExpanded?.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleCreateProject = () => {
    console.log('Create new project');
  };

  const handleImportTemplate = () => {
    console.log('Import from template');
  };

  const filteredProjects = getFilteredProjects();
  const tabCounts = getTabCounts();

  return (
    <>
      <Helmet>
        <title>Project Management - RenewMart</title>
        <meta name="description" content="Comprehensive renewable energy project management and tracking platform" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        
        <main className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}>
          <div className="p-6">
            <BreadcrumbNavigation />
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Project Management</h1>
                <p className="text-muted-foreground">
                  Track and manage renewable energy projects from conception to completion
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button variant="outline" iconName="Download">
                  Export Report
                </Button>
                <Button variant="default" iconName="Plus">
                  New Project
                </Button>
              </div>
            </div>

            {/* Project Tabs */}
            <div className="mb-6">
              <ProjectTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabCounts={tabCounts}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Left Panel - Filters */}
              <div className="xl:col-span-1">
                <ProjectFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onCreateProject={handleCreateProject}
                  onImportTemplate={handleImportTemplate}
                />
              </div>

              {/* Main Content - Projects */}
              <div className="xl:col-span-2">
                <div className="space-y-6">
                  {/* Projects Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      {activeTab?.charAt(0)?.toUpperCase() + activeTab?.slice(1)} Projects
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({filteredProjects?.length})
                      </span>
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Grid3X3">
                        Grid
                      </Button>
                      <Button variant="ghost" size="sm" iconName="List">
                        List
                      </Button>
                    </div>
                  </div>

                  {/* Projects List */}
                  {filteredProjects?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="FolderOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                      <p className="text-muted-foreground mb-4">
                        {filters?.search || filters?.status !== 'all' || filters?.teamMember !== 'all' ?'Try adjusting your filters to see more projects.' :'Get started by creating your first project.'
                        }
                      </p>
                      <Button variant="default" iconName="Plus" onClick={handleCreateProject}>
                        Create Project
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProjects?.map((project) => (
                        <ProjectCard
                          key={project?.id}
                          project={project}
                          isExpanded={expandedProjects?.has(project?.id)}
                          onToggleExpand={handleToggleExpand}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Insights */}
              <div className="xl:col-span-1">
                <ProjectInsights insights={{}} />
              </div>
            </div>
          </div>
        </main>

        {/* Project Detail Modal */}
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProject(null);
          }}
        />
      </div>
    </>
  );
};

export default ProjectManagement;