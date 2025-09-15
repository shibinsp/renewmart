import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const VerificationStep = ({ formData, onComplete, errors }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    // Simulate sending verification email on component mount
    setVerificationSent(true);
    setResendCooldown(60);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyCode = async () => {
    if (!verificationCode?.trim()) return;

    setIsVerifying(true);
    
    // For demo purposes, accept any 6-digit code or skip verification
    if (verificationCode.length >= 6 || verificationCode === 'skip') {
      await onComplete();
    } else {
      alert('Please enter a 6-digit verification code or type "skip" to proceed.');
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    
    setVerificationSent(true);
    setResendCooldown(60);
    setVerificationCode('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Mail" size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Verify Your Email</h2>
        <p className="text-muted-foreground">
          We've sent a verification code to <strong>{formData?.email}</strong>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          For demo purposes, enter any 6-digit code or type "skip"
        </p>
      </div>
      
      {errors?.general && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="AlertCircle" size={20} className="text-error" />
            <p className="text-sm text-error">{errors.general}</p>
          </div>
        </div>
      )}
      
      {verificationSent && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <div>
              <p className="text-sm font-medium text-success">Verification email sent!</p>
              <p className="text-xs text-success/80">Check your inbox and spam folder</p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <Input
          label="Verification Code"
          type="text"
          placeholder="Enter 6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e?.target?.value?.replace(/\D/g, '')?.slice(0, 6))}
          description="Enter the 6-digit code sent to your email"
          maxLength={6}
        />

        <Button
          onClick={handleVerifyCode}
          loading={isVerifying}
          disabled={!verificationCode?.trim()}
          fullWidth
          iconName="Shield"
          iconPosition="left"
        >
          {isVerifying ? 'Creating Account...' : 'Complete Registration'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
            iconName="RefreshCw"
            iconPosition="left"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </Button>
        </div>
      </div>
      {/* Demo Instructions */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Demo Instructions</p>
            <p>For demonstration purposes, use verification code: <strong className="text-foreground">123456</strong></p>
          </div>
        </div>
      </div>
      {/* Account Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="text-foreground font-medium">{formData?.firstName} {formData?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="text-foreground font-medium">{formData?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span className="text-foreground font-medium capitalize">{formData?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company:</span>
            <span className="text-foreground font-medium">{formData?.companyName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStep;