import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const DocumentPreview = ({ document, onClose }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      content: 'Please review the pricing terms in section 4.2. The escalation rate seems higher than market standard.',
      timestamp: '2025-01-22T10:30:00Z',
      resolved: false
    },
    {
      id: 2,
      author: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      content: 'Updated the contract duration from 20 to 25 years as requested.',
      timestamp: '2025-01-21T14:15:00Z',
      resolved: true
    }
  ]);

  const [newComment, setNewComment] = useState('');

  const versionHistory = [
    {
      version: '3.2',
      date: '2025-01-20T14:30:00Z',
      author: 'Sarah Johnson',
      changes: 'Updated pricing terms and contract duration',
      current: true
    },
    {
      version: '3.1',
      date: '2025-01-18T09:15:00Z',
      author: 'Michael Chen',
      changes: 'Added interconnection requirements',
      current: false
    },
    {
      version: '3.0',
      date: '2025-01-15T16:45:00Z',
      author: 'David Rodriguez',
      changes: 'Initial draft with standard PPA terms',
      current: false
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = () => {
    if (newComment?.trim()) {
      const comment = {
        id: comments?.length + 1,
        author: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        content: newComment,
        timestamp: new Date()?.toISOString(),
        resolved: false
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const toggleCommentResolved = (commentId) => {
    setComments(prev => prev?.map(comment => 
      comment?.id === commentId 
        ? { ...comment, resolved: !comment?.resolved }
        : comment
    ));
  };

  if (!document) {
    return (
      <div className="h-full bg-card border-l border-border flex items-center justify-center">
        <div className="text-center">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Document Selected</h3>
          <p className="text-sm text-muted-foreground">Select a document to view its details and preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Icon name={document?.icon} size={20} className="text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground truncate">{document?.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                <span>{document?.type} • {document?.size}</span>
                <span>v{document?.version}</span>
                {document?.encrypted && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Lock" size={12} className="text-success" />
                    <span className="text-success">Encrypted</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" iconName="X" onClick={onClose} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4">
          <Button variant="default" size="sm" iconName="Download">
            Download
          </Button>
          <Button variant="outline" size="sm" iconName="Share">
            Share
          </Button>
          <Button variant="outline" size="sm" iconName="Edit">
            Edit
          </Button>
          <Button variant="outline" size="sm" iconName="MoreHorizontal" />
        </div>
      </div>
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 px-4">
          {['preview', 'details', 'comments', 'versions']?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-smooth capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              {tab === 'comments' && comments?.filter(c => !c?.resolved)?.length > 0 && (
                <span className="ml-2 bg-error text-error-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {comments?.filter(c => !c?.resolved)?.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'preview' && (
          <div className="p-4">
            <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <Icon name="FileText" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Document Preview</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview for {document?.type} files will be displayed here
                </p>
                <Button variant="outline" iconName="ExternalLink">
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="p-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Document Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Name:</span>
                  <p className="text-foreground font-medium mt-1">{document?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Type:</span>
                  <p className="text-foreground font-medium mt-1">{document?.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <p className="text-foreground font-medium mt-1">{document?.size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <p className="text-foreground font-medium mt-1">{document?.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span>
                  <p className="text-foreground font-medium mt-1">{document?.owner}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="text-foreground font-medium mt-1">{document?.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Modified:</span>
                  <p className="text-foreground font-medium mt-1">{formatDate(document?.modified)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Encryption:</span>
                  <p className="text-foreground font-medium mt-1">
                    {document?.encrypted ? 'AES-256 Encrypted' : 'Not Encrypted'}
                  </p>
                </div>
              </div>
            </div>

            {document?.tags && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {document?.tags?.map(tag => (
                    <span key={tag} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Access Permissions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Team</span>
                  <span className="text-foreground">Full Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Legal Team</span>
                  <span className="text-foreground">Read & Comment</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">External Reviewers</span>
                  <span className="text-foreground">Read Only</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="p-4 space-y-4">
            {/* Add Comment */}
            <div className="bg-muted rounded-lg p-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e?.target?.value)}
                placeholder="Add a comment..."
                className="w-full bg-background border border-border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleAddComment}
                  disabled={!newComment?.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment?.id} className={`border rounded-lg p-4 ${comment?.resolved ? 'bg-muted/50 border-success/20' : 'bg-background border-border'}`}>
                  <div className="flex items-start space-x-3">
                    <Image
                      src={comment?.avatar}
                      alt={comment?.author}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-foreground">{comment?.author}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment?.timestamp)}</span>
                          {comment?.resolved && (
                            <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                              Resolved
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName={comment?.resolved ? "RotateCcw" : "Check"}
                          onClick={() => toggleCommentResolved(comment?.id)}
                        >
                          {comment?.resolved ? 'Reopen' : 'Resolve'}
                        </Button>
                      </div>
                      <p className="text-sm text-foreground mt-2">{comment?.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="p-4">
            <div className="space-y-4">
              {versionHistory?.map((version) => (
                <div key={version?.version} className={`border rounded-lg p-4 ${version?.current ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">Version {version?.version}</span>
                        {version?.current && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(version?.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!version?.current && (
                        <Button variant="outline" size="sm" iconName="RotateCcw">
                          Restore
                        </Button>
                      )}
                      <Button variant="outline" size="sm" iconName="Download">
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">By {version?.author}</p>
                    <p className="text-sm text-foreground mt-1">{version?.changes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;