import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadArea = ({ isVisible, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files)?.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file?.name,
      size: formatFileSize(file?.size),
      type: file?.type,
      progress: 0,
      status: 'pending', // pending, uploading, completed, error
      error: null
    }));
    
    setUploadQueue(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const removeFile = (fileId) => {
    setUploadQueue(prev => prev?.filter(file => file?.id !== fileId));
  };

  const startUpload = async () => {
    setIsUploading(true);
    
    for (const fileItem of uploadQueue) {
      if (fileItem?.status === 'pending') {
        // Update status to uploading
        setUploadQueue(prev => prev?.map(item => 
          item?.id === fileItem?.id 
            ? { ...item, status: 'uploading' }
            : item
        ));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadQueue(prev => prev?.map(item => 
            item?.id === fileItem?.id 
              ? { ...item, progress }
              : item
          ));
        }

        // Mark as completed
        setUploadQueue(prev => prev?.map(item => 
          item?.id === fileItem?.id 
            ? { ...item, status: 'completed', progress: 100 }
            : item
        ));
      }
    }
    
    setIsUploading(false);
    
    // Call onUpload callback
    if (onUpload) {
      onUpload(uploadQueue);
    }
    
    // Auto-close after successful upload
    setTimeout(() => {
      onClose();
      setUploadQueue([]);
    }, 2000);
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return 'Image';
    if (type?.includes('pdf')) return 'FileText';
    if (type?.includes('word')) return 'FileText';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return 'FileSpreadsheet';
    return 'File';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'uploading': return 'Upload';
      case 'completed': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-muted-foreground';
      case 'uploading': return 'text-primary';
      case 'completed': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-300 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upload Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add files to your document library
            </p>
          </div>
          <Button variant="ghost" size="icon" iconName="X" onClick={onClose} />
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
              dragActive 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, Word, Excel, Images and more
            </p>
            <Button
              variant="outline"
              iconName="FolderOpen"
              onClick={() => fileInputRef?.current?.click()}
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
            />
          </div>
        </div>

        {/* Upload Queue */}
        {uploadQueue?.length > 0 && (
          <div className="flex-1 overflow-auto border-t border-border">
            <div className="p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">
                Upload Queue ({uploadQueue?.length} files)
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadQueue?.map((fileItem) => (
                  <div key={fileItem?.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Icon 
                      name={getFileIcon(fileItem?.type)} 
                      size={16} 
                      className="text-primary flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {fileItem?.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Icon 
                            name={getStatusIcon(fileItem?.status)} 
                            size={14} 
                            className={`${getStatusColor(fileItem?.status)} ${
                              fileItem?.status === 'uploading' ? 'animate-spin' : ''
                            }`}
                          />
                          {fileItem?.status !== 'completed' && (
                            <button
                              onClick={() => removeFile(fileItem?.id)}
                              className="text-muted-foreground hover:text-error transition-smooth"
                            >
                              <Icon name="X" size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{fileItem?.size}</span>
                        {fileItem?.status === 'uploading' && (
                          <span className="text-xs text-primary">{fileItem?.progress}%</span>
                        )}
                      </div>
                      {fileItem?.status === 'uploading' && (
                        <div className="w-full bg-muted-foreground/20 rounded-full h-1 mt-2">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem?.progress}%` }}
                          />
                        </div>
                      )}
                      {fileItem?.error && (
                        <p className="text-xs text-error mt-1">{fileItem?.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {uploadQueue?.length > 0 && (
              <span>
                {uploadQueue?.filter(f => f?.status === 'completed')?.length} of {uploadQueue?.length} files uploaded
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              iconName="Upload"
              onClick={startUpload}
              disabled={uploadQueue?.length === 0 || isUploading}
              loading={isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${uploadQueue?.length} Files`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;