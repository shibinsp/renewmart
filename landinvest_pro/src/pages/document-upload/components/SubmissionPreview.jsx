import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubmissionPreview = ({ 
  projectDetails, 
  uploadedFiles, 
  sections, 
  onClose, 
  onConfirmSubmission 
}) => {
  const getTotalFiles = () => {
    return Object.values(uploadedFiles)?.reduce((total, files) => total + files?.length, 0);
  };

  const getCompletedSections = () => {
    return sections?.filter(section => {
      const sectionFiles = uploadedFiles?.[section?.id] || [];
      const requiredCount = section?.requiredFiles || 1;
      return sectionFiles?.length >= requiredCount;
    })?.length;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getTotalFileSize = () => {
    let totalSize = 0;
    Object.values(uploadedFiles)?.forEach(files => {
      files?.forEach(file => {
        totalSize += file?.size;
      });
    });
    return formatFileSize(totalSize);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-heading font-semibold text-xl text-foreground">
              Submission Preview
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Review your project details and documents before submission
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Project Summary */}
          <div className="mb-8">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Project Summary
            </h3>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Project Name
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.projectName || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Location
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Project Type
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.projectType || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Capacity
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.capacity ? `${projectDetails?.capacity} MW` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Price per MWh
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.pricePerMWh ? `$${projectDetails?.pricePerMWh}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Timeline
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.timeline || 'Not specified'}
                  </p>
                </div>
              </div>
              {projectDetails?.description && (
                <div className="mt-6">
                  <h4 className="font-body font-medium text-sm text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p className="font-body text-foreground">
                    {projectDetails?.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Summary */}
          <div className="mb-8">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Document Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                <div className="font-heading font-bold text-2xl text-success mb-1">
                  {getCompletedSections()}
                </div>
                <div className="font-body text-sm text-success">
                  Sections Complete
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <div className="font-heading font-bold text-2xl text-primary mb-1">
                  {getTotalFiles()}
                </div>
                <div className="font-body text-sm text-primary">
                  Total Files
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                <div className="font-heading font-bold text-2xl text-accent mb-1">
                  {getTotalFileSize()}
                </div>
                <div className="font-body text-sm text-accent">
                  Total Size
                </div>
              </div>
            </div>

            {/* Section Details */}
            <div className="space-y-4">
              {sections?.map((section) => {
                const sectionFiles = uploadedFiles?.[section?.id] || [];
                const isComplete = sectionFiles?.length >= (section?.requiredFiles || 1);
                
                return (
                  <div key={section?.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Icon 
                          name={isComplete ? "CheckCircle" : "AlertCircle"} 
                          size={20} 
                          className={isComplete ? "text-success" : "text-warning"}
                        />
                        <h4 className="font-body font-medium text-foreground">
                          {section?.title}
                        </h4>
                        {section?.required && (
                          <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <span className="font-body text-sm text-muted-foreground">
                        {sectionFiles?.length} / {section?.requiredFiles || 1} files
                      </span>
                    </div>
                    {sectionFiles?.length > 0 && (
                      <div className="space-y-2">
                        {sectionFiles?.map((file, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <Icon name="File" size={16} className="text-muted-foreground" />
                            <span className="font-body text-foreground flex-1 truncate">
                              {file?.name}
                            </span>
                            <span className="font-caption text-muted-foreground">
                              {formatFileSize(file?.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <div>
                <h4 className="font-body font-medium text-foreground mb-2">
                  Before You Submit
                </h4>
                <ul className="font-body text-sm text-muted-foreground space-y-1">
                  <li>• Your submission will be reviewed by our administrative team</li>
                  <li>• You will receive email notifications about the review progress</li>
                  <li>• Additional documents may be requested during the review process</li>
                  <li>• The review process typically takes 5-10 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Back to Edit
          </Button>
          <Button
            variant="default"
            onClick={onConfirmSubmission}
            iconName="Send"
            iconPosition="left"
          >
            Confirm Submission
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPreview;