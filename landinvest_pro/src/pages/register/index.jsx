import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowBreadcrumbs from '../../components/ui/WorkflowBreadcrumbs';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActions from '../../components/ui/QuickActions';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';

import RoleSelector from './components/RoleSelector';
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator';
import TrustSignals from './components/TrustSignals';
import RoleSpecificFields from './components/RoleSpecificFields';

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    marketingEmails: false
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Mock credentials for different roles
  const mockCredentials = {
    landowner: {
      email: "landowner@example.com",
      password: "LandOwner123!"
    },
    investor: {
      email: "investor@example.com", 
      password: "Investor123!"
    },
    admin: {
      email: "admin@example.com",
      password: "Admin123!"
    }
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: 'User' },
    { id: 2, title: 'Role Selection', icon: 'UserCheck' },
    { id: 3, title: 'Security Setup', icon: 'Lock' },
    { id: 4, title: 'Additional Details', icon: 'FileText' },
    { id: 5, title: 'Review & Submit', icon: 'CheckCircle' }
  ];

  useEffect(() => {
    // Show welcome notification
    setNotifications([{
      id: 'welcome',
      type: 'info',
      title: 'Welcome to LandInvest Pro',
      message: 'Create your account to start connecting renewable energy opportunities.',
      timestamp: new Date()
    }]);
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'fullName':
        if (!value?.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value?.trim()?.length < 2) {
          newErrors.fullName = 'Name must be at least 2 characters';
        } else {
          delete newErrors?.fullName;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex?.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors?.email;
        }
        break;
        
      case 'phone':
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!value) {
          newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex?.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors?.phone;
        }
        break;
        
      case 'company':
        if (!value?.trim()) {
          newErrors.company = 'Company/Organization is required';
        } else {
          delete newErrors?.company;
        }
        break;
        
      case 'role':
        if (!value) {
          newErrors.role = 'Please select a role';
        } else {
          delete newErrors?.role;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value?.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors?.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData?.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors?.confirmPassword;
        }
        break;
        
      case 'agreeToTerms':
        if (!value) {
          newErrors.agreeToTerms = 'You must agree to the terms of service';
        } else {
          delete newErrors?.agreeToTerms;
        }
        break;
        
      case 'agreeToPrivacy':
        if (!value) {
          newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
        } else {
          delete newErrors?.agreeToPrivacy;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touchedFields?.[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    validateField(name, formData?.[name]);
  };

  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors = {};

    switch (currentStep) {
      case 1:
        ['fullName', 'email', 'phone', 'company']?.forEach(field => {
          if (!validateField(field, formData?.[field])) {
            isValid = false;
          }
        });
        break;
        
      case 2:
        if (!validateField('role', formData?.role)) {
          isValid = false;
        }
        break;
        
      case 3:
        ['password', 'confirmPassword']?.forEach(field => {
          if (!validateField(field, formData?.[field])) {
            isValid = false;
          }
        });
        break;
        
      case 5:
        ['agreeToTerms', 'agreeToPrivacy']?.forEach(field => {
          if (!validateField(field, formData?.[field])) {
            isValid = false;
          }
        });
        break;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps?.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setNotifications([{
        id: 'validation-error',
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors before continuing.',
        timestamp: new Date()
      }]);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setNotifications([{
        id: 'submit-error',
        type: 'error',
        title: 'Validation Error',
        message: 'Please complete all required fields.',
        timestamp: new Date()
      }]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotifications([{
        id: 'success',
        type: 'success',
        title: 'Account Created Successfully!',
        message: 'Please check your email for verification instructions.',
        timestamp: new Date()
      }]);

      // Navigate to appropriate dashboard based on role
      setTimeout(() => {
        switch (formData?.role) {
          case 'landowner':
            navigate('/landowner-dashboard');
            break;
          case 'investor': navigate('/investor-portal');
            break;
          case 'admin': navigate('/admin-dashboard');
            break;
          default:
            navigate('/landowner-dashboard');
        }
      }, 2000);
      
    } catch (error) {
      setNotifications([{
        id: 'error',
        type: 'error',
        title: 'Registration Failed',
        message: 'There was an error creating your account. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Basic Information
              </h2>
              <p className="font-body text-muted-foreground">
                Let's start with your basic details
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData?.fullName}
                onChange={(e) => handleInputChange('fullName', e?.target?.value)}
                onBlur={() => handleBlur('fullName')}
                error={errors?.fullName}
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                onBlur={() => handleBlur('email')}
                error={errors?.email}
                required
              />
              
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                onBlur={() => handleBlur('phone')}
                error={errors?.phone}
                required
              />
              
              <Input
                label="Company/Organization"
                type="text"
                placeholder="Enter company name"
                value={formData?.company}
                onChange={(e) => handleInputChange('company', e?.target?.value)}
                onBlur={() => handleBlur('company')}
                error={errors?.company}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Select Your Role
              </h2>
              <p className="font-body text-muted-foreground">
                Choose the role that best describes your involvement in renewable energy projects
              </p>
            </div>
            <RoleSelector
              selectedRole={formData?.role}
              onRoleChange={(role) => handleInputChange('role', role)}
              error={errors?.role}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Security Setup
              </h2>
              <p className="font-body text-muted-foreground">
                Create a strong password to secure your account
              </p>
            </div>
            <div className="space-y-6">
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                onBlur={() => handleBlur('password')}
                error={errors?.password}
                required
              />
              
              <PasswordStrengthIndicator 
                password={formData?.password}
                confirmPassword={formData?.confirmPassword}
              />
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                onBlur={() => handleBlur('confirmPassword')}
                error={errors?.confirmPassword}
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Additional Details
              </h2>
              <p className="font-body text-muted-foreground">
                Help us customize your experience with role-specific information
              </p>
            </div>
            <RoleSpecificFields
              role={formData?.role}
              formData={formData}
              onChange={handleInputChange}
              errors={errors}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                Review & Submit
              </h2>
              <p className="font-body text-muted-foreground">
                Review your information and agree to our terms
              </p>
            </div>
            {/* Account Summary */}
            <div className="bg-muted/30 rounded-lg p-6 space-y-4">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                Account Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-body font-medium text-muted-foreground">Name:</span>
                  <span className="font-body text-foreground ml-2">{formData?.fullName}</span>
                </div>
                <div>
                  <span className="font-body font-medium text-muted-foreground">Email:</span>
                  <span className="font-body text-foreground ml-2">{formData?.email}</span>
                </div>
                <div>
                  <span className="font-body font-medium text-muted-foreground">Phone:</span>
                  <span className="font-body text-foreground ml-2">{formData?.phone}</span>
                </div>
                <div>
                  <span className="font-body font-medium text-muted-foreground">Company:</span>
                  <span className="font-body text-foreground ml-2">{formData?.company}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-body font-medium text-muted-foreground">Role:</span>
                  <span className="font-body text-foreground ml-2 capitalize">{formData?.role}</span>
                </div>
              </div>
            </div>
            {/* Mock Credentials Display */}
            {formData?.role && mockCredentials?.[formData?.role] && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-heading font-semibold text-sm text-primary mb-2 flex items-center">
                  <Icon name="Key" size={16} className="mr-2" />
                  Demo Credentials for {formData?.role?.charAt(0)?.toUpperCase() + formData?.role?.slice(1)}
                </h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-body font-medium text-muted-foreground">Email:</span>
                    <span className="font-mono text-foreground ml-2">{mockCredentials?.[formData?.role]?.email}</span>
                  </div>
                  <div>
                    <span className="font-body font-medium text-muted-foreground">Password:</span>
                    <span className="font-mono text-foreground ml-2">{mockCredentials?.[formData?.role]?.password}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Terms and Privacy */}
            <div className="space-y-4">
              <Checkbox
                label="I agree to the Terms of Service"
                checked={formData?.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
                error={errors?.agreeToTerms}
                required
              />
              
              <Checkbox
                label="I agree to the Privacy Policy"
                checked={formData?.agreeToPrivacy}
                onChange={(e) => handleInputChange('agreeToPrivacy', e?.target?.checked)}
                error={errors?.agreeToPrivacy}
                required
              />
              
              <Checkbox
                label="I would like to receive marketing emails and updates"
                checked={formData?.marketingEmails}
                onChange={(e) => handleInputChange('marketingEmails', e?.target?.checked)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="guest" />
      <WorkflowBreadcrumbs />
      <main className="pt-4 pb-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg shadow-elevation-1 border border-border">
                {/* Progress Steps */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    {steps?.map((step, index) => (
                      <div key={step?.id} className="flex items-center">
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                          ${currentStep >= step?.id 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-border text-muted-foreground'
                          }
                        `}>
                          {currentStep > step?.id ? (
                            <Icon name="Check" size={20} />
                          ) : (
                            <Icon name={step?.icon} size={20} />
                          )}
                        </div>
                        
                        {index < steps?.length - 1 && (
                          <div className={`
                            w-8 h-0.5 mx-2 transition-colors duration-200
                            ${currentStep > step?.id ? 'bg-primary' : 'bg-border'}
                          `} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <span className="font-body text-sm text-muted-foreground">
                      Step {currentStep} of {steps?.length}: {steps?.[currentStep - 1]?.title}
                    </span>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="p-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      iconName="ChevronLeft"
                      iconPosition="left"
                    >
                      Previous
                    </Button>

                    {currentStep === steps?.length ? (
                      <Button
                        variant="default"
                        onClick={handleSubmit}
                        loading={isLoading}
                        iconName="UserPlus"
                        iconPosition="right"
                      >
                        Create Account
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={handleNext}
                        iconName="ChevronRight"
                        iconPosition="right"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrustSignals />
              
              {/* Help Section */}
              <div className="bg-card rounded-lg shadow-elevation-1 border border-border p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center">
                  <Icon name="HelpCircle" size={20} className="mr-2 text-primary" />
                  Need Help?
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <Icon name="MessageCircle" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-body font-medium text-foreground">Live Chat</div>
                      <div className="font-body text-muted-foreground">Available 24/7</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Icon name="Mail" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-body font-medium text-foreground">Email Support</div>
                      <div className="font-body text-muted-foreground">support@landinvest.pro</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Icon name="Phone" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-body font-medium text-foreground">Phone Support</div>
                      <div className="font-body text-muted-foreground">1-800-LAND-PRO</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Already Have Account */}
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <h4 className="font-heading font-semibold text-foreground mb-2">
                  Already have an account?
                </h4>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Sign in to access your dashboard and continue your projects.
                </p>
                <Button
                  variant="outline"
                  fullWidth
                  iconName="LogIn"
                  iconPosition="left"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <NotificationIndicator 
        notifications={notifications}
        position="top-right"
        maxVisible={3}
      />
      <QuickActions 
        userRole="guest"
        currentContext="registration"
        onActionComplete={(action) => {
          if (action === 'quick-register') {
            // Auto-fill demo data
            setFormData(prev => ({
              ...prev,
              fullName: 'John Smith',
              email: 'john.smith@example.com',
              phone: '+1 (555) 123-4567',
              company: 'Green Energy Solutions',
              role: 'landowner'
            }));
            setCurrentStep(2);
          }
        }}
      />
    </div>
  );
};

export default Register;