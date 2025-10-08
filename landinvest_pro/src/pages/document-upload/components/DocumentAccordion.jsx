import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const DocumentAccordion = ({ 
  sections, 
  uploadedFiles, 
  onFileUpload, 
  onFileRemove,
  expandedSections,
  onSectionToggle 
}) => {
  const [draggedOver, setDraggedOver] = useState(null);

  const handleDragOver = (e, sectionId) => {
    e?.preventDefault();
    setDraggedOver(sectionId);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = (e, sectionId) => {
    e?.preventDefault();
    setDraggedOver(null);
    const files = Array.from(e?.dataTransfer?.files);
    onFileUpload(sectionId, files);
  };

  const handleFileSelect = (e, sectionId) => {
    const files = Array.from(e?.target?.files);
    onFileUpload(sectionId, files);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'FileText';
      case 'jpg': case'jpeg': case'png':
        return 'Image';
      case 'doc': case'docx':
        return 'FileText';
      case 'xls': case'xlsx':
        return 'FileSpreadsheet';
      default:
        return 'File';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getSectionProgress = (sectionId) => {
    const section = sections?.find(s => s?.id === sectionId);
    const sectionFiles = uploadedFiles?.[sectionId] || [];
    const requiredCount = section?.requiredFiles || 1;
    const uploadedCount = sectionFiles?.length;
    return Math.min((uploadedCount / requiredCount) * 100, 100);
  };

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

  return (
    <div className="space-y-4">
      {sections?.map((section) => {
        const isExpanded = expandedSections?.includes(section?.id);
        const sectionFiles = uploadedFiles?.[section?.id] || [];
        const progress = getSectionProgress(section?.id);
        const status = getSectionStatus(section?.id);
        const isDraggedOver = draggedOver === section?.id;

        return (
          <div key={section?.id} className="bg-card border border-border rounded-lg shadow-elevation-1">
            {/* Accordion Header */}
            <button
              onClick={() => onSectionToggle(section?.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-smooth focus:outline-none focus:ring-2 focus:ring-ring rounded-t-lg"
            >
              <div className="flex items-center space-x-4 flex-1">
                <Icon 
                  name={getStatusIcon(status)} 
                  size={20} 
                  className={getStatusColor(status)}
                />
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    {section?.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    {section?.description}
                  </p>
                  {section?.required && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error mt-2">
                      Required
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-body font-medium text-sm text-foreground">
                      {sectionFiles?.length} / {section?.requiredFiles || 1} files
                    </div>
                    <div className="font-caption text-xs text-muted-foreground">
                      {Math.round(progress)}% complete
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        status === 'complete' ? 'bg-success' : 
                        status === 'partial' ? 'bg-warning' : 'bg-muted-foreground'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-muted-foreground ml-4"
              />
            </button>
            {/* Accordion Content */}
            {isExpanded && (
              <div className="px-6 pb-6 border-t border-border">
                {/* File Requirements */}
                <div className="mb-6">
                  <h4 className="font-body font-medium text-sm text-foreground mb-2">
                    File Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Accepted formats:</span>
                      <div className="mt-1">
                        {section?.acceptedFormats?.map((format, index) => (
                          <span key={format} className="inline-block bg-muted px-2 py-1 rounded text-xs mr-2 mb-1">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Max file size:</span>
                      <span className="ml-2 text-foreground">{section?.maxSize}</span>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                    ${isDraggedOver 
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
                    }
                  `}
                  onDragOver={(e) => handleDragOver(e, section?.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, section?.id)}
                >
                  <input
                    type="file"
                    id={`file-upload-${section?.id}`}
                    multiple
                    accept={section?.acceptedFormats?.map(f => `.${f}`)?.join(',')}
                    onChange={(e) => handleFileSelect(e, section?.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-colors
                      ${isDraggedOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                    `}>
                      <Icon name="Upload" size={24} />
                    </div>
                    
                    <div>
                      <h4 className="font-body font-medium text-foreground mb-2">
                        {isDraggedOver ? 'Drop files here' : 'Upload Documents'}
                      </h4>
                      <p className="font-body text-sm text-muted-foreground">
                        Drag and drop files here, or click to browse
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`file-upload-${section?.id}`)?.click()}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {sectionFiles?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-body font-medium text-sm text-foreground mb-4">
                      Uploaded Files ({sectionFiles?.length})
                    </h4>
                    <div className="space-y-3">
                      {sectionFiles?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3 flex-1">
                            <Icon 
                              name={getFileIcon(file?.name)} 
                              size={20} 
                              className="text-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-medium text-sm text-foreground truncate">
                                {file?.name}
                              </p>
                              <p className="font-caption text-xs text-muted-foreground">
                                {formatFileSize(file?.size)} • Uploaded {new Date()?.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Preview functionality */}}
                            >
                              <Icon name="Eye" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onFileRemove(section?.id, index)}
                              className="text-error hover:text-error hover:bg-error/10"
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentAccordion;