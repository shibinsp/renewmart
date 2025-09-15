import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import LandRegistrationModal from './components/LandRegistrationModal';
import LandCard from './components/LandCard';
import LandMetrics from './components/LandMetrics';
import RecentActivity from './components/RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { landsAPI } from '../../services/api';

const LandownerDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalLands: 0,
    publishedLands: 0,
    draftLands: 0,
    totalInterests: 0,
    totalRevenue: 0
  });
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Landowner Portal', path: '/landowner' }
  ];

  useEffect(() => {
    fetchLandownerData();
  }, []);

  const fetchLandownerData = async () => {
    try {
      setLoading(true);
      const response = await landsAPI.getLands({ owner: user?.user_id });
      const userLands = response.data.lands || [];
      setLands(userLands);
      
      // Calculate metrics
      const totalLands = userLands.length;
      const publishedLands = userLands.filter(land => land.status === 'published').length;
      const draftLands = userLands.filter(land => land.status === 'draft').length;
      
      setMetrics({
        totalLands,
        publishedLands,
        draftLands,
        totalInterests: 0, // TODO: Implement when interests API is available
        totalRevenue: 0 // TODO: Calculate from contracts
      });
    } catch (error) {
      console.error('Failed to fetch landowner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLandRegistered = () => {
    setShowRegistrationModal(false);
    fetchLandownerData(); // Refresh the data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Landowner Dashboard - RenewMart</title>
        <meta name="description" content="Manage your renewable energy land listings and track performance on RenewMart." />
      </Helmet>
      
      <div className="min-h-screen bg-background flex">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <Header />
          
          <div className="p-6 space-y-6">
            <BreadcrumbNavigation items={breadcrumbItems} />
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {user?.first_name}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your renewable energy land portfolio
                </p>
              </div>
              <Button 
                onClick={() => setShowRegistrationModal(true)}
                className="flex items-center gap-2"
              >
                <Icon name="Plus" className="w-4 h-4" />
                Register New Land
              </Button>
            </div>

            {/* Metrics Section */}
            <LandMetrics metrics={metrics} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lands List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Your Land Listings</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Icon name="Filter" className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="ArrowUpDown" className="w-4 h-4 mr-2" />
                      Sort
                    </Button>
                  </div>
                </div>
                
                {lands.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border p-8 text-center">
                    <Icon name="MapPin" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No land listings yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by registering your first renewable energy land listing
                    </p>
                    <Button onClick={() => setShowRegistrationModal(true)}>
                      <Icon name="Plus" className="w-4 h-4 mr-2" />
                      Register Your First Land
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lands.map((land) => (
                      <LandCard 
                        key={land.land_id} 
                        land={land} 
                        onUpdate={fetchLandownerData}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Sidebar */}
              <div className="space-y-6">
                <RecentActivity />
                
                {/* Quick Actions */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowRegistrationModal(true)}
                    >
                      <Icon name="Plus" className="w-4 h-4 mr-2" />
                      Register New Land
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="FileText" className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="BarChart3" className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="MessageSquare" className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Land Registration Modal */}
      {showRegistrationModal && (
        <LandRegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleLandRegistered}
        />
      )}
    </>
  );
};

export default LandownerDashboard;