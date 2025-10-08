import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProjectDetailsForm = ({ 
  projectDetails, 
  onProjectDetailsChange, 
  errors = {} 
}) => {
  const projectTypes = [
    { value: 'solar', label: 'Solar Energy' },
    { value: 'wind', label: 'Wind Energy' },
    { value: 'hydroelectric', label: 'Hydroelectric' },
    { value: 'biomass', label: 'Biomass' },
    { value: 'geothermal', label: 'Geothermal' }
  ];

  const timelineOptions = [
    { value: '6-months', label: '6 Months' },
    { value: '12-months', label: '12 Months' },
    { value: '18-months', label: '18 Months' },
    { value: '24-months', label: '24 Months' },
    { value: '36-months', label: '36+ Months' }
  ];

  const contractDurationOptions = [
    { value: '10-years', label: '10 Years' },
    { value: '15-years', label: '15 Years' },
    { value: '20-years', label: '20 Years' },
    { value: '25-years', label: '25 Years' },
    { value: '30-years', label: '30 Years' }
  ];

  const handleInputChange = (field, value) => {
    onProjectDetailsChange({
      ...projectDetails,
      [field]: value
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-heading font-semibold text-sm">1</span>
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Project Details
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Basic information about your renewable energy project
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Input
          label="Project Name"
          type="text"
          placeholder="Enter project name"
          value={projectDetails?.projectName || ''}
          onChange={(e) => handleInputChange('projectName', e?.target?.value)}
          error={errors?.projectName}
          required
          className="lg:col-span-2"
        />

        <Input
          label="Location"
          type="text"
          placeholder="City, State, Country"
          value={projectDetails?.location || ''}
          onChange={(e) => handleInputChange('location', e?.target?.value)}
          error={errors?.location}
          required
        />

        <Input
          label="Land Area (Acres)"
          type="number"
          placeholder="Enter total land area"
          value={projectDetails?.landArea || ''}
          onChange={(e) => handleInputChange('landArea', e?.target?.value)}
          error={errors?.landArea}
          required
        />

        <Select
          label="Project Type"
          placeholder="Select renewable energy type"
          options={projectTypes}
          value={projectDetails?.projectType || ''}
          onChange={(value) => handleInputChange('projectType', value)}
          error={errors?.projectType}
          required
        />

        <Input
          label="Capacity (MW)"
          type="number"
          placeholder="Expected capacity in MW"
          value={projectDetails?.capacity || ''}
          onChange={(e) => handleInputChange('capacity', e?.target?.value)}
          error={errors?.capacity}
          required
        />

        <Input
          label="Price per MWh (USD)"
          type="number"
          placeholder="Enter price per MWh"
          value={projectDetails?.pricePerMWh || ''}
          onChange={(e) => handleInputChange('pricePerMWh', e?.target?.value)}
          error={errors?.pricePerMWh}
          required
        />

        <Select
          label="Implementation Timeline"
          placeholder="Select expected timeline"
          options={timelineOptions}
          value={projectDetails?.timeline || ''}
          onChange={(value) => handleInputChange('timeline', value)}
          error={errors?.timeline}
          required
        />

        <Select
          label="Contract Duration"
          placeholder="Select contract duration"
          options={contractDurationOptions}
          value={projectDetails?.contractDuration || ''}
          onChange={(value) => handleInputChange('contractDuration', value)}
          error={errors?.contractDuration}
          required
        />

        <Input
          label="Potential Partners"
          type="text"
          placeholder="List any potential partners (optional)"
          value={projectDetails?.partners || ''}
          onChange={(e) => handleInputChange('partners', e?.target?.value)}
          className="lg:col-span-2"
        />

        <div className="lg:col-span-2">
          <label className="font-body font-medium text-sm text-foreground mb-3 block">
            Project Description
          </label>
          <textarea
            className="w-full min-h-[120px] p-3 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
            placeholder="Provide a detailed description of your renewable energy project, including any unique features or advantages..."
            value={projectDetails?.description || ''}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
          />
          {errors?.description && (
            <p className="font-caption text-xs text-error mt-1">{errors?.description}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <Checkbox
            label="I confirm that all project details are accurate and complete"
            checked={projectDetails?.detailsConfirmed || false}
            onChange={(e) => handleInputChange('detailsConfirmed', e?.target?.checked)}
            error={errors?.detailsConfirmed}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsForm;