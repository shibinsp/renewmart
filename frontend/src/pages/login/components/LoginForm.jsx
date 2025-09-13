import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    { value: 'landowner', label: 'Landowner', description: 'Property owner seeking renewable energy opportunities' },
    { value: 'investor', label: 'Investor', description: 'Investment professional focused on renewable energy assets' },
    { value: 're_sales_advisor', label: 'RE Sales Advisor', description: 'Sales professional managing client relationships' },
    { value: 're_analyst', label: 'RE Analyst', description: 'Technical and financial analysis specialist' },
    { value: 'project_manager', label: 'Project Manager', description: 'Operations professional overseeing project development' },
    { value: 're_governance_lead', label: 'RE Governance Lead', description: 'Compliance and regulatory specialist' },
    { value: 'administrator', label: 'Administrator', description: 'System administrator managing platform operations' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData?.role) {
      newErrors.role = 'Please select your role';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      await login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Navigation will be handled by AuthContext after successful login
      navigate('/dashboard');
    } catch (error) {
      // Handle specific error types
      if (error.message.includes('Invalid credentials')) {
        setErrors({ password: 'Invalid email or password' });
      } else if (error.message.includes('role')) {
        setErrors({ role: 'Selected role does not match your account' });
      } else if (error.message.includes('email')) {
        setErrors({ email: 'No account found with this email address' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your RenewMart account</p>
      </div>
      
      {/* General Error Display */}
      {errors?.general && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-2" />
            {errors.general}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
          disabled={loading}
        />

        {/* Password Input */}
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
            disabled={loading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>

        {/* Role Selection */}
        <Select
          label="Select Your Role"
          placeholder="Choose your role"
          options={roleOptions}
          value={formData?.role}
          onChange={(value) => handleInputChange('role', value)}
          error={errors?.role}
          required
          disabled={loading}
          searchable
        />

        {/* Remember Me */}
        <Checkbox
          label="Remember me for 30 days"
          checked={formData?.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
          disabled={loading}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={loading}
          iconName="LogIn"
          iconPosition="right"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Alternative Actions */}
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-primary hover:text-primary/80 font-medium transition-smooth"
            disabled={loading}
          >
            Forgot Password?
          </button>
          <button
            type="button"
            onClick={() => navigate('/registration')}
            className="text-primary hover:text-primary/80 font-medium transition-smooth"
            disabled={loading}
          >
            Create Account
          </button>
        </div>
      </form>
      {/* Demo Credentials Info */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
          <Icon name="Info" size={14} className="mr-2" />
          Demo Credentials - Click to Auto-Fill
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'landowner@renewmart.com',
                password: 'Land2024!',
                role: 'landowner',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-green-600">Landowner:</strong> landowner@renewmart.com / Land2024!
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'investor@renewmart.com',
                password: 'Invest2024!',
                role: 'investor',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-blue-600">Investor:</strong> investor@renewmart.com / Invest2024!
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'admin@renewmart.com',
                password: 'Admin2024!',
                role: 'administrator',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-purple-600">Administrator:</strong> admin@renewmart.com / Admin2024!
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'sales@renewmart.com',
                password: 'Sales2024!',
                role: 're_sales_advisor',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-orange-600">RE Sales Advisor:</strong> sales@renewmart.com / Sales2024!
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'analyst@renewmart.com',
                password: 'Analyst2024!',
                role: 're_analyst',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-cyan-600">RE Analyst:</strong> analyst@renewmart.com / Analyst2024!
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'manager@renewmart.com',
                password: 'Manager2024!',
                role: 'project_manager',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-indigo-600">Project Manager:</strong> manager@renewmart.com / Manager2024!
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: 'governance@renewmart.com',
                password: 'Gov2024!',
                role: 're_governance_lead',
                rememberMe: false
              });
              setErrors({});
            }}
            className="w-full text-left p-2 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
            disabled={loading}
          >
            <strong className="text-red-600">RE Governance Lead:</strong> governance@renewmart.com / Gov2024!
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Click any credential above to automatically fill the login form
        </p>
      </div>
    </div>
  );
};

export default LoginForm;