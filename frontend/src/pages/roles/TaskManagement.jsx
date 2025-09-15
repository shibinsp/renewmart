import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const TaskManagement = () => {
  const {
    tasks,
    loadTasks,
    updateTask,
    uploadSLADocument,
    createTicket
  } = useWorkflow();

  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [taskUpdate, setTaskUpdate] = useState({
    status: '',
    timeline: '',
    notes: ''
  });
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      // Load tasks for current user's role
      await loadTasks();
      setLoading(false);
    };
    fetchTasks();
  }, [loadTasks]);

  // Filter tasks by current user's role
  const userRole = user?.roles?.[0];
  const userTasks = tasks.filter(task => task.assignedRole === userRole);

  const getStatusColor = (status) => {
    const colors = {
      'assigned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-orange-100 text-orange-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'delayed': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'pending': 'Pending',
      'delayed': 'Delayed',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'on_hold': 'On Hold'
    };
    return labels[status] || status;
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      await updateTask(selectedTask.id, {
        status: taskUpdate.status,
        timeline: taskUpdate.timeline,
        notes: taskUpdate.notes,
        updated_at: new Date().toISOString()
      });

      setShowUpdateModal(false);
      setSelectedTask(null);
      setTaskUpdate({ status: '', timeline: '', notes: '' });

      // Refresh tasks
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!selectedTask) return;

    try {
      await createTicket({
        ...ticketData,
        taskId: selectedTask.id,
        workflowId: selectedTask.workflowId,
        fromRole: userRole,
        toRole: 'administrator'
      });

      setShowTicketModal(false);
      setSelectedTask(null);
      setTicketData({ subject: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleUploadSLA = async () => {
    if (!selectedTask || !uploadFile) return;

    try {
      await uploadSLADocument(selectedTask.workflowId, uploadFile, selectedTask.id);

      setShowUploadModal(false);
      setSelectedTask(null);
      setUploadFile(null);
    } catch (error) {
      console.error('Error uploading SLA:', error);
    }
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setTaskUpdate({
      status: task.status,
      timeline: task.timeline || '',
      notes: task.notes || ''
    });
    setShowUpdateModal(true);
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Task Management', icon: 'CheckSquare' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Task Management - RenewMart</title>
        <meta name="description" content="Manage your assigned tasks and update progress" />
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
                    <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
                    <p className="text-muted-foreground mt-1">
                      Manage your assigned tasks, update progress, and upload SLA documents
                    </p>
                  </div>

                  {/* Tasks Table */}
                  {userTasks.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                      <Icon name="CheckSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Tasks Assigned</h3>
                      <p className="text-muted-foreground">
                        You don't have any tasks assigned at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Task Details
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Timeline
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Assigned
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {userTasks.map((task) => (
                              <tr key={task.id} className="hover:bg-muted/25">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-foreground">
                                      {task.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {task.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Workflow: {task.workflowTitle}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                    {getStatusLabel(task.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                  {task.timeline || 'Not specified'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                  {new Date(task.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => openUpdateModal(task)}
                                    >
                                      Update
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setShowTicketModal(true);
                                      }}
                                    >
                                      Ticket
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setShowUploadModal(true);
                                      }}
                                    >
                                      Upload SLA
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
                  {userTasks.length > 0 && (
                    <div className="mt-8 bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Task Summary</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{userTasks.length}</div>
                          <div className="text-sm text-muted-foreground">Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {userTasks.filter(t => t.status === 'in_progress').length}
                          </div>
                          <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {userTasks.filter(t => t.status === 'completed').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {userTasks.filter(t => t.status === 'assigned').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Assigned</div>
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

      {/* Update Task Modal */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Update Task: {selectedTask.title}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={taskUpdate.status}
                  onChange={(e) => setTaskUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="delayed">Delayed</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Timeline
                </label>
                <Input
                  type="text"
                  value={taskUpdate.timeline}
                  onChange={(e) => setTaskUpdate(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 2-3 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  value={taskUpdate.notes}
                  onChange={(e) => setTaskUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add any notes or updates..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUpdateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTask}
                className="flex-1"
              >
                Update Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Create Ticket
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  value={ticketData.subject}
                  onChange={(e) => setTicketData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={ticketData.description}
                  onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Detailed description of the issue or request..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <select
                  value={ticketData.priority}
                  onChange={(e) => setTicketData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTicketModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTicket}
                className="flex-1"
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload SLA Modal */}
      {showUploadModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Upload SLA Document
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSLA}
                disabled={!uploadFile}
                className="flex-1"
              >
                Upload SLA
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskManagement;
