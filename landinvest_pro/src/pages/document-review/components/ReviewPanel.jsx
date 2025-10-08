import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import { Checkbox } from '../../../components/ui/Checkbox';

const ReviewPanel = ({ 
  reviewerRole = 'analyst',
  documentCategory = 'ownership',
  onApprove = () => {},
  onReject = () => {},
  onRequestClarification = () => {},
  onSaveProgress = () => {}
}) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [comments, setComments] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [justification, setJustification] = useState('');

  const reviewCriteria = {
    'sales_advisor': {
      title: 'Market Analysis Review',
      icon: 'TrendingUp',
      sections: [
        {
          title: 'Market Viability',
          items: [
            'Location accessibility and infrastructure',
            'Proximity to transmission lines',
            'Local energy demand assessment',
            'Competition analysis in the region',
            'Market price competitiveness'
          ]
        },
        {
          title: 'Commercial Feasibility',
          items: [
            'Revenue projection accuracy',
            'Contract terms evaluation',
            'Risk assessment completeness',
            'ROI calculations verification',
            'Market timing considerations'
          ]
        }
      ]
    },
    'analyst': {
      title: 'Technical & Financial Assessment',
      icon: 'Calculator',
      sections: [
        {
          title: 'Technical Analysis',
          items: [
            'Land suitability for renewable energy',
            'Topographical survey accuracy',
            'Grid connectivity feasibility',
            'Environmental impact assessment',
            'Technical specifications compliance'
          ]
        },
        {
          title: 'Financial Analysis',
          items: [
            'Financial model accuracy',
            'Cost estimation validation',
            'Revenue projections review',
            'Cash flow analysis',
            'Financing structure evaluation'
          ]
        }
      ]
    },
    'governance_lead': {
      title: 'Regulatory Compliance Review',
      icon: 'Shield',
      sections: [
        {
          title: 'Legal Compliance',
          items: [
            'Land ownership documentation',
            'Zoning and permits verification',
            'Environmental clearances',
            'Government NOC validation',
            'Legal title verification'
          ]
        },
        {
          title: 'Regulatory Requirements',
          items: [
            'Industry standards compliance',
            'Safety regulations adherence',
            'Environmental regulations',
            'Local authority approvals',
            'Regulatory timeline compliance'
          ]
        }
      ]
    }
  };

  const currentCriteria = reviewCriteria?.[reviewerRole] || reviewCriteria?.analyst;

  const handleCheckboxChange = (sectionIndex, itemIndex, checked) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleRatingClick = (rating) => {
    setOverallRating(rating);
  };

  const getCompletionPercentage = () => {
    const totalItems = currentCriteria?.sections?.reduce((total, section) => total + section?.items?.length, 0);
    const checkedCount = Object.values(checkedItems)?.filter(Boolean)?.length;
    return Math.round((checkedCount / totalItems) * 100);
  };

  const isReviewComplete = () => {
    const totalItems = currentCriteria?.sections?.reduce((total, section) => total + section?.items?.length, 0);
    const checkedCount = Object.values(checkedItems)?.filter(Boolean)?.length;
    return checkedCount === totalItems && overallRating > 0;
  };

  const handleSubmitReview = (action) => {
    const reviewData = {
      checkedItems,
      comments,
      overallRating,
      justification,
      completionPercentage: getCompletionPercentage(),
      timestamp: new Date()?.toISOString(),
      reviewerRole,
      documentCategory
    };

    switch (action) {
      case 'approve':
        onApprove(reviewData);
        break;
      case 'reject':
        onReject(reviewData);
        break;
      case 'clarification':
        onRequestClarification(reviewData);
        break;
      default:
        onSaveProgress(reviewData);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name={currentCriteria?.icon} size={24} className="text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {currentCriteria?.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Document Category: {documentCategory?.replace('_', ' ')?.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {getCompletionPercentage()}%
            </div>
            <div className="text-xs text-muted-foreground">
              Complete
            </div>
          </div>
        </div>
      </div>
      {/* Review Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {currentCriteria?.sections?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
              <Icon name="CheckSquare" size={18} className="text-primary" />
              <span>{section?.title}</span>
            </h3>
            
            <div className="space-y-2 pl-6">
              {section?.items?.map((item, itemIndex) => (
                <Checkbox
                  key={itemIndex}
                  label={item}
                  checked={checkedItems?.[`${sectionIndex}-${itemIndex}`] || false}
                  onChange={(e) => handleCheckboxChange(sectionIndex, itemIndex, e?.target?.checked)}
                  className="text-sm"
                />
              ))}
            </div>
          </div>
        ))}

        {/* Overall Rating */}
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-base font-semibold text-foreground">
            Overall Assessment
          </h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Rating (1-5 stars)
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5]?.map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="p-1 rounded hover:bg-muted transition-smooth"
                >
                  <Icon
                    name="Star"
                    size={24}
                    className={`${
                      star <= overallRating
                        ? 'text-warning fill-current' :'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Review Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e?.target?.value)}
            placeholder="Add your detailed review comments here..."
            className="w-full h-24 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Justification for Actions */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Action Justification
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e?.target?.value)}
            placeholder="Provide justification for your decision..."
            className="w-full h-20 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      {/* Action Buttons */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>Review Progress</span>
          <span>{getCompletionPercentage()}% Complete</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmitReview('save')}
            className="w-full"
          >
            <Icon name="Save" size={16} />
            Save Progress
          </Button>
          
          <Button
            variant="warning"
            onClick={() => handleSubmitReview('clarification')}
            disabled={!justification?.trim()}
            className="w-full"
          >
            <Icon name="MessageCircle" size={16} />
            Request Clarification
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => handleSubmitReview('reject')}
            disabled={!justification?.trim()}
            className="w-full"
          >
            <Icon name="XCircle" size={16} />
            Reject
          </Button>
          
          <Button
            variant="success"
            onClick={() => handleSubmitReview('approve')}
            disabled={!isReviewComplete() || !justification?.trim()}
            className="w-full"
          >
            <Icon name="CheckCircle" size={16} />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;