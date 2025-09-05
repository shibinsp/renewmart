import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CompanyInformationStep = ({ formData, setFormData, errors, setErrors }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const companySizeOptions = [
    { value: 'startup', label: '1-10 employees' },
    { value: 'small', label: '11-50 employees' },
    { value: 'medium', label: '51-200 employees' },
    { value: 'large', label: '201-1000 employees' },
    { value: 'enterprise', label: '1000+ employees' }
  ];

  const portfolioSizeOptions = [
    { value: 'under_1m', label: 'Under $1M' },
    { value: '1m_10m', label: '$1M - $10M' },
    { value: '10m_50m', label: '$10M - $50M' },
    { value: '50m_100m', label: '$50M - $100M' },
    { value: 'over_100m', label: 'Over $100M' }
  ];

  const propertyTypeOptions = [
    { value: 'agricultural', label: 'Agricultural Land' },
    { value: 'commercial', label: 'Commercial Property' },
    { value: 'residential', label: 'Residential Property' },
    { value: 'industrial', label: 'Industrial Land' },
    { value: 'vacant', label: 'Vacant Land' }
  ];

  const certificationOptions = [
    { value: 'nabcep', label: 'NABCEP Certified' },
    { value: 'irec', label: 'IREC Certified' },
    { value: 'leed', label: 'LEED Accredited' },
    { value: 'pmp', label: 'PMP Certified' },
    { value: 'other', label: 'Other Certification' }
  ];

  const renderRoleSpecificFields = () => {
    switch (formData?.role) {
      case 'investor':
        return (
          <div className="space-y-4">
            <Select
              label="Portfolio Size"
              placeholder="Select your investment portfolio size"
              options={portfolioSizeOptions}
              value={formData?.portfolioSize}
              onChange={(value) => handleInputChange('portfolioSize', value)}
              error={errors?.portfolioSize}
              required
            />
            <Input
              label="Investment Focus"
              type="text"
              placeholder="e.g., Solar, Wind, Hydroelectric"
              value={formData?.investmentFocus}
              onChange={(e) => handleInputChange('investmentFocus', e?.target?.value)}
              error={errors?.investmentFocus}
              description="Primary renewable energy sectors of interest"
            />
          </div>
        );

      case 'landowner':
        return (
          <div className="space-y-4">
            <Select
              label="Property Type"
              placeholder="Select your property type"
              options={propertyTypeOptions}
              value={formData?.propertyType}
              onChange={(value) => handleInputChange('propertyType', value)}
              error={errors?.propertyType}
              required
            />
            <Input
              label="Property Size (acres)"
              type="number"
              placeholder="Enter property size"
              value={formData?.propertySize}
              onChange={(e) => handleInputChange('propertySize', e?.target?.value)}
              error={errors?.propertySize}
              description="Total acreage available for renewable energy development"
            />
            <Input
              label="Property Location"
              type="text"
              placeholder="City, State"
              value={formData?.propertyLocation}
              onChange={(e) => handleInputChange('propertyLocation', e?.target?.value)}
              error={errors?.propertyLocation}
              required
            />
          </div>
        );

      case 'sales_advisor': case'analyst':
        return (
          <div className="space-y-4">
            <Select
              label="Certifications"
              placeholder="Select your certifications"
              options={certificationOptions}
              value={formData?.certifications}
              onChange={(value) => handleInputChange('certifications', value)}
              error={errors?.certifications}
              multiple
              searchable
            />
            <Input
              label="Years of Experience"
              type="number"
              placeholder="Enter years of experience"
              value={formData?.experience}
              onChange={(e) => handleInputChange('experience', e?.target?.value)}
              error={errors?.experience}
              description="Years of experience in renewable energy sector"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Company Information</h2>
        <p className="text-muted-foreground">Tell us about your organization and background</p>
      </div>
      <div className="space-y-4">
        <Input
          label="Company Name"
          type="text"
          placeholder="Enter your company name"
          value={formData?.companyName}
          onChange={(e) => handleInputChange('companyName', e?.target?.value)}
          error={errors?.companyName}
          required
        />

        <Input
          label="Job Title"
          type="text"
          placeholder="Enter your job title"
          value={formData?.jobTitle}
          onChange={(e) => handleInputChange('jobTitle', e?.target?.value)}
          error={errors?.jobTitle}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Company Size"
            placeholder="Select company size"
            options={companySizeOptions}
            value={formData?.companySize}
            onChange={(value) => handleInputChange('companySize', value)}
            error={errors?.companySize}
            required
          />

          <Input
            label="Website"
            type="url"
            placeholder="https://www.company.com"
            value={formData?.website}
            onChange={(e) => handleInputChange('website', e?.target?.value)}
            error={errors?.website}
          />
        </div>

        <Input
          label="Company Address"
          type="text"
          placeholder="Enter company address"
          value={formData?.address}
          onChange={(e) => handleInputChange('address', e?.target?.value)}
          error={errors?.address}
          required
        />

        {/* Role-specific fields */}
        {renderRoleSpecificFields()}

        <div className="space-y-4 pt-4 border-t border-border">
          <Checkbox
            label="I agree to receive marketing communications"
            checked={formData?.marketingConsent}
            onChange={(e) => handleInputChange('marketingConsent', e?.target?.checked)}
            description="You can unsubscribe at any time"
          />

          <Checkbox
            label="I would like to receive industry updates and insights"
            checked={formData?.industryUpdates}
            onChange={(e) => handleInputChange('industryUpdates', e?.target?.checked)}
            description="Weekly newsletter with renewable energy market trends"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationStep;