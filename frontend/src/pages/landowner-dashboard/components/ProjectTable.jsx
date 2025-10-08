import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import StatusBadge from './StatusBadge';

const ProjectTable = ({ projects, onEdit, onView, onContinueDraft }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAction = (action, project) => {
    switch (action) {
      case 'edit':
        onEdit(project);
        break;
      case 'view':
        onView(project);
        break;
      case 'continue':
        onContinueDraft(project);
        break;
      case 'upload': navigate('/document-upload', { state: { projectId: project?.id } });
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Project Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Location
              </th>
              <th className="text-left px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Type
              </th>
              <th className="text-left px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Capacity (MW)
              </th>
              <th className="text-left px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Last Updated
              </th>
              <th className="text-right px-6 py-4 text-sm font-body font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects?.map((project) => (
              <tr key={project?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Zap" size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-body font-medium text-foreground">
                        {project?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {project?.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="MapPin" size={16} className="text-muted-foreground" />
                    <span className="font-body text-foreground">{project?.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-body text-foreground capitalize">{project?.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-body font-medium text-foreground">{project?.capacity}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={project?.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="font-body text-muted-foreground">
                    {formatDate(project?.lastUpdated)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    {project?.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('continue', project)}
                        iconName="Edit"
                        iconPosition="left"
                      >
                        Continue
                      </Button>
                    )}
                    {project?.status === 'approved' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction('upload', project)}
                        iconName="Upload"
                        iconPosition="left"
                      >
                        Upload Docs
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('view', project)}
                      iconName="Eye"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('edit', project)}
                      iconName="Edit"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {projects?.map((project) => (
          <div key={project?.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-body font-medium text-foreground">
                    {project?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {project?.id}
                  </div>
                </div>
              </div>
              <StatusBadge status={project?.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <span className="text-muted-foreground">Location:</span>
                <div className="font-body text-foreground">{project?.location}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <div className="font-body text-foreground capitalize">{project?.type}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Capacity:</span>
                <div className="font-body font-medium text-foreground">{project?.capacity} MW</div>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <div className="font-body text-foreground">{formatDate(project?.lastUpdated)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {project?.status === 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('continue', project)}
                  iconName="Edit"
                  iconPosition="left"
                  className="flex-1"
                >
                  Continue Draft
                </Button>
              )}
              {project?.status === 'approved' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAction('upload', project)}
                  iconName="Upload"
                  iconPosition="left"
                  className="flex-1"
                >
                  Upload Documents
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('view', project)}
                iconName="Eye"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('edit', project)}
                iconName="Edit"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTable;