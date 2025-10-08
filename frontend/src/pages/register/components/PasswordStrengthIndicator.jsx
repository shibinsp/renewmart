import React from 'react';
import Icon from '../../../components/AppIcon';

const PasswordStrengthIndicator = ({ password, confirmPassword }) => {
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: pwd?.length >= 8,
      lowercase: /[a-z]/?.test(pwd),
      uppercase: /[A-Z]/?.test(pwd),
      numbers: /\d/?.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/?.test(pwd)
    };
    
    score = Object.values(checks)?.filter(Boolean)?.length;
    
    if (score <= 2) return { score, label: 'Weak', color: 'text-error' };
    if (score === 3) return { score, label: 'Fair', color: 'text-warning' };
    if (score === 4) return { score, label: 'Good', color: 'text-primary' };
    return { score, label: 'Strong', color: 'text-success' };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const requirements = [
    { label: 'At least 8 characters', met: password?.length >= 8 },
    { label: 'One lowercase letter', met: /[a-z]/?.test(password) },
    { label: 'One uppercase letter', met: /[A-Z]/?.test(password) },
    { label: 'One number', met: /\d/?.test(password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/?.test(password) }
  ];

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">Password Strength</span>
          <span className={`font-body text-sm font-medium ${strength?.color}`}>
            {strength?.label}
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5]?.map((level) => (
            <div
              key={level}
              className={`
                h-2 flex-1 rounded-full transition-colors duration-200
                ${level <= strength?.score 
                  ? strength?.score <= 2 ? 'bg-error' 
                    : strength?.score === 3 ? 'bg-warning'
                    : strength?.score === 4 ? 'bg-primary' :'bg-success' :'bg-muted'
                }
              `}
            />
          ))}
        </div>
      </div>
      {/* Requirements Checklist */}
      <div className="space-y-2">
        <span className="font-body text-sm text-muted-foreground">Requirements:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {requirements?.map((req, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Icon 
                name={req?.met ? "CheckCircle" : "Circle"} 
                size={14} 
                className={req?.met ? 'text-success' : 'text-muted-foreground'} 
              />
              <span className={`font-body text-xs ${req?.met ? 'text-success' : 'text-muted-foreground'}`}>
                {req?.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Password Match Indicator */}
      {confirmPassword && (
        <div className="flex items-center space-x-2">
          <Icon 
            name={passwordsMatch ? "CheckCircle" : "XCircle"} 
            size={16} 
            className={passwordsMatch ? 'text-success' : 'text-error'} 
          />
          <span className={`font-body text-sm ${passwordsMatch ? 'text-success' : 'text-error'}`}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;