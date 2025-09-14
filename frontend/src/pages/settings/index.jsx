import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';

const AccountSettings = () => {
    const { user } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [preferences, setPreferences] = useState({
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        security_alerts: true,
        project_updates: true,
        weekly_digest: true,
        dark_mode: false,
        language: 'en',
        timezone: 'UTC'
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        // Load user preferences from localStorage or API
        const savedPreferences = localStorage.getItem('user_preferences');
        if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences));
        }
    }, []);

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            // Save preferences to localStorage (in real app, save to API)
            localStorage.setItem('user_preferences', JSON.stringify(preferences));
            setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save preferences' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        try {
            // In real app, call password change API
            console.log('Changing password...');
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setSaving(false);
        }
    };

    const breadcrumbs = [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
        { label: 'Account Settings', icon: 'Settings' }
    ];

    return (
        <>
            <Helmet>
                <title>Account Settings - RenewMart</title>
                <meta name="description" content="Manage your account settings and preferences" />
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
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {/* Notification Settings */}
                                    <div className="bg-card border border-border rounded-lg shadow-subtle">
                                        <div className="px-6 py-4 border-b border-border">
                                            <div className="flex items-center space-x-3">
                                                <Icon name="Bell" size={20} className="text-primary" />
                                                <div>
                                                    <h2 className="text-lg font-semibold text-foreground">Notification Settings</h2>
                                                    <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">Email Notifications</label>
                                                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.email_notifications}
                                                    onChange={(checked) => handlePreferenceChange('email_notifications', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">SMS Notifications</label>
                                                    <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.sms_notifications}
                                                    onChange={(checked) => handlePreferenceChange('sms_notifications', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">Marketing Emails</label>
                                                    <p className="text-xs text-muted-foreground">Receive promotional content and updates</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.marketing_emails}
                                                    onChange={(checked) => handlePreferenceChange('marketing_emails', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">Security Alerts</label>
                                                    <p className="text-xs text-muted-foreground">Important security notifications</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.security_alerts}
                                                    onChange={(checked) => handlePreferenceChange('security_alerts', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">Project Updates</label>
                                                    <p className="text-xs text-muted-foreground">Updates about your projects</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.project_updates}
                                                    onChange={(checked) => handlePreferenceChange('project_updates', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">Weekly Digest</label>
                                                    <p className="text-xs text-muted-foreground">Weekly summary of activities</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.weekly_digest}
                                                    onChange={(checked) => handlePreferenceChange('weekly_digest', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Appearance Settings */}
                                    <div className="bg-card border border-border rounded-lg shadow-subtle">
                                        <div className="px-6 py-4 border-b border-border">
                                            <div className="flex items-center space-x-3">
                                                <Icon name="Palette" size={20} className="text-primary" />
                                                <div>
                                                    <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                                                    <p className="text-sm text-muted-foreground">Customize your interface</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">Dark Mode</label>
                                                    <p className="text-xs text-muted-foreground">Use dark theme</p>
                                                </div>
                                                <Checkbox
                                                    checked={preferences.dark_mode}
                                                    onChange={(checked) => handlePreferenceChange('dark_mode', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Settings */}
                                    <div className="bg-card border border-border rounded-lg shadow-subtle">
                                        <div className="px-6 py-4 border-b border-border">
                                            <div className="flex items-center space-x-3">
                                                <Icon name="Shield" size={20} className="text-primary" />
                                                <div>
                                                    <h2 className="text-lg font-semibold text-foreground">Security</h2>
                                                    <p className="text-sm text-muted-foreground">Manage your account security</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                <div>
                                                    <label htmlFor="current_password" className="block text-sm font-medium text-foreground mb-2">
                                                        Current Password
                                                    </label>
                                                    <Input
                                                        id="current_password"
                                                        name="current_password"
                                                        type="password"
                                                        value={passwordForm.current_password}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Enter current password"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="new_password" className="block text-sm font-medium text-foreground mb-2">
                                                        New Password
                                                    </label>
                                                    <Input
                                                        id="new_password"
                                                        name="new_password"
                                                        type="password"
                                                        value={passwordForm.new_password}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Enter new password"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <Input
                                                        id="confirm_password"
                                                        name="confirm_password"
                                                        type="password"
                                                        value={passwordForm.confirm_password}
                                                        onChange={handlePasswordChange}
                                                        placeholder="Confirm new password"
                                                        required
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    loading={saving}
                                                    disabled={saving}
                                                    variant="outline"
                                                >
                                                    {saving ? 'Changing...' : 'Change Password'}
                                                </Button>
                                            </form>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    {message.text && (
                                        <div className={`p-4 rounded-lg ${message.type === 'success'
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

                                    {/* Save Button */}
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSavePreferences}
                                            loading={saving}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save Settings'}
                                        </Button>
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

export default AccountSettings;
