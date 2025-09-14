import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkflow, WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const WorkflowManagement = () => {
  const { 
    workflows, 
    loadWorkflows, 
    getWorkflowsByState, 
    updateWorkflowState,
    canPerformWorkflowAction 
  } = useWorkflow();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showTaskAssignment, setShowTaskAssignment] = useState(false);
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

  const handleVerifyWorkflow = async (workflowId) => {
    try {
      await updateWorkflowState(workflowId, WORKFLOW_STATES.VERIFIED_BY_ADMIN);
    } catch (error) {
      console.error('Error verifying workflow:', error);
    }
  };

  const handleAssignTasks = async (workflowId) => {
    try {
      await updateWorkflowState(workflowId, WORKFLOW_STATES.TASKS_ASSIGNED);
      setShowTaskAssignment(true);
      setSelectedWorkflow(workflows.find(w => w.id === workflowId));
    } catch (error) {
      console.error('Error assigning tasks:', error);
    }
  };

  const handleApproveRTB = async (workflowId) => {
    try {
      await updateWorkflowState(workflowId, WORKFLOW_STATES.READY_TO_BUILD);
    } catch (error) {
      console.error('Error approving RTB:', error);
    }
  };

  const filteredWorkflows = selectedState === 'all' 
    ? workflows 
    : getWorkflowsByState(selectedState);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Workflow Management', icon: 'Settings' }
  ];

  const stateOptions = [
    { value: 'all', label: 'All Workflows' },
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
          <p className="text-muted-foreground">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Workflow Management - RenewMart Admin</title>
        <meta name="description" content="Manage site registration workflows and task assignments" />
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
                    <h1 className="text-3xl font-bold text-foreground">Workflow Management</h1>
                    <p className="text-muted-foreground mt-1">
                      Manage site registration workflows, verify forms, and assign tasks to roles
                    </p>
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

                  {/* Workflows Table */}
                  {filteredWorkflows.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Workflows Found</h3>
                      <p className="text-muted-foreground">
                        {selectedState === 'all' 
                          ? "No workflows have been submitted yet."
                          : `No workflows found with status "${getStateLabel(selectedState)}".`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Site Details
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Capacity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Submitted
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredWorkflows.map((workflow) => (
                              <tr key={workflow.id} className="hover:bg-muted/25">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-foreground">
                                      {workflow.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center">
                                      <Icon name="MapPin" size={14} className="mr-1" />
                                      {workflow.location_text}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {workflow.area_acres} acres • {workflow.energy_key}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(workflow.state)}`}>
                                    {getStateLabel(workflow.state)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                  {workflow.capacity_mw} MW
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {new Date(workflow.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    {workflow.state === WORKFLOW_STATES.SUBMITTED && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleVerifyWorkflow(workflow.id)}
                                      >
                                        Verify
                                      </Button>
                                    )}
                                    {workflow.state === WORKFLOW_STATES.VERIFIED_BY_ADMIN && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAssignTasks(workflow.id)}
                                      >
                                        Assign Tasks
                                      </Button>
                                    )}
                                    {workflow.state === WORKFLOW_STATES.IN_PROGRESS && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedWorkflow(workflow)}
                                      >
                                        View Progress
                                      </Button>
                                    )}
                                    {workflow.state === WORKFLOW_STATES.INTEREST_ACCEPTED && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleApproveRTB(workflow.id)}
                                      >
                                        Approve RTB
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedWorkflow(workflow)}
                                    >
                                      Details
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

                  {/* Summary Stats */}
                  {workflows.length > 0 && (
                    <div className="mt-8 bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Workflow Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{workflows.length}</div>
                          <div className="text-sm text-muted-foreground">Total Workflows</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {getWorkflowsByState(WORKFLOW_STATES.SUBMITTED).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Pending Review</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {getWorkflowsByState(WORKFLOW_STATES.IN_PROGRESS).length}
                          </div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {getWorkflowsByState(WORKFLOW_STATES.READY_TO_BUILD).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Ready to Build</div>
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

export default WorkflowManagement;
