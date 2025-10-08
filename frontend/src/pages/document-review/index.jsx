import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowBreadcrumbs from '../../components/ui/WorkflowBreadcrumbs';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActions from '../../components/ui/QuickActions';
import DocumentViewer from './components/DocumentViewer';
import ReviewPanel from './components/ReviewPanel';
import TaskDetails from './components/TaskDetails';
import CollaborationTools from './components/CollaborationTools';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DocumentReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reviewerRole, setReviewerRole] = useState('analyst');
  const [activeTab, setActiveTab] = useState('review');
  const [annotations, setAnnotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock reviewer roles for demonstration
  const reviewerRoles = [
    { id: 'sales_advisor', label: 'RE Sales Advisor', icon: 'TrendingUp' },
    { id: 'analyst', label: 'RE Analyst', icon: 'Calculator' },
    { id: 'governance_lead', label: 'RE Governance Lead', icon: 'Shield' }
  ];

  const tabs = [
    { id: 'review', label: 'Review', icon: 'FileCheck' },
    { id: 'task', label: 'Task Details', icon: 'Clock' },
    { id: 'collaboration', label: 'Collaboration', icon: 'Users' }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Mock notifications
    setNotifications([
      {
        id: 'notif-1',
        type: 'info',
        title: 'New Document Assigned',
        message: 'Land ownership certificate requires your review',
        timestamp: new Date()?.toISOString()
      }
    ]);

    return () => clearTimeout(timer);
  }, []);

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleAddAnnotation = (annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  const handleDeleteAnnotation = (annotationId) => {
    setAnnotations(prev => prev?.filter(ann => ann?.id !== annotationId));
  };

  const handleReviewAction = (action, data) => {
    const actionMessages = {
      approve: 'Document approved successfully',
      reject: 'Document rejected with comments',
      clarification: 'Clarification requested from landowner',
      save: 'Review progress saved'
    };

    setNotifications(prev => [...prev, {
      id: `notif-${Date.now()}`,
      type: action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'info',
      title: 'Review Action Completed',
      message: actionMessages?.[action],
      timestamp: new Date()?.toISOString()
    }]);

    if (action === 'approve' || action === 'reject') {
      // Simulate navigation to next task or dashboard
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'approve': handleReviewAction('approve', {});
        break;
      case 'request-changes': handleReviewAction('clarification', {});
        break;
      case 'reject': handleReviewAction('reject', {});
        break;
      default:
        console.log('Quick action:', actionId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="admin" />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">Loading document review...</p>
              <p className="text-sm text-muted-foreground">Preparing your review workspace</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="admin" />
      <WorkflowBreadcrumbs />
      <div className="pt-16">
        <div className="max-w-9xl mx-auto p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  Document Review
                </h1>
                <p className="text-muted-foreground">
                  Review and evaluate land documentation for renewable energy projects
                </p>
              </div>
              
              {/* Reviewer Role Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">Role:</span>
                <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                  {reviewerRoles?.map((role) => (
                    <button
                      key={role?.id}
                      onClick={() => setReviewerRole(role?.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                        reviewerRole === role?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background'
                      }`}
                    >
                      <Icon name={role?.icon} size={16} />
                      <span className="hidden sm:inline">{role?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Document Viewer - Takes up 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <DocumentViewer
                selectedDocument={selectedDocument}
                onDocumentSelect={handleDocumentSelect}
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            </div>

            {/* Right Panel - Takes up 1 column on xl screens */}
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex border-b border-border">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-smooth ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      <span className="hidden sm:inline">{tab?.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="h-96 lg:h-[600px] overflow-hidden">
                  {activeTab === 'review' && (
                    <ReviewPanel
                      reviewerRole={reviewerRole}
                      documentCategory="ownership"
                      onApprove={(data) => handleReviewAction('approve', data)}
                      onReject={(data) => handleReviewAction('reject', data)}
                      onRequestClarification={(data) => handleReviewAction('clarification', data)}
                      onSaveProgress={(data) => handleReviewAction('save', data)}
                    />
                  )}
                  
                  {activeTab === 'task' && (
                    <div className="p-4 h-full overflow-y-auto">
                      <TaskDetails />
                    </div>
                  )}
                  
                  {activeTab === 'collaboration' && (
                    <div className="p-4 h-full overflow-y-auto">
                      <CollaborationTools
                        onAddComment={(comment) => console.log('Add comment:', comment)}
                        onAssignReviewer={(reviewerId) => console.log('Assign reviewer:', reviewerId)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-6 bg-card border border-border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Last updated: {new Date()?.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="User" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Reviewer: {reviewerRoles?.find(r => r?.id === reviewerRole)?.label}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin-dashboard')}
                >
                  <Icon name="ArrowLeft" size={16} />
                  Back to Dashboard
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleReviewAction('save', {})}
                >
                  <Icon name="Save" size={16} />
                  Save Progress
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        currentContext="document-review"
        onActionComplete={handleQuickAction}
        position="bottom-right"
      />
    </div>
  );
};

export default DocumentReview;