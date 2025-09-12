import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  isLoading, 
  canProceed 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Back
          </Button>
        ) : (
          <Link to="/login">
            <Button
              variant="ghost"
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Login
            </Button>
          </Link>
        )}
      </div>

      {/* Progress Info */}
      <div className="text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Next/Complete Button */}
      <div>
        {currentStep < totalSteps ? (
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            loading={isLoading}
            iconName="ChevronRight"
            iconPosition="right"
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            loading={isLoading}
            iconName="CheckCircle"
            iconPosition="left"
            variant="success"
          >
            Complete Registration
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;