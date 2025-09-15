import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';

const UserManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });

  const availableRoles = [
    { id: 'landowner', name: 'Landowner', description: 'Property owner seeking renewable energy opportunities' },
    { id: 'investor', name: 'Investor', description: 'Investment professional focused on renewable energy assets' },
    { id: 're_sales_advisor', name: 'RE Sales Advisor', description: 'Sales professional managing client relationships' },
    { id: 're_analyst', name: 'RE Analyst', description: 'Technical and financial analysis specialist' },
    { id: 'project_manager', name: 'Project Manager', description: 'Operations professional overseeing project development' },
    { id: 're_governance_lead', name: 'RE Governance Lead', description: 'Compliance and regulatory specialist' },
    { id: 'administrator', name: 'Administrator', description: 'System administrator with full access' }
  ];

  useEffect(() => {
    // Simulate loading users data
    const loadUsers = () => {
      setTimeout(() => {
        setUsers([
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@example.com',
            roles: ['landowner'],
            status: 'active',
            joinDate: '2024-01-15',
            lastLogin: '2024-01-20',
            properties: 3,
            investments: 0,
            avatar: null
          },
          {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@investment.com',
            roles: ['investor'],
            status: 'active',
            joinDate: '2024-01-10',
            lastLogin: '2024-01-19',
            properties: 0,
            investments: 5,
            avatar: null
          },
          {
            id: 3,
            name: 'Mike Chen',
            email: 'mike.chen@renewmart.com',
            roles: ['re_analyst', 'project_manager'],
            status: 'active',
            joinDate: '2023-12-01',
            lastLogin: '2024-01-20',
            properties: 0,
            investments: 0,
            avatar: null
          },
          {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@renewmart.com',
            roles: ['re_sales_advisor'],
            status: 'active',
            joinDate: '2023-11-15',
            lastLogin: '2024-01-18',
            properties: 0,
            investments: 0,
            avatar: null
          },
          {
            id: 5,
            name: 'Robert Wilson',
            email: 'robert.wilson@example.com',
            roles: ['landowner'],
            status: 'pending',
            joinDate: '2024-01-18',
            lastLogin: null,
            properties: 1,
            investments: 0,
            avatar: null
          },
          {
            id: 6,
            name: 'Lisa Anderson',
            email: 'lisa.anderson@renewmart.com',
            roles: ['re_governance_lead'],
            status: 'active',
            joinDate: '2023-10-20',
            lastLogin: '2024-01-19',
            properties: 0,
            investments: 0,
            avatar: null
          },
          {
            id: 7,
            name: 'David Brown',
            email: 'david.brown@investment.com',
            roles: ['investor'],
            status: 'inactive',
            joinDate: '2023-09-10',
            lastLogin: '2023-12-15',
            properties: 0,
            investments: 2,
            avatar: null
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadUsers();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || user.roles.includes(filters.role);
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditRoles = (user) => {
    setSelectedUser({ ...user });
    setShowRoleModal(true);
  };

  const handleRoleToggle = (roleId) => {
    if (!selectedUser) return;
    
    const updatedRoles = selectedUser.roles.includes(roleId)
      ? selectedUser.roles.filter(r => r !== roleId)
      : [...selectedUser.roles, roleId];
    
    setSelectedUser({ ...selectedUser, roles: updatedRoles });
  };

  const handleSaveRoles = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? { ...user, roles: selectedUser.roles }
        : user
    ));
    
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: newStatus }
        : user
    ));
  };

  const getRoleDisplayName = (roleId) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'inactive': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRoleColor = (roleId) => {
    const colors = {
      'landowner': 'text-green-600 bg-green-50',
      'investor': 'text-blue-600 bg-blue-50',
      're_sales_advisor': 'text-purple-600 bg-purple-50',
      're_analyst': 'text-orange-600 bg-orange-50',
      'project_manager': 'text-indigo-600 bg-indigo-50',
      're_governance_lead': 'text-red-600 bg-red-50',
      'administrator': 'text-gray-800 bg-gray-100'
    };
    return colors[roleId] || 'text-gray-600 bg-gray-50';
  };

  return (
    <>
      <Helmet>
        <title>User Management - RenewMart Admin</title>
        <meta name="description" content="Manage users and role assignments" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}>
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <BreadcrumbNavigation />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    User Management
                  </h1>
                  <p className="text-muted-foreground">
                    Manage user accounts and role assignments
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    {filteredUsers.length} users
                  </span>
                  <Button iconName="UserPlus">
                    Add User
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Search"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  iconName="Search"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Roles</option>
                    {availableRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">User</th>
                        <th className="text-left p-4 font-medium text-foreground">Roles</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-foreground">Activity</th>
                        <th className="text-left p-4 font-medium text-foreground">Stats</th>
                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-t border-border hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Icon name="User" size={20} className="text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((roleId) => (
                                <span key={roleId} className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(roleId)}`}>
                                  {getRoleDisplayName(roleId)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="text-foreground">Joined {user.joinDate}</div>
                              <div className="text-muted-foreground">
                                {user.lastLogin ? `Last login ${user.lastLogin}` : 'Never logged in'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="text-foreground">{user.properties} Properties</div>
                              <div className="text-muted-foreground">{user.investments} Investments</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                iconName="Settings"
                                onClick={() => handleEditRoles(user)}
                              >
                                Edit Roles
                              </Button>
                              <select
                                value={user.status}
                                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                className="px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters to find more users.</p>
              </div>
            )}
          </div>
        </main>

        {/* Role Assignment Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Edit Roles</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  iconName="X"
                  onClick={() => setShowRoleModal(false)}
                />
              </div>
              
              <div className="mb-4">
                <div className="font-medium text-foreground mb-2">{selectedUser.name}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>
              
              <div className="space-y-3 mb-6">
                {availableRoles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={role.id}
                      checked={selectedUser.roles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <div className="flex-1">
                      <label htmlFor={role.id} className="text-sm font-medium text-foreground cursor-pointer">
                        {role.name}
                      </label>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveRoles}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;