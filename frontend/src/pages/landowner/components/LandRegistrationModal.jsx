import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { landsAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const LandRegistrationModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    location_text: '',
    area_acres: '',
    land_type: '',
    
    // Energy Information
    energy_key: 'solar',
    capacity_mw: '',
    price_per_mwh: '',
    timeline_text: '',
    contract_term_years: '',
    
    // Additional Information
    developer_name: '',
    coordinates: { lat: '', lng: '' },
    admin_notes: ''
  });

  const energyTypes = [
    { key: 'solar', label: 'Solar Energy' },
    { key: 'wind', label: 'Wind Energy' },
    { key: 'hydro', label: 'Hydroelectric' },
    { key: 'biomass', label: 'Biomass' },
    { key: 'geothermal', label: 'Geothermal' }
  ];

  const landTypes = [
    'Agricultural',
    'Residential',
    'Commercial',
    'Industrial',
    'Vacant/Undeveloped',
    'Mixed Use',
    'Other'
  ];

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Land details and location' },
    { number: 2, title: 'Energy Specifications', description: 'Renewable energy details' },
    { number: 3, title: 'Additional Details', description: 'Coordinates and notes' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCoordinateChange = (coord, value) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [coord]: value
      }
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Land title is required';
      if (!formData.location_text.trim()) newErrors.location_text = 'Location is required';
      if (!formData.area_acres || parseFloat(formData.area_acres) <= 0) {
        newErrors.area_acres = 'Valid area in acres is required';
      }
      if (!formData.land_type) newErrors.land_type = 'Land type is required';
    }
    
    if (step === 2) {
      if (!formData.energy_key) newErrors.energy_key = 'Energy type is required';
      if (!formData.capacity_mw || parseFloat(formData.capacity_mw) <= 0) {
        newErrors.capacity_mw = 'Valid capacity in MW is required';
      }
      if (!formData.price_per_mwh || parseFloat(formData.price_per_mwh) <= 0) {
        newErrors.price_per_mwh = 'Valid price per MWh is required';
      }
      if (!formData.contract_term_years || parseInt(formData.contract_term_years) <= 0) {
        newErrors.contract_term_years = 'Valid contract term is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // Prepare the data for submission
      const landData = {
        title: formData.title,
        location_text: formData.location_text,
        area_acres: parseFloat(formData.area_acres),
        land_type: formData.land_type,
        energy_key: formData.energy_key,
        capacity_mw: parseFloat(formData.capacity_mw),
        price_per_mwh: parseFloat(formData.price_per_mwh),
        timeline_text: formData.timeline_text,
        contract_term_years: parseInt(formData.contract_term_years),
        developer_name: formData.developer_name || null,
        admin_notes: formData.admin_notes || null,
        coordinates: (formData.coordinates.lat && formData.coordinates.lng) ? {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        } : null
      };
      
      await landsAPI.createLand(landData);
      onSuccess();
    } catch (error) {
      console.error('Failed to register land:', error);
      setErrors({ 
        general: error.response?.data?.detail || 'Failed to register land. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Land Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your land"
                error={errors.title}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location *
              </label>
              <Input
                value={formData.location_text}
                onChange={(e) => handleInputChange('location_text', e.target.value)}
                placeholder="City, State, Country or detailed address"
                error={errors.location_text}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Area (Acres) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.area_acres}
                  onChange={(e) => handleInputChange('area_acres', e.target.value)}
                  placeholder="0.00"
                  error={errors.area_acres}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Land Type *
                </label>
                <select
                  value={formData.land_type}
                  onChange={(e) => handleInputChange('land_type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                    errors.land_type ? 'border-red-500' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                >
                  <option value="">Select land type</option>
                  {landTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.land_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.land_type}</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Energy Type *
              </label>
              <select
                value={formData.energy_key}
                onChange={(e) => handleInputChange('energy_key', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-background text-foreground ${
                  errors.energy_key ? 'border-red-500' : 'border-border'
                } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
              >
                {energyTypes.map(type => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
              {errors.energy_key && (
                <p className="text-red-500 text-sm mt-1">{errors.energy_key}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Planned Capacity (MW) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.capacity_mw}
                  onChange={(e) => handleInputChange('capacity_mw', e.target.value)}
                  placeholder="0.0"
                  error={errors.capacity_mw}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price per MWh ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_mwh}
                  onChange={(e) => handleInputChange('price_per_mwh', e.target.value)}
                  placeholder="0.00"
                  error={errors.price_per_mwh}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contract Term (Years) *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.contract_term_years}
                  onChange={(e) => handleInputChange('contract_term_years', e.target.value)}
                  placeholder="25"
                  error={errors.contract_term_years}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Developer/Partner Name
                </label>
                <Input
                  value={formData.developer_name}
                  onChange={(e) => handleInputChange('developer_name', e.target.value)}
                  placeholder="Optional developer name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Implementation Timeline
              </label>
              <textarea
                value={formData.timeline_text}
                onChange={(e) => handleInputChange('timeline_text', e.target.value)}
                placeholder="Describe the expected timeline for development..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                GPS Coordinates (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="any"
                  value={formData.coordinates.lat}
                  onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                  placeholder="Latitude (e.g., 40.7128)"
                />
                <Input
                  type="number"
                  step="any"
                  value={formData.coordinates.lng}
                  onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                  placeholder="Longitude (e.g., -74.0060)"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Providing coordinates helps investors locate your property more easily
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                placeholder="Any additional information about the land, special conditions, or requirements..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Register New Land</h2>
            <p className="text-muted-foreground mt-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.number 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.number ? (
                    <Icon name="Check" className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
                <Icon name="ChevronRight" className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <Icon name="Check" className="w-4 h-4 mr-2" />
                    Register Land
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandRegistrationModal;