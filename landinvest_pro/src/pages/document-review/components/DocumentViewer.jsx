import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const DocumentViewer = ({ 
  documents = [], 
  selectedDocument = null, 
  onDocumentSelect = () => {},
  annotations = [],
  onAddAnnotation = () => {},
  onDeleteAnnotation = () => {}
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [annotationPosition, setAnnotationPosition] = useState(null);
  const viewerRef = useRef(null);

  const documentCategories = [
    { id: 'ownership', label: 'Ownership Documents', icon: 'FileText', count: 3 },
    { id: 'valuation', label: 'Land Valuation Reports', icon: 'TrendingUp', count: 2 },
    { id: 'survey', label: 'Topographical Surveys', icon: 'Map', count: 4 },
    { id: 'grid', label: 'Grid Connectivity', icon: 'Zap', count: 2 },
    { id: 'financial', label: 'Financial Models', icon: 'Calculator', count: 3 },
    { id: 'zoning', label: 'Zoning Approvals', icon: 'Building', count: 1 },
    { id: 'environmental', label: 'Environmental Impact', icon: 'Leaf', count: 2 },
    { id: 'government', label: 'Government NOCs', icon: 'Shield', count: 3 }
  ];

  const mockDocuments = [
    {
      id: 'doc-1',
      name: 'Land_Ownership_Certificate.pdf',
      category: 'ownership',
      size: '2.4 MB',
      uploadDate: '2025-01-10',
      status: 'pending',
      type: 'pdf',
      url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=600&fit=crop'
    },
    {
      id: 'doc-2',
      name: 'Property_Valuation_Report.pdf',
      category: 'valuation',
      size: '5.1 MB',
      uploadDate: '2025-01-09',
      status: 'reviewed',
      type: 'pdf',
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop'
    },
    {
      id: 'doc-3',
      name: 'Topographical_Survey_Map.jpg',
      category: 'survey',
      size: '8.7 MB',
      uploadDate: '2025-01-08',
      status: 'pending',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    }
  ];

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleDownload = (document) => {
    // Mock download functionality
    const link = document?.createElement('a');
    link.href = document?.url;
    link.download = document?.name;
    link?.click();
  };

  const handleViewerClick = (event) => {
    if (!isAnnotating) return;

    const rect = viewerRef?.current?.getBoundingClientRect();
    const x = ((event?.clientX - rect?.left) / rect?.width) * 100;
    const y = ((event?.clientY - rect?.top) / rect?.height) * 100;

    setAnnotationPosition({ x, y });
  };

  const handleAddAnnotation = () => {
    if (annotationText?.trim() && annotationPosition) {
      onAddAnnotation({
        id: Date.now(),
        text: annotationText,
        position: annotationPosition,
        documentId: selectedDocument?.id,
        timestamp: new Date()?.toISOString(),
        author: 'Current Reviewer'
      });
      setAnnotationText('');
      setAnnotationPosition(null);
      setIsAnnotating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-success bg-success/10';
      case 'rejected':
        return 'text-error bg-error/10';
      case 'reviewed':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Document Categories */}
      <div className="border-b border-border p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {documentCategories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => onDocumentSelect(category?.id)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth text-left"
            >
              <Icon name={category?.icon} size={16} className="text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {category?.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category?.count} files
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Document List */}
      <div className="border-b border-border p-4 max-h-48 overflow-y-auto">
        <div className="space-y-2">
          {mockDocuments?.map((doc) => (
            <div
              key={doc?.id}
              onClick={() => onDocumentSelect(doc)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-smooth hover:bg-muted ${
                selectedDocument?.id === doc?.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Icon 
                  name={doc?.type === 'pdf' ? 'FileText' : 'Image'} 
                  size={20} 
                  className="text-primary flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {doc?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc?.size} • {new Date(doc.uploadDate)?.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc?.status)}`}>
                  {doc?.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleDownload(doc);
                  }}
                  className="w-8 h-8"
                >
                  <Icon name="Download" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Document Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Viewer Controls */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
            >
              <Icon name="ZoomOut" size={16} />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
            >
              <Icon name="ZoomIn" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={isAnnotating ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAnnotating(!isAnnotating)}
            >
              <Icon name="MessageSquare" size={16} />
              Annotate
            </Button>
            {selectedDocument && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(selectedDocument)}
              >
                <Icon name="Download" size={16} />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Document Display */}
        <div className="flex-1 p-4 overflow-auto bg-muted/30">
          {selectedDocument ? (
            <div
              ref={viewerRef}
              className="relative mx-auto bg-white shadow-elevation-2 rounded-lg overflow-hidden cursor-crosshair"
              style={{
                width: `${zoomLevel}%`,
                maxWidth: '100%',
                minHeight: '600px'
              }}
              onClick={handleViewerClick}
            >
              <Image
                src={selectedDocument?.url}
                alt={selectedDocument?.name}
                className="w-full h-auto"
              />
              
              {/* Annotations */}
              {annotations?.map((annotation) => (
                <div
                  key={annotation?.id}
                  className="absolute w-6 h-6 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${annotation?.position?.x}%`,
                    top: `${annotation?.position?.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={annotation?.text}
                >
                  <Icon name="MessageCircle" size={12} className="text-accent-foreground" />
                </div>
              ))}

              {/* New Annotation Marker */}
              {annotationPosition && (
                <div
                  className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse"
                  style={{
                    left: `${annotationPosition?.x}%`,
                    top: `${annotationPosition?.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Icon name="Plus" size={12} className="text-primary-foreground" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Icon name="FileText" size={64} className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Document Selected
              </h3>
              <p className="text-muted-foreground">
                Select a document from the list above to begin reviewing
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Annotation Input Modal */}
      {annotationPosition && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-elevation-3">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Add Annotation
            </h3>
            <textarea
              value={annotationText}
              onChange={(e) => setAnnotationText(e?.target?.value)}
              placeholder="Enter your annotation..."
              className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex items-center justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAnnotationPosition(null);
                  setAnnotationText('');
                  setIsAnnotating(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddAnnotation}
                disabled={!annotationText?.trim()}
              >
                Add Annotation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;