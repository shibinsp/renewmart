import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import DocumentTree from './components/DocumentTree';
import DocumentTable from './components/DocumentTable';
import DocumentPreview from './components/DocumentPreview';
import DocumentSearch from './components/DocumentSearch';
import UploadArea from './components/UploadArea';
import Button from '../../components/ui/Button';


const DocumentManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('projects');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
    setSelectedDocument(null);
    setSelectedDocuments([]);
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleSelectionChange = (documentIds) => {
    setSelectedDocuments(documentIds);
  };

  const handleSearch = (query, filters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    // In a real app, this would trigger API calls
    console.log('Searching for:', query, 'with filters:', filters);
  };

  const handleFilterChange = (filters) => {
    setSearchFilters(filters);
    // In a real app, this would update the document list
    console.log('Filters changed:', filters);
  };

  const handleUpload = (files) => {
    console.log('Files uploaded:', files);
    // In a real app, this would handle the file upload process
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Documents', path: '/document-management', icon: 'FileText', isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-60'
      } mt-16`}>
        <div className="h-screen flex flex-col">
          {/* Page Header */}
          <div className="bg-card border-b border-border px-6 py-4">
            <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
                <p className="text-muted-foreground mt-1">
                  Centralized repository for all renewable energy project documentation
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="FolderPlus"
                >
                  New Folder
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  iconName="Upload"
                  onClick={() => setShowUpload(true)}
                >
                  Upload Files
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <DocumentSearch 
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel - Document Tree */}
            <div className="w-1/4 min-w-[300px] border-r border-border bg-card">
              <DocumentTree
                selectedFolder={selectedFolder}
                onFolderSelect={handleFolderSelect}
              />
            </div>

            {/* Center Panel - Document Table */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Toolbar */}
              {selectedDocuments?.length > 0 && (
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-primary">
                        {selectedDocuments?.length} documents selected
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" iconName="Download">
                        Download
                      </Button>
                      <Button variant="outline" size="sm" iconName="Share">
                        Share
                      </Button>
                      <Button variant="outline" size="sm" iconName="Archive">
                        Archive
                      </Button>
                      <Button variant="outline" size="sm" iconName="Trash2">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <DocumentTable
                selectedFolder={selectedFolder}
                onDocumentSelect={handleDocumentSelect}
                selectedDocuments={selectedDocuments}
                onSelectionChange={handleSelectionChange}
              />
            </div>

            {/* Right Panel - Document Preview */}
            <div className="w-1/3 min-w-[400px]">
              <DocumentPreview
                document={selectedDocument}
                onClose={() => setSelectedDocument(null)}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Upload Modal */}
      <UploadArea
        isVisible={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default DocumentManagement;