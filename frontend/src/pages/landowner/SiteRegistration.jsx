import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useWorkflow, WORKFLOW_STATES } from '../../contexts/WorkflowContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const SiteRegistration = () => {
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    // Basic Land Information
    title: '',
    location_text: '',
    coordinates: { lat: '', lng: '' },
    area_acres: '',
    land_type: '',
    energy_key: 'solar',
    
    // Development Details
    capacity_mw: '',
    price_per_mwh: '',
    timeline_text: '',
    contract_term_years: '',
    developer_name: '',
    
    // Additional Information
    admin_notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCoordinateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Site title is required';
    }
    if (!formData.location_text.trim()) {
      newErrors.location_text = 'Location is required';
    }
    if (!formData.area_acres || formData.area_acres <= 0) {
      newErrors.area_acres = 'Valid area in acres is required';
    }
    if (!formData.capacity_mw || formData.capacity_mw <= 0) {
      newErrors.capacity_mw = 'Valid capacity in MW is required';
    }
    if (!formData.price_per_mwh || formData.price_per_mwh <= 0) {
      newErrors.price_per_mwh = 'Valid price per MWh is required';
    }
    if (!formData.contract_term_years || formData.contract_term_years <= 0) {
      newErrors.contract_term_years = 'Valid contract term is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const workflowData = {
        ...formData,
        status: WORKFLOW_STATES.SUBMITTED,
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        },
        area_acres: parseFloat(formData.area_acres),
        capacity_mw: parseFloat(formData.capacity_mw),
        price_per_mwh: parseFloat(formData.price_per_mwh),
        contract_term_years: parseInt(formData.contract_term_years)
      };

      await createWorkflow(workflowData);
      
      setMessage({ 
        type: 'success', 
        text: 'Site registration submitted successfully! Admin will review and assign tasks.' 
      });
      
      // Redirect to status tracking after 2 seconds
      setTimeout(() => {
        navigate('/landowner/properties');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to submit registration' 
      });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Properties', path: '/landowner/properties', icon: 'MapPin' },
    { label: 'Site Registration', icon: 'Plus' }
  ];

  return (
    <>
      <Helmet>
        <title>Site Registration - RenewMart</title>
        <meta name="description" content="Register your land for renewable energy development" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="flex">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
            <div className="p-6">
              <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
              
              <div className="mt-6">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-card border border-border rounded-lg shadow-subtle">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="MapPin" size={20} className="text-primary" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-semibold text-foreground">Site Registration</h1>
                          <p className="text-muted-foreground">Register your land for renewable energy development</p>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                      {/* Basic Land Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Basic Land Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                              Site Title *
                            </label>
                            <Input
                              id="title"
                              name="title"
                              type="text"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="Enter site title"
                              error={errors.title}
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="land_type" className="block text-sm font-medium text-foreground mb-2">
                              Land Type
                            </label>
                            <select
                              id="land_type"
                              name="land_type"
                              value={formData.land_type}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Select land type</option>
                              <option value="agricultural">Agricultural</option>
                              <option value="industrial">Industrial</option>
                              <option value="commercial">Commercial</option>
                              <option value="residential">Residential</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="location_text" className="block text-sm font-medium text-foreground mb-2">
                            Location *
                          </label>
                          <Input
                            id="location_text"
                            name="location_text"
                            type="text"
                            value={formData.location_text}
                            onChange={handleInputChange}
                            placeholder="Enter full address or location description"
                            error={errors.location_text}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label htmlFor="area_acres" className="block text-sm font-medium text-foreground mb-2">
                              Area (Acres) *
                            </label>
                            <Input
                              id="area_acres"
                              name="area_acres"
                              type="number"
                              step="0.01"
                              value={formData.area_acres}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              error={errors.area_acres}
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="lat" className="block text-sm font-medium text-foreground mb-2">
                              Latitude
                            </label>
                            <Input
                              id="lat"
                              type="number"
                              step="any"
                              value={formData.coordinates.lat}
                              onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                              placeholder="0.000000"
                            />
                          </div>

                          <div>
                            <label htmlFor="lng" className="block text-sm font-medium text-foreground mb-2">
                              Longitude
                            </label>
                            <Input
                              id="lng"
                              type="number"
                              step="any"
                              value={formData.coordinates.lng}
                              onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                              placeholder="0.000000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Development Details */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Development Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="energy_key" className="block text-sm font-medium text-foreground mb-2">
                              Energy Type
                            </label>
                            <select
                              id="energy_key"
                              name="energy_key"
                              value={formData.energy_key}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="solar">Solar</option>
                              <option value="wind">Wind</option>
                              <option value="hydroelectric">Hydroelectric</option>
                              <option value="biomass">Biomass</option>
                              <option value="geothermal">Geothermal</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="capacity_mw" className="block text-sm font-medium text-foreground mb-2">
                              Capacity (MW) *
                            </label>
                            <Input
                              id="capacity_mw"
                              name="capacity_mw"
                              type="number"
                              step="0.01"
                              value={formData.capacity_mw}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              error={errors.capacity_mw}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="price_per_mwh" className="block text-sm font-medium text-foreground mb-2">
                              Price per MWh ($) *
                            </label>
                            <Input
                              id="price_per_mwh"
                              name="price_per_mwh"
                              type="number"
                              step="0.01"
                              value={formData.price_per_mwh}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              error={errors.price_per_mwh}
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="contract_term_years" className="block text-sm font-medium text-foreground mb-2">
                              Contract Term (Years) *
                            </label>
                            <Input
                              id="contract_term_years"
                              name="contract_term_years"
                              type="number"
                              value={formData.contract_term_years}
                              onChange={handleInputChange}
                              placeholder="0"
                              error={errors.contract_term_years}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="developer_name" className="block text-sm font-medium text-foreground mb-2">
                              Developer Name
                            </label>
                            <Input
                              id="developer_name"
                              name="developer_name"
                              type="text"
                              value={formData.developer_name}
                              onChange={handleInputChange}
                              placeholder="Enter developer name"
                            />
                          </div>

                          <div>
                            <label htmlFor="timeline_text" className="block text-sm font-medium text-foreground mb-2">
                              Timeline
                            </label>
                            <Input
                              id="timeline_text"
                              name="timeline_text"
                              type="text"
                              value={formData.timeline_text}
                              onChange={handleInputChange}
                              placeholder="e.g., 6-12 months"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                        
                        <div>
                          <label htmlFor="admin_notes" className="block text-sm font-medium text-foreground mb-2">
                            Additional Notes
                          </label>
                          <textarea
                            id="admin_notes"
                            name="admin_notes"
                            value={formData.admin_notes}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Any additional information about the site..."
                          />
                        </div>
                      </div>

                      {/* Message */}
                      {message.text && (
                        <div className={`p-4 rounded-lg ${
                          message.type === 'success' 
                            ? 'bg-success/10 text-success border border-success/20' 
                            : 'bg-error/10 text-error border border-error/20'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Icon 
                              name={message.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
                              size={16} 
                            />
                            <span className="text-sm font-medium">{message.text}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/landowner/properties')}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          loading={loading}
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SiteRegistration;
