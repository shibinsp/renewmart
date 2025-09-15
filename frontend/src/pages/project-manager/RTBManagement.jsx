import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkflow, WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const RTBManagement = () => {
    const {
        workflows,
        loadWorkflows,
        getWorkflowsByState,
        updateWorkflowState
    } = useWorkflow();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRTBModal, setShowRTBModal] = useState(false);
    const [rtbData, setRtbData] = useState({
        project_name: '',
        start_date: '',
        estimated_completion: '',
        budget: '',
        team_lead: '',
        notes: ''
    });

    useEffect(() => {
        const fetchWorkflows = async () => {
            setLoading(true);
            await loadWorkflows();
            setLoading(false);
        };
        fetchWorkflows();
    }, [loadWorkflows]);

    // Get RTB ready projects
    const rtbProjects = getWorkflowsByState(WORKFLOW_STATES.READY_TO_BUILD);
    const inProgressProjects = getWorkflowsByState(WORKFLOW_STATES.IN_PROGRESS);

    const handleStartProject = async (workflowId) => {
        try {
            await updateWorkflowState(workflowId, WORKFLOW_STATES.IN_PROGRESS);
            // Refresh workflows
            await loadWorkflows();
        } catch (error) {
            console.error('Error starting project:', error);
        }
    };

    const handleCompleteProject = async (workflowId) => {
        try {
            await updateWorkflowState(workflowId, 'completed');
            // Refresh workflows
            await loadWorkflows();
        } catch (error) {
            console.error('Error completing project:', error);
        }
    };

    const handleRTBApproval = async () => {
        if (!selectedWorkflow) return;

        try {
            // Update workflow with RTB data
            await updateWorkflowState(selectedWorkflow.id, WORKFLOW_STATES.READY_TO_BUILD);

            setShowRTBModal(false);
            setSelectedWorkflow(null);
            setRtbData({
                project_name: '',
                start_date: '',
                estimated_completion: '',
                budget: '',
                team_lead: '',
                notes: ''
            });

            // Refresh workflows
            await loadWorkflows();
        } catch (error) {
            console.error('Error approving RTB:', error);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'RTB Management', icon: 'CheckSquare' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading RTB projects...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>RTB Management - RenewMart Project Manager</title>
                <meta name="description" content="Manage Ready to Build projects and project lifecycle" />
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
                                        <h1 className="text-3xl font-bold text-foreground">RTB Management</h1>
                                        <p className="text-muted-foreground mt-1">
                                            Manage Ready to Build projects and oversee project lifecycle
                                        </p>
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Icon name="CheckCircle" size={24} className="text-green-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">Ready to Build</p>
                                                    <p className="text-2xl font-bold text-foreground">{rtbProjects.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Icon name="Clock" size={24} className="text-orange-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                                    <p className="text-2xl font-bold text-foreground">{inProgressProjects.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-card border border-border rounded-lg p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Icon name="TrendingUp" size={24} className="text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                                                    <p className="text-2xl font-bold text-foreground">{rtbProjects.length + inProgressProjects.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RTB Ready Projects */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-foreground mb-4">Ready to Build Projects</h2>
                                        {rtbProjects.length === 0 ? (
                                            <div className="bg-card border border-border rounded-lg p-12 text-center">
                                                <Icon name="CheckCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold text-foreground mb-2">No RTB Projects</h3>
                                                <p className="text-muted-foreground">
                                                    No projects are currently ready to build.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {rtbProjects.map((project) => (
                                                    <div key={project.id} className="bg-card border border-border rounded-lg shadow-subtle hover:shadow-moderate transition-shadow">
                                                        <div className="p-6">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <h3 className="text-lg font-semibold text-foreground truncate">
                                                                    {project.title}
                                                                </h3>
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                    RTB Ready
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
                                                            </div>

                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStartProject(project.id)}
                                                                    className="flex-1"
                                                                >
                                                                    <Icon name="Play" size={14} className="mr-2" />
                                                                    Start Project
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setSelectedWorkflow(project);
                                                                        setShowDetailsModal(true);
                                                                    }}
                                                                >
                                                                    <Icon name="Eye" size={14} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* In Progress Projects */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-foreground mb-4">In Progress Projects</h2>
                                        {inProgressProjects.length === 0 ? (
                                            <div className="bg-card border border-border rounded-lg p-12 text-center">
                                                <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Projects</h3>
                                                <p className="text-muted-foreground">
                                                    No projects are currently in progress.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-card border border-border rounded-lg overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead className="bg-muted/50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Project Details
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Progress
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Started
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {inProgressProjects.map((project) => (
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
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <div className="w-full bg-muted rounded-full h-2 mr-2">
                                                                                <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                                                                            </div>
                                                                            <span className="text-sm text-muted-foreground">65%</span>
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
                                                                                onClick={() => handleCompleteProject(project.id)}
                                                                            >
                                                                                Complete
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
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
                            Project Details: {selectedWorkflow.title}
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
                                    <label className="block text-sm font-medium text-muted-foreground">Price</label>
                                    <p className="text-sm text-foreground">${selectedWorkflow.price_per_mwh}/MWh</p>
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

                            {selectedWorkflow.admin_notes && (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground">Notes</label>
                                    <p className="text-sm text-foreground">{selectedWorkflow.admin_notes}</p>
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
                            {selectedWorkflow.state === WORKFLOW_STATES.READY_TO_BUILD && (
                                <Button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowRTBModal(true);
                                    }}
                                    className="flex-1"
                                >
                                    Approve RTB
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RTB Approval Modal */}
            {showRTBModal && selectedWorkflow && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Approve Ready to Build
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={rtbData.project_name}
                                    onChange={(e) => setRtbData(prev => ({ ...prev, project_name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={rtbData.start_date}
                                        onChange={(e) => setRtbData(prev => ({ ...prev, start_date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Estimated Completion
                                    </label>
                                    <input
                                        type="date"
                                        value={rtbData.estimated_completion}
                                        onChange={(e) => setRtbData(prev => ({ ...prev, estimated_completion: e.target.value }))}
                                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Budget
                                </label>
                                <input
                                    type="number"
                                    value={rtbData.budget}
                                    onChange={(e) => setRtbData(prev => ({ ...prev, budget: e.target.value }))}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter budget"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Team Lead
                                </label>
                                <input
                                    type="text"
                                    value={rtbData.team_lead}
                                    onChange={(e) => setRtbData(prev => ({ ...prev, team_lead: e.target.value }))}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter team lead name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={rtbData.notes}
                                    onChange={(e) => setRtbData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Add any notes..."
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowRTBModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRTBApproval}
                                className="flex-1"
                            >
                                Approve RTB
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RTBManagement;
