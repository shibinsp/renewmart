import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const DocumentUpload = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const documentCategories = [
    {
      id: 'property-deeds',
      title: 'Property Deeds & Titles',
      description: 'Legal ownership documents',
      icon: 'FileText',
      required: true,
      files: []
    },
    {
      id: 'surveys',
      title: 'Land Surveys',
      description: 'Property boundary and topographical surveys',
      icon: 'Map',
      required: true,
      files: []
    },
    {
      id: 'environmental',
      title: 'Environmental Reports',
      description: 'Environmental impact assessments',
      icon: 'Leaf',
      required: false,
      files: []
    },
    {
      id: 'permits',
      title: 'Permits & Licenses',
      description: 'Existing permits and regulatory approvals',
      icon: 'Shield',
      required: false,
      files: []
    },
    {
      id: 'utilities',
      title: 'Utility Information',
      description: 'Power grid connection and utility access',
      icon: 'Zap',
      required: true,
      files: []
    },
    {
      id: 'financial',
      title: 'Financial Documents',
      description: 'Tax records and financial statements',
      icon: 'DollarSign',
      required: false,
      files: []
    }
  ];

  const [categories, setCategories] = useState(documentCategories);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, categoryId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files, categoryId);
  };

  const handleFileUpload = (files, categoryId) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploaded'
    }));

    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, files: [...cat.files, ...newFiles] }
        : cat
    ));
  };

  const handleFileInput = (e, categoryId) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files, categoryId);
  };

  const removeFile = (categoryId, fileId) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, files: cat.files.filter(f => f.id !== fileId) }
        : cat
    ));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getCompletionStatus = () => {
    const requiredCategories = categories.filter(cat => cat.required);
    const completedRequired = requiredCategories.filter(cat => cat.files.length > 0);
    return {
      completed: completedRequired.length,
      total: requiredCategories.length,
      percentage: Math.round((completedRequired.length / requiredCategories.length) * 100)
    };
  };

  const status = getCompletionStatus();

  return (
    <>
      <Helmet>
        <title>Document Upload - RenewMart</title>
        <meta name="description" content="Upload property documents for renewable energy project evaluation" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}>
          <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <BreadcrumbNavigation />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Document Upload
                  </h1>
                  <p className="text-muted-foreground">
                    Upload your property documents to get started with renewable energy development
                  </p>
                </div>
                
                {/* Progress Indicator */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{status.percentage}%</div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {status.completed} of {status.total} required
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-muted rounded-full mt-2">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Categories */}
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-card border border-border rounded-lg shadow-subtle">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        category.files.length > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon name={category.icon} size={24} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                          {category.required && (
                            <span className="px-2 py-1 bg-error/10 text-error text-xs font-medium rounded-full">
                              Required
                            </span>
                          )}
                          {category.files.length > 0 && (
                            <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                              {category.files.length} file{category.files.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">{category.description}</p>
                      </div>
                    </div>
                    <Icon 
                      name={expandedCategory === category.id ? 'ChevronUp' : 'ChevronDown'} 
                      size={20} 
                      className="text-muted-foreground" 
                    />
                  </button>

                  {/* Category Content */}
                  {expandedCategory === category.id && (
                    <div className="border-t border-border p-6">
                      {/* Upload Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => handleDrop(e, category.id)}
                      >
                        <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-foreground mb-2">
                          Drop files here or click to upload
                        </h4>
                        <p className="text-muted-foreground mb-4">
                          Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileInput(e, category.id)}
                          className="hidden"
                          id={`file-input-${category.id}`}
                        />
                        <Button
                          as="label"
                          htmlFor={`file-input-${category.id}`}
                          variant="outline"
                          iconName="Upload"
                        >
                          Choose Files
                        </Button>
                      </div>

                      {/* Uploaded Files */}
                      {category.files.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-sm font-medium text-foreground mb-3">Uploaded Files</h5>
                          <div className="space-y-2">
                            {category.files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Icon name="File" size={20} className="text-muted-foreground" />
                                  <div>
                                    <div className="text-sm font-medium text-foreground">{file.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)} • Uploaded {file.uploadDate.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  iconName="Trash2"
                                  onClick={() => removeFile(category.id, file.id)}
                                  className="text-error hover:text-error"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" iconName="ArrowLeft">
                Save as Draft
              </Button>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  Preview Submission
                </Button>
                <Button 
                  iconName="Send"
                  disabled={status.percentage < 100}
                >
                  Submit for Review
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DocumentUpload;