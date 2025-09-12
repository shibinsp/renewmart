import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DocumentTree = ({ selectedFolder, onFolderSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState(['projects', 'templates']);

  const documentStructure = [
    {
      id: 'projects',
      name: 'Projects',
      type: 'folder',
      icon: 'FolderOpen',
      children: [
        {
          id: 'solar-alpha',
          name: 'Solar Farm Alpha',
          type: 'project',
          icon: 'Sun',
          children: [
            { id: 'contracts-alpha', name: 'Contracts', type: 'folder', icon: 'FileText', count: 12 },
            { id: 'permits-alpha', name: 'Permits', type: 'folder', icon: 'Shield', count: 8 },
            { id: 'technical-alpha', name: 'Technical Specs', type: 'folder', icon: 'Settings', count: 15 },
            { id: 'financial-alpha', name: 'Financial Models', type: 'folder', icon: 'Calculator', count: 6 }
          ]
        },
        {
          id: 'wind-beta',
          name: 'Wind Farm Beta',
          type: 'project',
          icon: 'Wind',
          children: [
            { id: 'contracts-beta', name: 'Contracts', type: 'folder', icon: 'FileText', count: 9 },
            { id: 'permits-beta', name: 'Permits', type: 'folder', icon: 'Shield', count: 12 },
            { id: 'technical-beta', name: 'Technical Specs', type: 'folder', icon: 'Settings', count: 18 },
            { id: 'financial-beta', name: 'Financial Models', type: 'folder', icon: 'Calculator', count: 4 }
          ]
        }
      ]
    },
    {
      id: 'templates',
      name: 'Document Templates',
      type: 'folder',
      icon: 'FileTemplate',
      children: [
        { id: 'ppa-templates', name: 'PPA Templates', type: 'folder', icon: 'FileText', count: 5 },
        { id: 'legal-templates', name: 'Legal Documents', type: 'folder', icon: 'Scale', count: 8 },
        { id: 'technical-templates', name: 'Technical Templates', type: 'folder', icon: 'Wrench', count: 12 }
      ]
    },
    {
      id: 'shared',
      name: 'Shared Documents',
      type: 'folder',
      icon: 'Users',
      children: [
        { id: 'company-docs', name: 'Company Documents', type: 'folder', icon: 'Building', count: 15 },
        { id: 'regulatory', name: 'Regulatory Files', type: 'folder', icon: 'BookOpen', count: 22 },
        { id: 'training', name: 'Training Materials', type: 'folder', icon: 'GraduationCap', count: 18 }
      ]
    },
    {
      id: 'archive',
      name: 'Archive',
      type: 'folder',
      icon: 'Archive',
      children: [
        { id: 'completed-projects', name: 'Completed Projects', type: 'folder', icon: 'CheckCircle', count: 45 },
        { id: 'old-contracts', name: 'Legacy Contracts', type: 'folder', icon: 'Clock', count: 28 }
      ]
    }
  ];

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => 
      prev?.includes(folderId) 
        ? prev?.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const renderTreeItem = (item, level = 0) => {
    const isExpanded = expandedFolders?.includes(item?.id);
    const isSelected = selectedFolder === item?.id;
    const hasChildren = item?.children && item?.children?.length > 0;

    return (
      <div key={item?.id} className="select-none">
        <div
          className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer transition-smooth ${
            isSelected 
              ? 'bg-primary/10 text-primary border border-primary/20' :'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleFolder(item?.id);
            }
            onFolderSelect(item?.id);
          }}
        >
          {hasChildren && (
            <Icon 
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'} 
              size={14} 
              className="flex-shrink-0"
            />
          )}
          {!hasChildren && <div className="w-3.5" />}
          
          <Icon 
            name={item?.icon} 
            size={16} 
            className={`flex-shrink-0 ${isSelected ? 'text-primary' : 'text-current'}`}
          />
          
          <span className="flex-1 text-sm font-medium truncate">{item?.name}</span>
          
          {item?.count && (
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {item?.count}
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item?.children?.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Document Library</h2>
        <p className="text-sm text-muted-foreground mt-1">Organize and access project files</p>
      </div>
      <div className="p-3 overflow-y-auto h-full">
        <div className="space-y-1">
          {documentStructure?.map(item => renderTreeItem(item))}
        </div>
      </div>
    </div>
  );
};

export default DocumentTree;