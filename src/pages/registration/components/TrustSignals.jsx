import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const certifications = [
    { name: 'SOC 2 Type II', icon: 'Shield', description: 'Security & Privacy' },
    { name: 'SSL Encrypted', icon: 'Lock', description: 'Data Protection' },
    { name: 'NABCEP Member', icon: 'Award', description: 'Industry Standards' },
    { name: 'IREC Certified', icon: 'CheckCircle', description: 'Quality Assurance' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Solar Project Manager',
      company: 'GreenTech Solutions',
      content: `RenewMart streamlined our entire project lifecycle. We've reduced development time by 40% and improved stakeholder communication significantly.`,
      rating: 5
    },
    {
      name: 'Michael Chen',role: 'Investment Director',company: 'Clean Energy Capital',
      content: `The marketplace has connected us with high-quality renewable energy opportunities. The due diligence tools are exceptional.`,
      rating: 5
    },
    {
      name: 'Emily Rodriguez',role: 'Landowner',company: 'Rodriguez Family Farm',
      content: `As a landowner, RenewMart made it easy to understand and participate in renewable energy development. Great support team!`,
      rating: 5
    }
  ];

  const statistics = [
    { value: '10,000+', label: 'Active Users', icon: 'Users' },
    { value: '$2.5B+', label: 'Projects Facilitated', icon: 'TrendingUp' },
    { value: '500+', label: 'Completed Projects', icon: 'CheckCircle' },
    { value: '99.9%', label: 'Uptime', icon: 'Activity' }
  ];

  return (
    <div className="space-y-8">
      {/* Security Certifications */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Security & Certifications</h3>
        <div className="grid grid-cols-2 gap-3">
          {certifications?.map((cert, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
              <Icon name={cert?.icon} size={16} className="text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">{cert?.name}</div>
                <div className="text-xs text-muted-foreground">{cert?.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Platform Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Platform Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          {statistics?.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-primary/5 rounded-lg">
              <Icon name={stat?.icon} size={20} className="text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{stat?.value}</div>
              <div className="text-xs text-muted-foreground">{stat?.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* User Testimonials */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">What Our Users Say</h3>
        <div className="space-y-4">
          {testimonials?.map((testimonial, index) => (
            <div key={index} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(testimonial?.rating)]?.map((_, i) => (
                  <Icon key={i} name="Star" size={14} className="text-warning fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3 italic">
                "{testimonial?.content}"
              </p>
              <div>
                <div className="text-sm font-medium text-foreground">{testimonial?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {testimonial?.role} at {testimonial?.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Support Information */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="HelpCircle" size={16} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">Need Help?</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Our support team is available 24/7 to assist with your registration and onboarding.
            </p>
            <div className="flex items-center space-x-4 text-xs text-primary">
              <span className="flex items-center space-x-1">
                <Icon name="Mail" size={12} />
                <span>support@renewmart.com</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="Phone" size={12} />
                <span>1-800-RENEW-01</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;