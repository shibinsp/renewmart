import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const CollaborationTools = ({ 
  comments = [],
  onAddComment = () => {},
  onDeleteComment = () => {},
  reviewers = [],
  onAssignReviewer = () => {}
}) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState('');

  const mockComments = [
    {
      id: 'comment-1',
      author: 'Sarah Johnson',
      role: 'RE Analyst',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: `The land valuation report shows promising potential for solar development. However, I need clarification on the grid connectivity timeline mentioned in section 3.2.`,
      timestamp: '2025-01-13T10:30:00Z',
      type: 'question',
      replies: [
        {
          id: 'reply-1',
          author: 'Michael Chen',
          role: 'RE Governance Lead',
          content: `I've reviewed the grid connectivity documentation. The timeline is accurate based on the utility company's current expansion plans.`,
          timestamp: '2025-01-13T11:15:00Z'
        }
      ]
    },
    {
      id: 'comment-2',
      author: 'David Rodriguez',
      role: 'RE Sales Advisor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: `Market analysis looks solid. The pricing structure aligns well with current market rates in this region. Approved from market perspective.`,
      timestamp: '2025-01-13T09:45:00Z',
      type: 'approval'
    },
    {
      id: 'comment-3',
      author: 'Lisa Wang',
      role: 'Environmental Specialist',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: `Environmental impact assessment requires additional soil contamination testing. Please request updated reports from the landowner.`,
      timestamp: '2025-01-13T08:20:00Z',
      type: 'request'
    }
  ];

  const mockReviewers = [
    {
      id: 'reviewer-1',
      name: 'Alex Thompson',
      role: 'Senior RE Analyst',
      department: 'Technical Review',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'available'
    },
    {
      id: 'reviewer-2',
      name: 'Emma Davis',
      role: 'RE Governance Lead',
      department: 'Compliance',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      status: 'busy'
    },
    {
      id: 'reviewer-3',
      name: 'James Wilson',
      role: 'Financial Analyst',
      department: 'Finance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      status: 'available'
    }
  ];

  const getCommentTypeIcon = (type) => {
    switch (type) {
      case 'question':
        return 'HelpCircle';
      case 'approval':
        return 'CheckCircle';
      case 'request':
        return 'AlertCircle';
      default:
        return 'MessageCircle';
    }
  };

  const getCommentTypeColor = (type) => {
    switch (type) {
      case 'question':
        return 'text-primary';
      case 'approval':
        return 'text-success';
      case 'request':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleAddComment = () => {
    if (newComment?.trim()) {
      const comment = {
        id: `comment-${Date.now()}`,
        author: 'Current User',
        role: 'RE Analyst',
        content: newComment,
        timestamp: new Date()?.toISOString(),
        type: 'comment'
      };
      onAddComment(comment);
      setNewComment('');
      setIsAddingComment(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date?.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Icon name="MessageSquare" size={20} className="text-primary" />
              <span>Review Comments</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingComment(!isAddingComment)}
            >
              <Icon name="Plus" size={16} />
              Add Comment
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Add Comment Form */}
          {isAddingComment && (
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e?.target?.value)}
                  placeholder="Add your comment or question..."
                  className="w-full h-20 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingComment(false);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment?.trim()}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="divide-y divide-border">
            {mockComments?.map((comment) => (
              <div key={comment?.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={comment?.avatar}
                      alt={comment?.author}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-foreground text-sm">
                        {comment?.author}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {comment?.role}
                      </span>
                      <Icon 
                        name={getCommentTypeIcon(comment?.type)} 
                        size={14} 
                        className={getCommentTypeColor(comment?.type)} 
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(comment?.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground leading-relaxed mb-2">
                      {comment?.content}
                    </p>
                    
                    {/* Replies */}
                    {comment?.replies && comment?.replies?.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-muted space-y-2">
                        {comment?.replies?.map((reply) => (
                          <div key={reply?.id} className="flex items-start space-x-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-foreground text-xs">
                                  {reply?.author}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {reply?.role}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(reply?.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-foreground leading-relaxed">
                                {reply?.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2">
                      <button className="text-xs text-muted-foreground hover:text-primary transition-smooth">
                        Reply
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-primary transition-smooth">
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Reviewer Assignment */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Users" size={18} className="text-primary" />
          <span>Assign Additional Reviewers</span>
        </h4>
        
        <div className="space-y-3">
          {mockReviewers?.map((reviewer) => (
            <div
              key={reviewer?.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-smooth"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <img
                    src={reviewer?.avatar}
                    alt={reviewer?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {reviewer?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reviewer?.role} • {reviewer?.department}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reviewer?.status === 'available' ?'text-success bg-success/10' :'text-warning bg-warning/10'
                }`}>
                  {reviewer?.status}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssignReviewer(reviewer?.id)}
                  disabled={reviewer?.status !== 'available'}
                >
                  Assign
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Communication Tools */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
          <Icon name="MessageCircle" size={18} className="text-primary" />
          <span>Communication Tools</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            <Icon name="Video" size={16} />
            Schedule Review Meeting
          </Button>
          <Button variant="outline" className="justify-start">
            <Icon name="Mail" size={16} />
            Send Email Update
          </Button>
          <Button variant="outline" className="justify-start">
            <Icon name="Phone" size={16} />
            Request Phone Call
          </Button>
          <Button variant="outline" className="justify-start">
            <Icon name="Share" size={16} />
            Share Review Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationTools;