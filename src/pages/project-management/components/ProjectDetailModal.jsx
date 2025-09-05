import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  if (!isOpen || !project) return null;

  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'timeline', label: 'Timeline', icon: 'Calendar' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare' },
    { id: 'team', label: 'Team', icon: 'Users' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'budget', label: 'Budget', icon: 'DollarSign' }
  ];

  const milestones = [
    { id: 1, title: 'Site Assessment Complete', date: '2024-12-15', status: 'completed', progress: 100 },
    { id: 2, title: 'Environmental Permits', date: '2025-01-15', status: 'in-progress', progress: 75 },
    { id: 3, title: 'Grid Connection Approval', date: '2025-02-28', status: 'pending', progress: 0 },
    { id: 4, title: 'Equipment Procurement', date: '2025-03-15', status: 'pending', progress: 0 },
    { id: 5, title: 'Construction Begin', date: '2025-04-01', status: 'pending', progress: 0 }
  ];

  const tasks = [
    { id: 1, title: 'Environmental Impact Assessment', assignee: 'Sarah Chen', status: 'completed', priority: 'high', dueDate: '2024-12-20' },
    { id: 2, title: 'Grid Interconnection Study', assignee: 'Michael Rodriguez', status: 'in-progress', priority: 'high', dueDate: '2025-01-10' },
    { id: 3, title: 'Equipment Vendor Selection', assignee: 'Emily Johnson', status: 'pending', priority: 'medium', dueDate: '2025-01-25' },
    { id: 4, title: 'Financial Model Update', assignee: 'David Kim', status: 'in-progress', priority: 'medium', dueDate: '2025-01-15' },
    { id: 5, title: 'Stakeholder Communication Plan', assignee: 'Lisa Anderson', status: 'pending', priority: 'low', dueDate: '2025-02-01' }
  ];

  const documents = [
    { id: 1, name: 'Environmental Impact Report.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2024-12-15', version: 'v2.1' },
    { id: 2, name: 'Site Survey Results.xlsx', type: 'Excel', size: '1.8 MB', uploadDate: '2024-12-10', version: 'v1.0' },
    { id: 3, name: 'Grid Connection Proposal.docx', type: 'Word', size: '856 KB', uploadDate: '2024-12-08', version: 'v1.3' },
    { id: 4, name: 'Financial Projections.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2024-12-05', version: 'v3.0' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10';
      case 'in-progress': return 'text-primary bg-primary/10';
      case 'pending': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatBudget = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Project Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="text-foreground">{project?.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="text-foreground">{project?.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technology:</span>
                <span className="text-foreground">Solar PV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="text-foreground">January 15, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Completion:</span>
                <span className="text-foreground">December 31, 2025</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Financial Overview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Budget:</span>
                <span className="text-foreground font-medium">{formatBudget(project?.budget?.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spent:</span>
                <span className="text-foreground">{formatBudget(project?.budget?.spent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="text-success font-medium">{formatBudget(project?.budget?.total - project?.budget?.spent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected ROI:</span>
                <span className="text-success font-medium">{project?.metrics?.roiForecast}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Project Description</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {`This ${project?.capacity} solar photovoltaic project is located in ${project?.location} and represents a significant investment in renewable energy infrastructure. The project includes comprehensive site development, grid interconnection, and long-term power purchase agreements with local utilities. Environmental assessments have been completed with positive outcomes, and all necessary permits are in progress.`}
        </p>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Project Milestones</h4>
      <div className="space-y-4">
        {milestones?.map((milestone, index) => (
          <div key={milestone?.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 ${
                milestone?.status === 'completed' ? 'bg-success border-success' :
                milestone?.status === 'in-progress'? 'bg-primary border-primary' : 'bg-card border-muted-foreground'
              }`} />
              {index < milestones?.length - 1 && (
                <div className="w-0.5 h-8 bg-border mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-foreground">{milestone?.title}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone?.status)}`}>
                  {milestone?.status?.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Due: {new Date(milestone.date)?.toLocaleDateString()}</span>
                <span>{milestone?.progress}% complete</span>
              </div>
              {milestone?.progress > 0 && (
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${milestone?.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Active Tasks</h4>
        <Button variant="outline" size="sm" iconName="Plus">
          Add Task
        </Button>
      </div>
      <div className="space-y-3">
        {tasks?.map((task) => (
          <div key={task?.id} className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h5 className="text-sm font-medium text-foreground">{task?.title}</h5>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                  {task?.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task?.status)}`}>
                  {task?.status?.replace('-', ' ')}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Assigned to: {task?.assignee}</span>
              <span>Due: {new Date(task.dueDate)?.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Team Members</h4>
        <Button variant="outline" size="sm" iconName="UserPlus">
          Add Member
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project?.team?.map((member) => (
          <div key={member?.id} className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                {member?.name?.split(' ')?.map(n => n?.[0])?.join('')}
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-medium text-foreground">{member?.name}</h5>
                <p className="text-xs text-muted-foreground">{member?.role}</p>
                <p className="text-xs text-muted-foreground">{member?.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Project Documents</h4>
        <Button variant="outline" size="sm" iconName="Upload">
          Upload Document
        </Button>
      </div>
      <div className="space-y-3">
        {documents?.map((doc) => (
          <div key={doc?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={16} className="text-primary" />
              <div>
                <h5 className="text-sm font-medium text-foreground">{doc?.name}</h5>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{doc?.type}</span>
                  <span>•</span>
                  <span>{doc?.size}</span>
                  <span>•</span>
                  <span>{doc?.version}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {new Date(doc.uploadDate)?.toLocaleDateString()}
              </span>
              <Button variant="ghost" size="sm" iconName="Download" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-success/10 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Budget</div>
          <div className="text-xl font-semibold text-foreground">{formatBudget(project?.budget?.total)}</div>
        </div>
        <div className="p-4 bg-warning/10 rounded-lg">
          <div className="text-sm text-muted-foreground">Spent</div>
          <div className="text-xl font-semibold text-foreground">{formatBudget(project?.budget?.spent)}</div>
        </div>
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="text-sm text-muted-foreground">Remaining</div>
          <div className="text-xl font-semibold text-foreground">{formatBudget(project?.budget?.total - project?.budget?.spent)}</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">Budget Breakdown</h4>
        <div className="space-y-3">
          {[
            { category: 'Equipment & Materials', allocated: 15000000, spent: 8500000 },
            { category: 'Labor & Installation', allocated: 8000000, spent: 4200000 },
            { category: 'Permits & Legal', allocated: 2000000, spent: 1800000 },
            { category: 'Grid Connection', allocated: 3000000, spent: 1500000 },
            { category: 'Contingency', allocated: 2000000, spent: 0 }
          ]?.map((item, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{item?.category}</span>
                <span className="text-sm text-muted-foreground">
                  {formatBudget(item?.spent)} / {formatBudget(item?.allocated)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(item?.spent / item?.allocated) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeDetailTab) {
      case 'overview': return renderOverview();
      case 'timeline': return renderTimeline();
      case 'tasks': return renderTasks();
      case 'team': return renderTeam();
      case 'documents': return renderDocuments();
      case 'budget': return renderBudget();
      default: return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-500 p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{project?.name}</h2>
            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
              <span>{project?.location}</span>
              <span>•</span>
              <span>{project?.capacity}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status)}`}>
                {project?.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {detailTabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveDetailTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-smooth ${
                  activeDetailTab === tab?.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" iconName="Edit">
            Edit Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;