import React from 'react';
import Icon from '../../../components/AppIcon';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const steps = [
    { number: 1, title: 'Account Details', description: 'Basic information' },
    { number: 2, title: 'Role Selection', description: 'Choose your role' },
    { number: 3, title: 'Company Information', description: 'Organization details' },
    { number: 4, title: 'Verification', description: 'Confirm your account' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => (
          <div key={step?.number} className="flex items-center">
            {/* Step Circle */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-smooth ${
              step?.number < currentStep
                ? 'bg-success border-success text-success-foreground'
                : step?.number === currentStep
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-muted border-border text-muted-foreground'
            }`}>
              {step?.number < currentStep ? (
                <Icon name="Check" size={16} />
              ) : (
                <span className="text-sm font-medium">{step?.number}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="ml-3 hidden md:block">
              <div className={`text-sm font-medium ${
                step?.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step?.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {step?.description}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps?.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step?.number < currentStep ? 'bg-success' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>
      {/* Mobile Step Info */}
      <div className="md:hidden mt-4 text-center">
        <div className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}: {steps?.[currentStep - 1]?.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {steps?.[currentStep - 1]?.description}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;