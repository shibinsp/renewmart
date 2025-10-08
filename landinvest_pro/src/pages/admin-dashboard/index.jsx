import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowBreadcrumbs from '../../components/ui/WorkflowBreadcrumbs';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActions from '../../components/ui/QuickActions';

import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';

import TaskTable from './components/TaskTable';
import FilterControls from './components/FilterControls';
import ActivityFeed from './components/ActivityFeed';
import DeadlineAlerts from './components/DeadlineAlerts';
import BulkActions from './components/BulkActions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    reviewerRole: '',
    projectType: '',
    status: '',
    priority: '',
    startDateFrom: '',
    endDateTo: '',
    search: ''
  });
  const [notifications, setNotifications] = useState([]);

  // Mock data for metrics
  const metricsData = [
    {
      title: "Pending Reviews",
      value: "24",
      change: "+3 from yesterday",
      changeType: "increase",
      icon: "FileCheck",
      color: "warning"
    },
    {
      title: "Overdue Tasks",
      value: "7",
      change: "-2 from yesterday",
      changeType: "decrease",
      icon: "AlertTriangle",
      color: "error"
    },
    {
      title: "Completed This Week",
      value: "18",
      change: "+12 from last week",
      changeType: "increase",
      icon: "CheckCircle",
      color: "success"
    },
    {
      title: "Avg Processing Time",
      value: "4.2 days",
      change: "-0.8 days",
      changeType: "decrease",
      icon: "Clock",
      color: "primary"
    }
  ];

  // Mock data for tasks
  const tasksData = [
    {
      id: "task-001",
      landownerName: "Sarah Johnson",
      location: "Austin, TX",
      projectType: "Solar",
      projectIcon: "Sun",
      assignedReviewer: "Michael Chen",
      reviewerRole: "RE Sales Advisor",
      startDate: "2025-01-08",
      endDate: "2025-01-15",
      status: "In Progress",
      priority: "High"
    },
    {
      id: "task-002",
      landownerName: "Robert Martinez",
      location: "Phoenix, AZ",
      projectType: "Wind",
      projectIcon: "Wind",
      assignedReviewer: "Emily Davis",
      reviewerRole: "RE Analyst",
      startDate: "2025-01-10",
      endDate: "2025-01-17",
      status: "Pending",
      priority: "Medium"
    },
    {
      id: "task-003",
      landownerName: "Jennifer Wilson",
      location: "Denver, CO",
      projectType: "Hydroelectric",
      projectIcon: "Waves",
      assignedReviewer: "David Thompson",
      reviewerRole: "RE Governance Lead",
      startDate: "2025-01-05",
      endDate: "2025-01-12",
      status: "Delayed",
      priority: "High"
    },
    {
      id: "task-004",
      landownerName: "Thomas Anderson",
      location: "Portland, OR",
      projectType: "Biomass",
      projectIcon: "Leaf",
      assignedReviewer: "Lisa Rodriguez",
      reviewerRole: "RE Analyst",
      startDate: "2025-01-12",
      endDate: "2025-01-19",
      status: "Pending",
      priority: "Low"
    },
    {
      id: "task-005",
      landownerName: "Maria Garcia",
      location: "San Diego, CA",
      projectType: "Geothermal",
      projectIcon: "Zap",
      assignedReviewer: "James Wilson",
      reviewerRole: "RE Sales Advisor",
      startDate: "2025-01-03",
      endDate: "2025-01-10",
      status: "Completed",
      priority: "Medium"
    },
    {
      id: "task-006",
      landownerName: "Christopher Lee",
      location: "Las Vegas, NV",
      projectType: "Solar",
      projectIcon: "Sun",
      assignedReviewer: "Amanda Brown",
      reviewerRole: "RE Governance Lead",
      startDate: "2025-01-11",
      endDate: "2025-01-18",
      status: "In Progress",
      priority: "High"
    }
  ];

  // Mock data for recent activities
  const activitiesData = [
    {
      id: "activity-001",
      type: "document_uploaded",
      user: "Sarah Johnson",
      action: "uploaded new documents for",
      target: "Solar Project - Austin",
      details: "Land ownership documents and topographical survey",
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: "activity-002",
      type: "review_assigned",
      user: "Admin",
      action: "assigned review task to",
      target: "Michael Chen",
      details: "RE Sales Advisor - Phoenix Wind Project",
      timestamp: new Date(Date.now() - 900000) // 15 minutes ago
    },
    {
      id: "activity-003",
      type: "status_changed",
      user: "Emily Davis",
      action: "changed status to \'In Progress\' for",
      target: "Denver Hydroelectric Project",
      details: "Started technical analysis phase",
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    },
    {
      id: "activity-004",
      type: "task_completed",
      user: "David Thompson",
      action: "completed review for",
      target: "Portland Biomass Project",
      details: "All governance requirements satisfied",
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      id: "activity-005",
      type: "deadline_approaching",
      user: "System",
      action: "deadline reminder for",
      target: "San Diego Geothermal Project",
      details: "Due in 2 days",
      timestamp: new Date(Date.now() - 7200000) // 2 hours ago
    }
  ];

  // Mock data for deadline alerts
  const alertsData = [
    {
      id: "alert-001",
      taskId: "task-003",
      taskTitle: "Denver Hydroelectric Project Review",
      assignedTo: "David Thompson",
      deadline: new Date(Date.now() + 86400000), // 1 day from now
      urgency: "critical",
      description: "Governance review is overdue and blocking project progression"
    },
    {
      id: "alert-002",
      taskId: "task-001",
      taskTitle: "Austin Solar Project Analysis",
      assignedTo: "Michael Chen",
      deadline: new Date(Date.now() + 172800000), // 2 days from now
      urgency: "warning",
      description: "Sales analysis due soon, financial model pending"
    },
    {
      id: "alert-003",
      taskId: "task-006",
      taskTitle: "Las Vegas Solar Compliance Check",
      assignedTo: "Amanda Brown",
      deadline: new Date(Date.now() + 432000000), // 5 days from now
      urgency: "info",
      description: "Environmental impact assessment review scheduled"
    }
  ];

  // Filter tasks based on current filters
  const filteredTasks = tasksData?.filter(task => {
    if (filters?.reviewerRole && task?.reviewerRole !== filters?.reviewerRole) return false;
    if (filters?.projectType && task?.projectType !== filters?.projectType) return false;
    if (filters?.status && task?.status !== filters?.status) return false;
    if (filters?.priority && task?.priority !== filters?.priority) return false;
    if (filters?.startDateFrom && new Date(task.startDate) < new Date(filters.startDateFrom)) return false;
    if (filters?.endDateTo && new Date(task.endDate) > new Date(filters.endDateTo)) return false;
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      return task?.landownerName?.toLowerCase()?.includes(searchTerm) || 
             task?.location?.toLowerCase()?.includes(searchTerm);
    }
    return true;
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      reviewerRole: '',
      projectType: '',
      status: '',
      priority: '',
      startDateFrom: '',
      endDateTo: '',
      search: ''
    });
  };

  const handleBulkAction = async (action, taskIds) => {
    // Mock bulk action processing
    console.log(`Executing ${action} on tasks:`, taskIds);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success notification
    const newNotification = {
      id: Date.now(),
      type: 'success',
      title: 'Bulk Action Completed',
      message: `Successfully executed ${action} on ${taskIds?.length} task${taskIds?.length !== 1 ? 's' : ''}`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev?.slice(0, 4)]);
    setSelectedTasks([]);
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'generate-report':
        // Mock report generation
        const reportNotification = {
          id: Date.now(),
          type: 'info',
          title: 'Report Generated',
          message: 'Administrative report has been generated and is ready for download',
          timestamp: new Date(),
          actions: [
            { label: 'Download', onClick: () => console.log('Downloading report...') }
          ]
        };
        setNotifications(prev => [reportNotification, ...prev?.slice(0, 4)]);
        break;
      default:
        console.log('Quick action:', actionId);
    }
  };

  // Initialize notifications on component mount
  useEffect(() => {
    const initialNotifications = [
      {
        id: 1,
        type: 'warning',
        title: 'Deadline Alert',
        message: 'Denver Hydroelectric Project review is overdue',
        timestamp: new Date(Date.now() - 600000)
      }
    ];
    setNotifications(initialNotifications);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" notifications={{ dashboard: 3, projects: 7 }} />
      <WorkflowBreadcrumbs />
      <main className="pt-4 pb-20">
        <div className="max-w-9xl mx-auto px-4 lg:px-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-bold text-2xl lg:text-3xl text-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="font-body text-muted-foreground">
                  Manage document reviews and task assignments for renewable energy projects
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/document-review')}
                  iconName="FileCheck"
                  iconSize={18}
                >
                  Review Queue
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleQuickAction('generate-report')}
                  iconName="BarChart3"
                  iconSize={18}
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsData?.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                color={metric?.color}
              />
            ))}
          </div>

          {/* Filter Controls */}
          <div className="mb-6">
            <FilterControls
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Bulk Actions */}
          {selectedTasks?.length > 0 && (
            <div className="mb-6">
              <BulkActions
                selectedTasks={selectedTasks}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedTasks([])}
              />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Task Table - Takes up 3 columns on xl screens */}
            <div className="xl:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  Active Reviews ({filteredTasks?.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="font-body text-sm text-muted-foreground">
                    {selectedTasks?.length} selected
                  </span>
                </div>
              </div>
              
              <TaskTable
                tasks={filteredTasks}
                selectedTasks={selectedTasks}
                onTaskSelect={setSelectedTasks}
                onBulkAction={handleBulkAction}
              />
            </div>

            {/* Side Panel - Takes up 1 column on xl screens */}
            <div className="xl:col-span-1 space-y-6">
              {/* Deadline Alerts */}
              <DeadlineAlerts alerts={alertsData} />
              
              {/* Activity Feed */}
              <ActivityFeed activities={activitiesData} />
            </div>
          </div>
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
        userRole="admin"
        onActionComplete={handleQuickAction}
        position="bottom-right"
      />
    </div>
  );
};

export default AdminDashboard;