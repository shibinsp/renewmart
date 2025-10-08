import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProgressSidebar = ({ 
  sections, 
  uploadedFiles, 
  overallProgress, 
  onSectionNavigate,
  onSaveDraft,
  onSubmitForReview,
  onPreviewSubmission,
  canSubmit,
  isSaving
}) => {
  const getSectionStatus = (sectionId) => {
    const section = sections?.find(s => s?.id === sectionId);
    const sectionFiles = uploadedFiles?.[sectionId] || [];
    const requiredCount = section?.requiredFiles || 1;
    
    if (sectionFiles?.length === 0) return 'empty';
    if (sectionFiles?.length < requiredCount) return 'partial';
    return 'complete';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return 'CheckCircle';
      case 'partial':
        return 'AlertCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'text-success';
      case 'partial':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const completedSections = sections?.filter(section => 
    getSectionStatus(section?.id) === 'complete'
  )?.length;

  const requiredSections = sections?.filter(section => section?.required)?.length;
  const completedRequiredSections = sections?.filter(section => 
    section?.required && getSectionStatus(section?.id) === 'complete'
  )?.length;

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 sticky top-24">
      {/* Progress Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Upload Progress
          </h3>
          <span className="font-body font-medium text-sm text-primary">
            {Math.round(overallProgress)}%
          </span>
        </div>
        
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="font-body font-semibold text-lg text-foreground">
              {completedSections}
            </div>
            <div className="font-caption text-xs text-muted-foreground">
              Total Complete
            </div>
          </div>
          <div>
            <div className="font-body font-semibold text-lg text-foreground">
              {completedRequiredSections}/{requiredSections}
            </div>
            <div className="font-caption text-xs text-muted-foreground">
              Required Complete
            </div>
          </div>
        </div>
      </div>
      {/* Section List */}
      <div className="p-6 border-b border-border max-h-96 overflow-y-auto">
        <h4 className="font-body font-medium text-sm text-foreground mb-4">
          Document Sections
        </h4>
        <div className="space-y-3">
          {sections?.map((section) => {
            const status = getSectionStatus(section?.id);
            const sectionFiles = uploadedFiles?.[section?.id] || [];
            
            return (
              <button
                key={section?.id}
                onClick={() => onSectionNavigate(section?.id)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth text-left focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Icon 
                  name={getStatusIcon(status)} 
                  size={16} 
                  className={getStatusColor(status)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-body font-medium text-sm text-foreground truncate">
                    {section?.title}
                  </div>
                  <div className="font-caption text-xs text-muted-foreground">
                    {sectionFiles?.length} / {section?.requiredFiles || 1} files
                    {section?.required && (
                      <span className="ml-2 text-error">*</span>
                    )}
                  </div>
                </div>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="p-6 space-y-3">
        <Button
          variant="outline"
          fullWidth
          onClick={onSaveDraft}
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
        >
          Save Draft
        </Button>
        
        <Button
          variant="secondary"
          fullWidth
          onClick={onPreviewSubmission}
          iconName="Eye"
          iconPosition="left"
        >
          Preview Submission
        </Button>
        
        <Button
          variant="default"
          fullWidth
          onClick={onSubmitForReview}
          disabled={!canSubmit}
          iconName="Send"
          iconPosition="left"
        >
          Submit for Review
        </Button>
        
        {!canSubmit && (
          <p className="font-caption text-xs text-muted-foreground text-center mt-2">
            Complete all required sections to submit
          </p>
        )}
      </div>
      {/* Auto-save Indicator */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
          <Icon name="Cloud" size={14} />
          <span>Auto-saved {new Date()?.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;