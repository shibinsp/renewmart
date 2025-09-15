import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import MetricCard from './components/MetricCard';
import ActivityFeed from './components/ActivityFeed';
import ProjectChart from './components/ProjectChart';
import RoleBasedQuickActions from './components/RoleBasedQuickActions';
import RoleBasedProjectsTable from './components/RoleBasedProjectsTable';
import UpcomingTasks from './components/UpcomingTasks';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, landsAPI } from '../../services/api';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user profile and dashboard metrics
        const [profileResponse, landsResponse] = await Promise.all([
            usersAPI.getProfile(),
          landsAPI.getLands({ limit: 5 }) // Get recent lands for overview
        ]);
        
        setDashboardData({
          profile: profileResponse.data,
          recentLands: landsResponse.data.lands || []
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userRole = user?.roles?.[0]?.replace('re_', '').replace('_', ' ') || 'User';
  const userName = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 
                   dashboardData?.profile?.full_name || 'User';

  const getMetricsForRole = (roles) => {
    const hasRole = (role) => roles?.includes(role);
    
    if (hasRole('investor')) {
        return [
          { title: 'Portfolio Value', value: '$125.4M', change: '+8.2%', changeType: 'positive', icon: 'TrendingUp', color: 'primary' },
          { title: 'Active Investments', value: '24', change: '+3', changeType: 'positive', icon: 'Briefcase', color: 'success' },
          { title: 'Monthly Returns', value: '12.5%', change: '+1.2%', changeType: 'positive', icon: 'DollarSign', color: 'secondary' },
          { title: 'Pipeline Deals', value: '8', change: '+2', changeType: 'positive', icon: 'Target', color: 'warning' }
        ];
    } else if (hasRole('landowner')) {
        return [
          { title: 'Property Listings', value: '12', change: '+2', changeType: 'positive', icon: 'MapPin', color: 'primary' },
          { title: 'Active Inquiries', value: '18', change: '+5', changeType: 'positive', icon: 'MessageCircle', color: 'success' },
          { title: 'Revenue Generated', value: '$45.2K', change: '+12.3%', changeType: 'positive', icon: 'DollarSign', color: 'secondary' },
          { title: 'Site Assessments', value: '6', change: '+1', changeType: 'positive', icon: 'Search', color: 'warning' }
        ];
    } else if (hasRole('administrator') || hasRole('re_governance_lead')) {
        return [
          { title: 'Total Users', value: '1,247', change: '+23', changeType: 'positive', icon: 'Users', color: 'primary' },
          { title: 'Active Properties', value: '89', change: '+12', changeType: 'positive', icon: 'MapPin', color: 'success' },
          { title: 'Platform Revenue', value: '$125.4K', change: '+18.5%', changeType: 'positive', icon: 'DollarSign', color: 'secondary' },
          { title: 'System Health', value: '99.2%', change: '+0.3%', changeType: 'positive', icon: 'Shield', color: 'warning' }
        ];
    } else { // Default for other roles (sales advisor, analyst, project manager)
        return [
          { title: 'Active Projects', value: '24', change: '+3', changeType: 'positive', icon: 'FolderOpen', color: 'primary' },
          { title: 'Total Revenue', value: '$2.4M', change: '+12.5%', changeType: 'positive', icon: 'DollarSign', color: 'success' },
          { title: 'Pipeline Value', value: '$8.7M', change: '+18.2%', changeType: 'positive', icon: 'TrendingUp', color: 'secondary' },
          { title: 'Completion Rate', value: '94%', change: '+2%', changeType: 'positive', icon: 'CheckCircle', color: 'warning' }
        ];
    }
  };

  const metrics = getMetricsForRole(user?.roles || []);

  return (
    <>
      <Helmet>
        <title>Dashboard - RenewMart</title>
        <meta name="description" content="RenewMart dashboard providing comprehensive overview of renewable energy projects, marketplace activities, and performance metrics." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}>
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <BreadcrumbNavigation />
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome back, {userName}! 👋
                  </h1>
                  <p className="text-muted-foreground">
                    {formatDate(currentTime)} • {formatTime(currentTime)}
                  </p>
                </div>
                
                <div className="mt-4 lg:mt-0 flex items-center space-x-2">
                  <div className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {userRole}
                  </div>
                  <div className="px-3 py-1 bg-success/10 text-success text-sm font-medium rounded-full">
                    Online
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics?.map((metric, index) => (
                <MetricCard
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Left Column - Activity Feed */}
              <div className="lg:col-span-4">
                <ActivityFeed />
              </div>

              {/* Center Column - Charts */}
              <div className="lg:col-span-8">
                <ProjectChart />
              </div>
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              {/* Quick Actions */}
              <div className="lg:col-span-6">
                <RoleBasedQuickActions />
              </div>

              {/* Upcoming Tasks */}
              <div className="lg:col-span-6">
                <UpcomingTasks />
              </div>
            </div>

            {/* Role-based Table */}
            <div className="mb-8">
              <RoleBasedProjectsTable />
            </div>

            {/* Footer */}
            <div className="text-center py-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © {new Date()?.getFullYear()} RenewMart. Accelerating the energy transition through innovative renewable energy solutions.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;