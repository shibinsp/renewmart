import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RoleSpecificFields = ({ role, formData, onChange, errors }) => {
  const investmentFocusOptions = [
    { value: 'solar', label: 'Solar Energy' },
    { value: 'wind', label: 'Wind Energy' },
    { value: 'hydroelectric', label: 'Hydroelectric' },
    { value: 'biomass', label: 'Biomass' },
    { value: 'geothermal', label: 'Geothermal' },
    { value: 'mixed', label: 'Mixed Portfolio' }
  ];

  const portfolioSizeOptions = [
    { value: 'small', label: 'Small (1-50 acres)' },
    { value: 'medium', label: 'Medium (51-200 acres)' },
    { value: 'large', label: 'Large (201-500 acres)' },
    { value: 'enterprise', label: 'Enterprise (500+ acres)' }
  ];

  const departmentOptions = [
    { value: 'compliance', label: 'Compliance & Regulatory' },
    { value: 'technical', label: 'Technical Review' },
    { value: 'financial', label: 'Financial Analysis' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'sales', label: 'Sales & Business Development' },
    { value: 'governance', label: 'Governance & Risk' }
  ];

  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive Level (10+ years)' }
  ];

  if (!role) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {role === 'landowner' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Property Location"
              type="text"
              placeholder="City, State"
              value={formData?.propertyLocation || ''}
              onChange={(e) => onChange('propertyLocation', e?.target?.value)}
              error={errors?.propertyLocation}
              description="Primary location of your land holdings"
            />
            
            <Select
              label="Portfolio Size"
              options={portfolioSizeOptions}
              value={formData?.portfolioSize || ''}
              onChange={(value) => onChange('portfolioSize', value)}
              error={errors?.portfolioSize}
              placeholder="Select portfolio size"
            />
          </div>

          <Input
            label="Total Acreage"
            type="number"
            placeholder="Enter total acres"
            value={formData?.totalAcreage || ''}
            onChange={(e) => onChange('totalAcreage', e?.target?.value)}
            error={errors?.totalAcreage}
            description="Approximate total acreage available for development"
          />

          <Input
            label="Current Land Use"
            type="text"
            placeholder="e.g., Agricultural, Vacant, Commercial"
            value={formData?.currentLandUse || ''}
            onChange={(e) => onChange('currentLandUse', e?.target?.value)}
            error={errors?.currentLandUse}
            description="How is the land currently being utilized?"
          />
        </>
      )}
      {role === 'investor' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Investment Firm"
              type="text"
              placeholder="Company or fund name"
              value={formData?.investmentFirm || ''}
              onChange={(e) => onChange('investmentFirm', e?.target?.value)}
              error={errors?.investmentFirm}
              description="Name of your investment company or fund"
            />
            
            <Select
              label="Investment Focus"
              options={investmentFocusOptions}
              value={formData?.investmentFocus || ''}
              onChange={(value) => onChange('investmentFocus', value)}
              error={errors?.investmentFocus}
              placeholder="Select focus area"
              multiple
              searchable
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Investment (USD)"
              type="number"
              placeholder="e.g., 1000000"
              value={formData?.minInvestment || ''}
              onChange={(e) => onChange('minInvestment', e?.target?.value)}
              error={errors?.minInvestment}
              description="Minimum project investment amount"
            />
            
            <Input
              label="Maximum Investment (USD)"
              type="number"
              placeholder="e.g., 50000000"
              value={formData?.maxInvestment || ''}
              onChange={(e) => onChange('maxInvestment', e?.target?.value)}
              error={errors?.maxInvestment}
              description="Maximum project investment amount"
            />
          </div>

          <Input
            label="Geographic Preference"
            type="text"
            placeholder="e.g., Midwest, California, National"
            value={formData?.geographicPreference || ''}
            onChange={(e) => onChange('geographicPreference', e?.target?.value)}
            error={errors?.geographicPreference}
            description="Preferred regions for investment opportunities"
          />
        </>
      )}
      {role === 'admin' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Department"
              options={departmentOptions}
              value={formData?.department || ''}
              onChange={(value) => onChange('department', value)}
              error={errors?.department}
              placeholder="Select department"
            />
            
            <Select
              label="Experience Level"
              options={experienceLevelOptions}
              value={formData?.experienceLevel || ''}
              onChange={(value) => onChange('experienceLevel', value)}
              error={errors?.experienceLevel}
              placeholder="Select experience level"
            />
          </div>

          <Input
            label="Professional Certifications"
            type="text"
            placeholder="e.g., CPA, PE, PMP, LEED AP"
            value={formData?.certifications || ''}
            onChange={(e) => onChange('certifications', e?.target?.value)}
            error={errors?.certifications}
            description="Relevant professional certifications (comma-separated)"
          />

          <Input
            label="Years in Renewable Energy"
            type="number"
            placeholder="Enter years of experience"
            value={formData?.renewableExperience || ''}
            onChange={(e) => onChange('renewableExperience', e?.target?.value)}
            error={errors?.renewableExperience}
            description="Years of experience in renewable energy sector"
          />
        </>
      )}
    </div>
  );
};

export default RoleSpecificFields;