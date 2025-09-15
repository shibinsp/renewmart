import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { debugUser } from '../../../utils/debugUser';
import ActivityFeed from './ActivityFeed';
import ProjectChart from './ProjectChart';
import RoleBasedQuickActions from './RoleBasedQuickActions';
import RoleBasedProjectsTable from './RoleBasedProjectsTable';
import UpcomingTasks from './UpcomingTasks';

const RoleBasedDashboard = () => {
    const { user } = useAuth();

    // Debug logging (remove in production)
    // debugUser(user);

    const hasRole = (role) => user?.roles?.includes(role);

    // Role-specific dashboard layouts
    const renderInvestorDashboard = () => (
        <div className="space-y-6">
            {/* Investment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Investment Portfolio</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Solar Projects</span>
                                <span className="text-sm font-medium text-foreground">$89.2M</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Wind Projects</span>
                                <span className="text-sm font-medium text-foreground">$36.2M</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Hydro Projects</span>
                                <span className="text-sm font-medium text-foreground">$0M</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <ActivityFeed />
                </div>
                <div className="lg:col-span-6">
                    <RoleBasedQuickActions />
                </div>
            </div>

            {/* Investment Opportunities */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    const renderLandownerDashboard = () => (
        <div className="space-y-6">
            {/* Property Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Property Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Listed Properties</span>
                                <span className="text-sm font-medium text-foreground">12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Under Review</span>
                                <span className="text-sm font-medium text-foreground">3</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Inquiries</span>
                                <span className="text-sm font-medium text-foreground">18</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <ActivityFeed />
                </div>
                <div className="lg:col-span-6">
                    <RoleBasedQuickActions />
                </div>
            </div>

            {/* Property Listings */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    const renderAdminDashboard = () => (
        <div className="space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">System Overview</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Users</span>
                                <span className="text-sm font-medium text-foreground">1,247</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Properties</span>
                                <span className="text-sm font-medium text-foreground">89</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">System Uptime</span>
                                <span className="text-sm font-medium text-success">99.2%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Admin Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Admin Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                                <div className="text-sm font-medium text-foreground">User Management</div>
                                <div className="text-xs text-muted-foreground">Manage users and roles</div>
                            </button>
                            <button className="p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                                <div className="text-sm font-medium text-foreground">System Reports</div>
                                <div className="text-xs text-muted-foreground">View platform analytics</div>
                            </button>
                            <button className="p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                                <div className="text-sm font-medium text-foreground">Content Review</div>
                                <div className="text-xs text-muted-foreground">Review properties</div>
                            </button>
                            <button className="p-3 text-left border border-border rounded-lg hover:bg-muted transition-colors">
                                <div className="text-sm font-medium text-foreground">Settings</div>
                                <div className="text-xs text-muted-foreground">Platform configuration</div>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-6">
                    <ActivityFeed />
                </div>
            </div>

            {/* System Data */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    const renderGovernanceLeadDashboard = () => (
        <div className="space-y-6">
            {/* Review Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Review Queue</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Reviews</span>
                                <span className="text-sm font-medium text-warning">15</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Approved Today</span>
                                <span className="text-sm font-medium text-success">8</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Rejected Today</span>
                                <span className="text-sm font-medium text-error">2</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Review Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <RoleBasedQuickActions />
                </div>
                <div className="lg:col-span-6">
                    <ActivityFeed />
                </div>
            </div>

            {/* Review Items */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    const renderSalesAdvisorDashboard = () => (
        <div className="space-y-6">
            {/* Sales Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Sales Pipeline</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Hot Leads</span>
                                <span className="text-sm font-medium text-warning">8</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">In Negotiation</span>
                                <span className="text-sm font-medium text-primary">5</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Closed This Month</span>
                                <span className="text-sm font-medium text-success">3</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Sales Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <RoleBasedQuickActions />
                </div>
                <div className="lg:col-span-6">
                    <ActivityFeed />
                </div>
            </div>

            {/* Sales Opportunities */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    const renderAnalystDashboard = () => (
        <div className="space-y-6">
            {/* Analysis Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Queue</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Pending Analysis</span>
                                <span className="text-sm font-medium text-warning">6</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Completed Today</span>
                                <span className="text-sm font-medium text-success">4</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                                <span className="text-sm font-medium text-success">98.5%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Analysis Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <RoleBasedQuickActions />
                </div>
                <div className="lg:col-span-6">
                    <ActivityFeed />
                </div>
            </div>

            {/* Analysis Results */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    const renderProjectManagerDashboard = () => (
        <div className="space-y-6">
            {/* Project Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="bg-card border border-border rounded-lg shadow-subtle p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Project Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Projects</span>
                                <span className="text-sm font-medium text-primary">24</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">On Schedule</span>
                                <span className="text-sm font-medium text-success">18</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">At Risk</span>
                                <span className="text-sm font-medium text-warning">6</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <ProjectChart />
                </div>
            </div>

            {/* Project Management Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6">
                    <RoleBasedQuickActions />
                </div>
                <div className="lg:col-span-6">
                    <UpcomingTasks />
                </div>
            </div>

            {/* Project List */}
            <div className="mb-8">
                <RoleBasedProjectsTable />
            </div>
        </div>
    );

    // Determine which dashboard to render based on user role
    const renderDashboard = () => {
        if (hasRole('investor')) {
            return renderInvestorDashboard();
        } else if (hasRole('landowner')) {
            return renderLandownerDashboard();
        } else if (hasRole('administrator')) {
            return renderAdminDashboard();
        } else if (hasRole('re_governance_lead')) {
            return renderGovernanceLeadDashboard();
        } else if (hasRole('re_sales_advisor')) {
            return renderSalesAdvisorDashboard();
        } else if (hasRole('re_analyst')) {
            return renderAnalystDashboard();
        } else if (hasRole('project_manager')) {
            return renderProjectManagerDashboard();
        } else {
            // Default dashboard
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4">
                            <ActivityFeed />
                        </div>
                        <div className="lg:col-span-8">
                            <ProjectChart />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6">
                            <RoleBasedQuickActions />
                        </div>
                        <div className="lg:col-span-6">
                            <UpcomingTasks />
                        </div>
                    </div>
                    <div className="mb-8">
                        <RoleBasedProjectsTable />
                    </div>
                </div>
            );
        }
    };

    return renderDashboard();
};

export default RoleBasedDashboard;
