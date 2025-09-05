import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationHeader from './components/RegistrationHeader';
import StepIndicator from './components/StepIndicator';
import AccountDetailsStep from './components/AccountDetailsStep';
import RoleSelectionStep from './components/RoleSelectionStep';
import CompanyInformationStep from './components/CompanyInformationStep';
import VerificationStep from './components/VerificationStep';
import TrustSignals from './components/TrustSignals';
import NavigationButtons from './components/NavigationButtons';

const Registration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    // Step 1: Account Details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Step 2: Role Selection
    role: '',
    
    // Step 3: Company Information
    companyName: '',
    jobTitle: '',
    companySize: '',
    website: '',
    address: '',
    
    // Role-specific fields
    portfolioSize: '',
    investmentFocus: '',
    propertyType: '',
    propertySize: '',
    propertyLocation: '',
    certifications: [],
    experience: '',
    
    // Preferences
    marketingConsent: false,
    industryUpdates: true
  });

  const totalSteps = 4;

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!formData?.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData?.password) {
          newErrors.password = 'Password is required';
        } else if (formData?.password?.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData?.password !== formData?.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData?.phone?.trim()) newErrors.phone = 'Phone number is required';
        break;

      case 2:
        if (!formData?.role) newErrors.role = 'Please select your role';
        break;

      case 3:
        if (!formData?.companyName?.trim()) newErrors.companyName = 'Company name is required';
        if (!formData?.jobTitle?.trim()) newErrors.jobTitle = 'Job title is required';
        if (!formData?.companySize) newErrors.companySize = 'Company size is required';
        if (!formData?.address?.trim()) newErrors.address = 'Company address is required';
        
        // Role-specific validation
        if (formData?.role === 'investor' && !formData?.portfolioSize) {
          newErrors.portfolioSize = 'Portfolio size is required';
        }
        if (formData?.role === 'landowner') {
          if (!formData?.propertyType) newErrors.propertyType = 'Property type is required';
          if (!formData?.propertyLocation?.trim()) newErrors.propertyLocation = 'Property location is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Simulate registration completion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to dashboard after successful registration
    navigate('/dashboard');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData?.firstName && formData?.lastName && formData?.email && 
               formData?.password && formData?.confirmPassword && formData?.phone;
      case 2:
        return formData?.role;
      case 3:
        return formData?.companyName && formData?.jobTitle && formData?.companySize && formData?.address;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case 3:
        return (
          <CompanyInformationStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 4:
        return (
          <VerificationStep
            formData={formData}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg shadow-subtle p-8">
                <RegistrationHeader />
                
                <StepIndicator 
                  currentStep={currentStep} 
                  totalSteps={totalSteps} 
                />
                
                <div className="mb-8">
                  {renderCurrentStep()}
                </div>
                
                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isLoading={isLoading}
                  canProceed={canProceed()}
                />
              </div>
            </div>

            {/* Trust Signals Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg shadow-subtle p-6 sticky top-8">
                <TrustSignals />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;