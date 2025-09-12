import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const RegistrationHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <Link to="/dashboard" className="inline-flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="Zap" size={24} color="white" />
        </div>
        <span className="text-2xl font-bold text-foreground">RenewMart</span>
      </Link>

      {/* Header Content */}
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Join the Energy Revolution
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        Create your account to access the leading renewable energy marketplace and project management platform
      </p>
    </div>
  );
};

export default RegistrationHeader;