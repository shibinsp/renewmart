import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const ProfileSettings = () => {
    const { user, updateUser } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await usersAPI.updateProfile(formData);

            // Update user context
            updateUser(response.data);

            setMessage({
                type: 'success',
                text: 'Profile updated successfully!'
            });
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to update profile'
            });
        } finally {
            setSaving(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Profile Settings', icon: 'User' }
    ];

    return (
        <>
            <Helmet>
                <title>Profile Settings - RenewMart</title>
                <meta name="description" content="Manage your profile settings and account information" />
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
                                                    <Icon name="User" size={20} className="text-primary" />
                                                </div>
                                                <div>
                                                    <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
                                                    <p className="text-muted-foreground">Manage your personal information and account details</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form */}
                                        <form onSubmit={handleSubmit} className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* First Name */}
                                                <div>
                                                    <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
                                                        First Name
                                                    </label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        type="text"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your first name"
                                                        required
                                                    />
                                                </div>

                                                {/* Last Name */}
                                                <div>
                                                    <label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-2">
                                                        Last Name
                                                    </label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        type="text"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your last name"
                                                        required
                                                    />
                                                </div>

                                                {/* Email */}
                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                                        Email Address
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your email address"
                                                        required
                                                    />
                                                </div>

                                                {/* Phone */}
                                                <div>
                                                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                                                        Phone Number
                                                    </label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>
                                            </div>

                                            {/* Message */}
                                            {message.text && (
                                                <div className={`mt-4 p-3 rounded-lg ${message.type === 'success'
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
                                            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-border">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => window.history.back()}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    loading={saving}
                                                    disabled={saving}
                                                >
                                                    {saving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Account Information */}
                                    <div className="mt-6 bg-card border border-border rounded-lg shadow-subtle">
                                        <div className="px-6 py-4 border-b border-border">
                                            <h2 className="text-lg font-semibold text-foreground">Account Information</h2>
                                            <p className="text-sm text-muted-foreground">View your account details and roles</p>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                        User ID
                                                    </label>
                                                    <p className="text-sm text-foreground font-mono">{user?.user_id}</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                        Account Status
                                                    </label>
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-2 h-2 rounded-full ${user?.is_active ? 'bg-success' : 'bg-error'
                                                            }`} />
                                                        <span className="text-sm text-foreground">
                                                            {user?.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                        Roles
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user?.roles?.map((role, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                            >
                                                                {role.replace('re_', '').replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                        Member Since
                                                    </label>
                                                    <p className="text-sm text-foreground">
                                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
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

export default ProfileSettings;
