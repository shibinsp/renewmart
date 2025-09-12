import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentTable = ({ selectedFolder, onDocumentSelect, selectedDocuments, onSelectionChange }) => {
  const [sortBy, setSortBy] = useState('modified');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // table, grid

  const mockDocuments = {
    'contracts-alpha': [
      {
        id: 'doc-1',
        name: 'Solar_PPA_Agreement_v3.2.pdf',
        type: 'PDF',
        size: '2.4 MB',
        modified: '2025-01-20T14:30:00Z',
        version: '3.2',
        owner: 'Sarah Johnson',
        status: 'Final',
        tags: ['PPA', 'Contract', 'Legal'],
        encrypted: true,
        icon: 'FileText'
      },
      {
        id: 'doc-2',
        name: 'Land_Lease_Agreement.docx',
        type: 'Word',
        size: '1.8 MB',
        modified: '2025-01-18T09:15:00Z',
        version: '2.1',
        owner: 'Michael Chen',
        status: 'Under Review',
        tags: ['Lease', 'Legal'],
        encrypted: true,
        icon: 'FileText'
      },
      {
        id: 'doc-3',
        name: 'Interconnection_Agreement.pdf',
        type: 'PDF',
        size: '3.1 MB',
        modified: '2025-01-15T16:45:00Z',
        version: '1.5',
        owner: 'David Rodriguez',
        status: 'Draft',
        tags: ['Interconnection', 'Utility'],
        encrypted: false,
        icon: 'FileText'
      }
    ],
    'permits-alpha': [
      {
        id: 'doc-4',
        name: 'Environmental_Impact_Study.pdf',
        type: 'PDF',
        size: '15.2 MB',
        modified: '2025-01-22T11:20:00Z',
        version: '2.0',
        owner: 'Emily Watson',
        status: 'Approved',
        tags: ['Environmental', 'Permit'],
        encrypted: true,
        icon: 'Shield'
      },
      {
        id: 'doc-5',
        name: 'Building_Permit_Application.pdf',
        type: 'PDF',
        size: '4.7 MB',
        modified: '2025-01-19T13:30:00Z',
        version: '1.0',
        owner: 'James Wilson',
        status: 'Submitted',
        tags: ['Building', 'Permit'],
        encrypted: true,
        icon: 'Shield'
      }
    ],
    'projects': [
      {
        id: 'folder-1',
        name: 'Solar Farm Alpha',
        type: 'Folder',
        size: '156 files',
        modified: '2025-01-22T14:30:00Z',
        version: '-',
        owner: 'Project Team',
        status: 'Active',
        tags: ['Solar', 'Project'],
        encrypted: false,
        icon: 'FolderOpen'
      },
      {
        id: 'folder-2',
        name: 'Wind Farm Beta',
        type: 'Folder',
        size: '89 files',
        modified: '2025-01-21T10:15:00Z',
        version: '-',
        owner: 'Project Team',
        status: 'Active',
        tags: ['Wind', 'Project'],
        encrypted: false,
        icon: 'FolderOpen'
      }
    ]
  };

  const documents = mockDocuments?.[selectedFolder] || mockDocuments?.['projects'];

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string' && size?.includes('files')) return size;
    return size;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'final': case 'approved': return 'text-success bg-success/10';
      case 'under review': case 'submitted': return 'text-warning bg-warning/10';
      case 'draft': return 'text-muted-foreground bg-muted';
      case 'active': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(documents?.map(doc => doc?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectDocument = (docId, checked) => {
    if (checked) {
      onSelectionChange([...selectedDocuments, docId]);
    } else {
      onSelectionChange(selectedDocuments?.filter(id => id !== docId));
    }
  };

  const isAllSelected = documents?.length > 0 && selectedDocuments?.length === documents?.length;
  const isPartiallySelected = selectedDocuments?.length > 0 && selectedDocuments?.length < documents?.length;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {selectedFolder === 'projects' ? 'All Projects' : 'Documents'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {documents?.length} items • {selectedDocuments?.length} selected
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName={viewMode === 'table' ? 'Grid3X3' : 'List'}
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            >
              {viewMode === 'table' ? 'Grid' : 'Table'}
            </Button>
            
            <Button variant="outline" size="sm" iconName="Filter">
              Filter
            </Button>
            
            <Button variant="default" size="sm" iconName="Upload">
              Upload
            </Button>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="w-12 p-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th 
                className="p-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortBy === 'name' && (
                    <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  )}
                </div>
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th 
                className="p-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('size')}
              >
                <div className="flex items-center space-x-1">
                  <span>Size</span>
                  {sortBy === 'size' && (
                    <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  )}
                </div>
              </th>
              <th 
                className="p-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-smooth"
                onClick={() => handleSort('modified')}
              >
                <div className="flex items-center space-x-1">
                  <span>Modified</span>
                  {sortBy === 'modified' && (
                    <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  )}
                </div>
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Version</th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">Owner</th>
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {documents?.map((doc) => (
              <tr 
                key={doc?.id}
                className="border-b border-border hover:bg-muted/50 transition-smooth cursor-pointer"
                onClick={() => onDocumentSelect(doc)}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedDocuments?.includes(doc?.id)}
                    onChange={(e) => {
                      e?.stopPropagation();
                      handleSelectDocument(doc?.id, e?.target?.checked);
                    }}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <Icon name={doc?.icon} size={16} className="text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {doc?.name}
                        </span>
                        {doc?.encrypted && (
                          <Icon name="Lock" size={12} className="text-success flex-shrink-0" />
                        )}
                      </div>
                      {doc?.tags && (
                        <div className="flex items-center space-x-1 mt-1">
                          {doc?.tags?.slice(0, 2)?.map(tag => (
                            <span key={tag} className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {doc?.tags?.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{doc?.tags?.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">{doc?.type}</td>
                <td className="p-3 text-sm text-muted-foreground">{formatFileSize(doc?.size)}</td>
                <td className="p-3 text-sm text-muted-foreground">{formatDate(doc?.modified)}</td>
                <td className="p-3 text-sm text-muted-foreground">{doc?.version}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(doc?.status)}`}>
                    {doc?.status}
                  </span>
                </td>
                <td className="p-3 text-sm text-muted-foreground">{doc?.owner}</td>
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="MoreHorizontal"
                    onClick={(e) => {
                      e?.stopPropagation();
                      // Handle menu
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;