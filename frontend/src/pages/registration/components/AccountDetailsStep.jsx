import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const AccountDetailsStep = ({ formData, setFormData, errors, setErrors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Password strength calculation
    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[A-Z]/?.test(password)) strength++;
    if (/[a-z]/?.test(password)) strength++;
    if (/[0-9]/?.test(password)) strength++;
    if (/[^A-Za-z0-9]/?.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2:
      case 3: return 'Medium';
      case 4:
      case 5: return 'Strong';
      default: return 'Weak';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-error';
      case 2:
      case 3: return 'bg-warning';
      case 4:
      case 5: return 'bg-success';
      default: return 'bg-error';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Account Details</h2>
        <p className="text-muted-foreground">Let's start with your basic information</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData?.firstName}
          onChange={(e) => handleInputChange('firstName', e?.target?.value)}
          error={errors?.firstName}
          required
        />

        <Input
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData?.lastName}
          onChange={(e) => handleInputChange('lastName', e?.target?.value)}
          error={errors?.lastName}
          required
        />
      </div>
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        value={formData?.email}
        onChange={(e) => handleInputChange('email', e?.target?.value)}
        error={errors?.email}
        description="We'll use this for account verification and important updates"
        required
      />
      <div className="space-y-2">
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>

        {/* Password Strength Indicator */}
        {formData?.password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Password strength:</span>
              <span className={`text-xs font-medium ${
                passwordStrength <= 1 ? 'text-error' : 
                passwordStrength <= 3 ? 'text-warning' : 'text-success'
              }`}>
                {getPasswordStrengthText()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Use 8+ characters with uppercase, lowercase, numbers, and symbols
            </div>
          </div>
        )}
      </div>
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        value={formData?.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
        error={errors?.confirmPassword}
        required
      />
      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        value={formData?.phone}
        onChange={(e) => handleInputChange('phone', e?.target?.value)}
        error={errors?.phone}
        description="For account security and important notifications"
        required
      />
    </div>
  );
};

export default AccountDetailsStep;