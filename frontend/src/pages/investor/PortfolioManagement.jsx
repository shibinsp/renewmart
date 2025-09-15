import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkflow, WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const PortfolioManagement = () => {
    const {
        workflows,
        loadWorkflows,
        getWorkflowsByState
    } = useWorkflow();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const fetchWorkflows = async () => {
            setLoading(true);
            await loadWorkflows();
            setLoading(false);
        };
        fetchWorkflows();
    }, [loadWorkflows]);

    // Get investor's interested projects
    const interestedProjects = getWorkflowsByState(WORKFLOW_STATES.INTEREST_REQUEST);
    const acceptedProjects = getWorkflowsByState(WORKFLOW_STATES.INTEREST_ACCEPTED);
    const rtbProjects = getWorkflowsByState(WORKFLOW_STATES.READY_TO_BUILD);

    // Calculate portfolio metrics
    const totalInvestments = acceptedProjects.length + rtbProjects.length;
    const totalCapacity = [...acceptedProjects, ...rtbProjects].reduce((sum, project) => sum + (project.capacity_mw || 0), 0);
    const totalValue = [...acceptedProjects, ...rtbProjects].reduce((sum, project) => {
        const annualRevenue = (project.capacity_mw || 0) * (project.price_per_mwh || 0) * 8760; // 8760 hours in a year
        const contractValue = annualRevenue * (project.contract_term_years || 0);
        return sum + contractValue;
    }, 0);

    const getStatusColor = (status) => {
        const colors = {
            [WORKFLOW_STATES.INTEREST_REQUEST]: 'bg-blue-100 text-blue-800',
            [WORKFLOW_STATES.INTEREST_ACCEPTED]: 'bg-green-100 text-green-800',
            [WORKFLOW_STATES.READY_TO_BUILD]: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            [WORKFLOW_STATES.INTEREST_REQUEST]: 'Interest Sent',
            [WORKFLOW_STATES.INTEREST_ACCEPTED]: 'Interest Accepted',
            [WORKFLOW_STATES.READY_TO_BUILD]: 'Ready to Build'
        };
        return labels[status] || status;
    };

    const breadcrumbs = [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'My Portfolio', icon: 'Briefcase' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Portfolio - RenewMart Investor</title>
                <meta name="description" content="Manage your renewable energy investment portfolio" />
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
                                        <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
                                        <p className="text-muted-foreground mt-1">
                                            Track your renewable energy investments and opportunities
                                        </p>
                                    </div>

                                    {/* Portfolio Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Icon name="Briefcase" size={24} className="text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
                                                    <p className="text-2xl font-bold text-foreground">{totalInvestments}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Icon name="Zap" size={24} className="text-green-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                                                    <p className="text-2xl font-bold text-foreground">{totalCapacity.toFixed(1)} MW</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Icon name="DollarSign" size={24} className="text-purple-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                                                    <p className="text-2xl font-bold text-foreground">
                                                        ${(totalValue / 1000000).toFixed(1)}M
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Icon name="TrendingUp" size={24} className="text-orange-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">Pending Interest</p>
                                                    <p className="text-2xl font-bold text-foreground">{interestedProjects.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Investments */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-foreground mb-4">Active Investments</h2>
                                        {[...acceptedProjects, ...rtbProjects].length === 0 ? (
                                            <div className="bg-card border border-border rounded-lg p-12 text-center">
                                                <Icon name="Briefcase" size={48} className="mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Investments</h3>
                                                <p className="text-muted-foreground mb-6">
                                                    You don't have any active investments yet. Browse properties to find investment opportunities.
                                                </p>
                                                <Button onClick={() => window.location.href = '/investor/browse'}>
                                                    <Icon name="Search" size={16} className="mr-2" />
                                                    Browse Properties
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {[...acceptedProjects, ...rtbProjects].map((project) => (
                                                    <div key={project.id} className="bg-card border border-border rounded-lg shadow-subtle hover:shadow-moderate transition-shadow">
                                                        <div className="p-6">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <h3 className="text-lg font-semibold text-foreground truncate">
                                                                    {project.title}
                                                                </h3>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.state)}`}>
                                                                    {getStatusLabel(project.state)}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                                                <div className="flex items-center">
                                                                    <Icon name="MapPin" size={14} className="mr-2" />
                                                                    {project.location_text}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Icon name="Zap" size={14} className="mr-2" />
                                                                    {project.capacity_mw} MW • {project.energy_key}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Icon name="DollarSign" size={14} className="mr-2" />
                                                                    ${project.price_per_mwh}/MWh
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Icon name="Calendar" size={14} className="mr-2" />
                                                                    {project.contract_term_years} years
                                                                </div>
                                                            </div>

                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedWorkflow(project);
                                                                        setShowDetailsModal(true);
                                                                    }}
                                                                    className="flex-1"
                                                                >
                                                                    <Icon name="Eye" size={14} className="mr-2" />
                                                                    View Details
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        // Navigate to project management or tracking
                                                                        console.log('Track project:', project.id);
                                                                    }}
                                                                    className="flex-1"
                                                                >
                                                                    <Icon name="BarChart3" size={14} className="mr-2" />
                                                                    Track
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pending Interest Requests */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-foreground mb-4">Pending Interest Requests</h2>
                                        {interestedProjects.length === 0 ? (
                                            <div className="bg-card border border-border rounded-lg p-12 text-center">
                                                <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Requests</h3>
                                                <p className="text-muted-foreground">
                                                    You don't have any pending interest requests.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-card border border-border rounded-lg overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-muted/50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Property Details
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Investment Value
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Requested
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {interestedProjects.map((project) => {
                                                                const annualRevenue = (project.capacity_mw || 0) * (project.price_per_mwh || 0) * 8760;
                                                                const contractValue = annualRevenue * (project.contract_term_years || 0);

                                                                return (
                                                                    <tr key={project.id} className="hover:bg-muted/25">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div>
                                                                                <div className="text-sm font-medium text-foreground">
                                                                                    {project.title}
                                                                                </div>
                                                                                <div className="text-sm text-muted-foreground flex items-center">
                                                                                    <Icon name="MapPin" size={14} className="mr-1" />
                                                                                    {project.location_text}
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    {project.capacity_mw} MW • {project.energy_key}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                                            <div>${(contractValue / 1000000).toFixed(1)}M</div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                {project.contract_term_years} years
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                            {new Date(project.updated_at).toLocaleDateString()}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                            <div className="flex space-x-2">
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => {
                                                                                        setSelectedWorkflow(project);
                                                                                        setShowDetailsModal(true);
                                                                                    }}
                                                                                >
                                                                                    View
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => {
                                                                                        // Cancel interest request
                                                                                        console.log('Cancel interest:', project.id);
                                                                                    }}
                                                                                >
                                                                                    Cancel
                                                                                </Button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Project Details Modal */}
            {showDetailsModal && selectedWorkflow && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Investment Details: {selectedWorkflow.title}
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Location</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.location_text}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Capacity</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.capacity_mw} MW</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Energy Type</label>
                                    <p className="text-sm text-foreground capitalize">{selectedWorkflow.energy_key}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Price per MWh</label>
                                    <p className="text-sm text-foreground">${selectedWorkflow.price_per_mwh}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Area</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.area_acres} acres</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Contract Term</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.contract_term_years} years</p>
                                </div>
                            </div>

                            {/* Investment Calculation */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-foreground mb-2">Investment Analysis</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Annual Revenue:</span>
                                        <span className="ml-2 font-medium text-foreground">
                                            ${((selectedWorkflow.capacity_mw || 0) * (selectedWorkflow.price_per_mwh || 0) * 8760 / 1000000).toFixed(1)}M
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Total Contract Value:</span>
                                        <span className="ml-2 font-medium text-foreground">
                                            ${((selectedWorkflow.capacity_mw || 0) * (selectedWorkflow.price_per_mwh || 0) * 8760 * (selectedWorkflow.contract_term_years || 0) / 1000000).toFixed(1)}M
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedWorkflow.timeline_text && (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Timeline</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.timeline_text}</p>
                                </div>
                            )}

                            {selectedWorkflow.developer_name && (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Developer</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.developer_name}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowDetailsModal(false)}
                                className="flex-1"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    // Navigate to project tracking
                                    console.log('Track project:', selectedWorkflow.id);
                                    setShowDetailsModal(false);
                                }}
                                className="flex-1"
                            >
                                Track Project
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PortfolioManagement;
