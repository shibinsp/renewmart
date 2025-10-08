import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowBreadcrumbs from '../../components/ui/WorkflowBreadcrumbs';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActions from '../../components/ui/QuickActions';
import DocumentAccordion from './components/DocumentAccordion';
import ProgressSidebar from './components/ProgressSidebar';
import ProjectDetailsForm from './components/ProjectDetailsForm';
import SubmissionPreview from './components/SubmissionPreview';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState(['project-details']);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [projectDetails, setProjectDetails] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [errors, setErrors] = useState({});

  const documentSections = [
    {
      id: 'land-valuation',
      title: 'Land Valuation Reports',
      description: 'Professional appraisal and valuation documents for the property',
      required: true,
      requiredFiles: 1,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSize: '10MB'
    },
    {
      id: 'ownership-documents',
      title: 'Ownership Documents',
      description: 'Legal documents proving ownership of the land parcel',
      required: true,
      requiredFiles: 2,
      acceptedFormats: ['pdf', 'jpg', 'png'],
      maxSize: '5MB'
    },
    {
      id: 'sale-contracts',
      title: 'Sale Contracts',
      description: 'Existing sale agreements or contract templates',
      required: false,
      requiredFiles: 1,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSize: '10MB'
    },
    {
      id: 'topographical-surveys',
      title: 'Topographical Surveys',
      description: 'Detailed land surveys and topographical maps',
      required: true,
      requiredFiles: 1,
      acceptedFormats: ['pdf', 'jpg', 'png', 'dwg'],
      maxSize: '20MB'
    },
    {
      id: 'grid-connectivity',
      title: 'Grid Connectivity Details',
      description: 'Electrical grid connection studies and feasibility reports',
      required: true,
      requiredFiles: 1,
      acceptedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
      maxSize: '15MB'
    },
    {
      id: 'financial-models',
      title: 'Financial Models',
      description: 'Economic analysis and financial projections for the project',
      required: false,
      requiredFiles: 1,
      acceptedFormats: ['xls', 'xlsx', 'pdf'],
      maxSize: '10MB'
    },
    {
      id: 'zoning-approvals',
      title: 'Zoning Approvals',
      description: 'Municipal zoning permits and land use approvals',
      required: true,
      requiredFiles: 1,
      acceptedFormats: ['pdf', 'jpg', 'png'],
      maxSize: '5MB'
    },
    {
      id: 'environmental-impact',
      title: 'Environmental Impact Assessments',
      description: 'Environmental studies and impact assessment reports',
      required: true,
      requiredFiles: 1,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSize: '25MB'
    },
    {
      id: 'government-nocs',
      title: 'Government NOCs',
      description: 'No Objection Certificates from relevant government authorities',
      required: true,
      requiredFiles: 2,
      acceptedFormats: ['pdf', 'jpg', 'png'],
      maxSize: '5MB'
    }
  ];

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const totalSections = documentSections?.length;
    let completedSections = 0;
    
    documentSections?.forEach(section => {
      const sectionFiles = uploadedFiles?.[section?.id] || [];
      const requiredCount = section?.requiredFiles || 1;
      if (sectionFiles?.length >= requiredCount) {
        completedSections++;
      }
    });
    
    return (completedSections / totalSections) * 100;
  };

  // Check if submission is possible
  const canSubmit = () => {
    const requiredSections = documentSections?.filter(section => section?.required);
    return requiredSections?.every(section => {
      const sectionFiles = uploadedFiles?.[section?.id] || [];
      return sectionFiles?.length >= (section?.requiredFiles || 1);
    }) && projectDetails?.detailsConfirmed;
  };

  // Handle file upload
  const handleFileUpload = (sectionId, files) => {
    const validFiles = files?.filter(file => {
      const section = documentSections?.find(s => s?.id === sectionId);
      const extension = file?.name?.split('.')?.pop()?.toLowerCase();
      const maxSizeBytes = parseInt(section?.maxSize) * 1024 * 1024;
      
      return section?.acceptedFormats?.includes(extension) && file?.size <= maxSizeBytes;
    });

    if (validFiles?.length !== files?.length) {
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Some files were rejected',
        message: 'Please check file format and size requirements',
        timestamp: new Date()
      });
    }

    setUploadedFiles(prev => ({
      ...prev,
      [sectionId]: [...(prev?.[sectionId] || []), ...validFiles]
    }));

    if (validFiles?.length > 0) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Files uploaded successfully',
        message: `${validFiles?.length} file(s) added to ${documentSections?.find(s => s?.id === sectionId)?.title}`,
        timestamp: new Date()
      });
    }
  };

  // Handle file removal
  const handleFileRemove = (sectionId, fileIndex) => {
    setUploadedFiles(prev => ({
      ...prev,
      [sectionId]: prev?.[sectionId]?.filter((_, index) => index !== fileIndex)
    }));
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => 
      prev?.includes(sectionId) 
        ? prev?.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle section navigation
  const handleSectionNavigate = (sectionId) => {
    if (!expandedSections?.includes(sectionId)) {
      setExpandedSections(prev => [...prev, sectionId]);
    }
    
    // Scroll to section
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSaving(false);
    addNotification({
      id: Date.now(),
      type: 'success',
      title: 'Draft saved successfully',
      message: 'Your progress has been saved and can be resumed later',
      timestamp: new Date()
    });
  };

  // Handle submit for review
  const handleSubmitForReview = () => {
    if (!canSubmit()) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Submission incomplete',
        message: 'Please complete all required sections before submitting',
        timestamp: new Date()
      });
      return;
    }
    
    setShowPreview(true);
  };

  // Handle preview submission
  const handlePreviewSubmission = () => {
    setShowPreview(true);
  };

  // Handle confirm submission
  const handleConfirmSubmission = () => {
    addNotification({
      id: Date.now(),
      type: 'success',
      title: 'Submission successful',
      message: 'Your documents have been submitted for administrative review',
      timestamp: new Date()
    });
    
    setShowPreview(false);
    
    // Navigate to dashboard after a delay
    setTimeout(() => {
      navigate('/landowner-dashboard');
    }, 2000);
  };

  // Add notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Handle project details change
  const handleProjectDetailsChange = (details) => {
    setProjectDetails(details);
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(uploadedFiles)?.length > 0 || Object.keys(projectDetails)?.length > 0) {
        // Auto-save logic here
        console.log('Auto-saving...');
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [uploadedFiles, projectDetails]);

  // Initialize with project details section expanded
  useEffect(() => {
    setExpandedSections(['project-details']);
  }, []);

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="landowner" />
      <WorkflowBreadcrumbs />
      <div className="max-w-9xl mx-auto px-4 lg:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Upload" size={24} color="white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground">
                Document Upload
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Submit your land documentation for renewable energy project review
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="font-body text-muted-foreground">
                Last saved: {new Date()?.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="FileCheck" size={16} className="text-muted-foreground" />
              <span className="font-body text-muted-foreground">
                {Math.round(overallProgress)}% complete
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Project Details Form */}
            <div id="section-project-details">
              <ProjectDetailsForm
                projectDetails={projectDetails}
                onProjectDetailsChange={handleProjectDetailsChange}
                errors={errors}
              />
            </div>

            {/* Document Upload Sections */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-secondary-foreground font-heading font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Document Upload
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Upload required documents for your renewable energy project
                  </p>
                </div>
              </div>

              <DocumentAccordion
                sections={documentSections}
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                expandedSections={expandedSections}
                onSectionToggle={handleSectionToggle}
              />
            </div>

            {/* Mobile Actions */}
            <div className="xl:hidden flex flex-col space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleSaveDraft}
                loading={isSaving}
                iconName="Save"
                iconPosition="left"
              >
                Save Draft
              </Button>
              
              <Button
                variant="secondary"
                fullWidth
                onClick={handlePreviewSubmission}
                iconName="Eye"
                iconPosition="left"
              >
                Preview Submission
              </Button>
              
              <Button
                variant="default"
                fullWidth
                onClick={handleSubmitForReview}
                disabled={!canSubmit()}
                iconName="Send"
                iconPosition="left"
              >
                Submit for Review
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block">
            <ProgressSidebar
              sections={documentSections}
              uploadedFiles={uploadedFiles}
              overallProgress={overallProgress}
              onSectionNavigate={handleSectionNavigate}
              onSaveDraft={handleSaveDraft}
              onSubmitForReview={handleSubmitForReview}
              onPreviewSubmission={handlePreviewSubmission}
              canSubmit={canSubmit()}
              isSaving={isSaving}
            />
          </div>
        </div>
      </div>
      {/* Submission Preview Modal */}
      {showPreview && (
        <SubmissionPreview
          projectDetails={projectDetails}
          uploadedFiles={uploadedFiles}
          sections={documentSections}
          onClose={() => setShowPreview(false)}
          onConfirmSubmission={handleConfirmSubmission}
        />
      )}
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
        userRole="landowner"
        currentContext="document-upload"
        onActionComplete={(action) => {
          if (action === 'save-draft') {
            handleSaveDraft();
          }
        }}
        position="bottom-right"
      />
    </div>
  );
};

export default DocumentUpload;