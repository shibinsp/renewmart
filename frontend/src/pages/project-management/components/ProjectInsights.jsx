import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProjectInsights = ({ insights }) => {
  const resourceData = [
    { name: 'Jan', allocated: 85, available: 15 },
    { name: 'Feb', allocated: 92, available: 8 },
    { name: 'Mar', allocated: 78, available: 22 },
    { name: 'Apr', allocated: 88, available: 12 },
    { name: 'May', allocated: 95, available: 5 },
    { name: 'Jun', allocated: 82, available: 18 }
  ];

  const statusData = [
    { name: 'Active', value: 12, color: '#10B981' },
    { name: 'Planning', value: 8, color: '#F59E0B' },
    { name: 'Development', value: 15, color: '#2D5A3D' },
    { name: 'Completed', value: 25, color: '#6B7280' }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      project: 'Solar Farm Alpha',
      task: 'Environmental Assessment',
      deadline: '2025-01-15',
      priority: 'high',
      daysLeft: 3
    },
    {
      id: 2,
      project: 'Wind Energy Beta',
      task: 'Grid Connection Approval',
      deadline: '2025-01-18',
      priority: 'medium',
      daysLeft: 6
    },
    {
      id: 3,
      project: 'Hydro Project Gamma',
      task: 'Final Design Review',
      deadline: '2025-01-22',
      priority: 'high',
      daysLeft: 10
    },
    {
      id: 4,
      project: 'Solar Farm Delta',
      task: 'Equipment Procurement',
      deadline: '2025-01-25',
      priority: 'low',
      daysLeft: 13
    }
  ];

  const teamAvailability = [
    { name: 'Sarah Chen', role: 'Project Manager', availability: 85, projects: 3 },
    { name: 'Michael Rodriguez', role: 'Engineer', availability: 92, projects: 2 },
    { name: 'Emily Johnson', role: 'Analyst', availability: 78, projects: 4 },
    { name: 'David Kim', role: 'Coordinator', availability: 88, projects: 3 },
    { name: 'Lisa Anderson', role: 'Specialist', availability: 95, projects: 2 }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getAvailabilityColor = (availability) => {
    if (availability >= 90) return 'text-success';
    if (availability >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Deadlines */}
      <div className="bg-card border border-border rounded-lg shadow-subtle">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Upcoming Deadlines</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {upcomingDeadlines?.map((deadline) => (
              <div key={deadline?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {deadline?.task}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline?.priority)}`}>
                      {deadline?.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{deadline?.project}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {deadline?.daysLeft} days
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(deadline.deadline)?.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Resource Allocation Chart */}
      <div className="bg-card border border-border rounded-lg shadow-subtle">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="BarChart3" size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Resource Allocation</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="allocated" fill="#2D5A3D" name="Allocated %" />
                <Bar dataKey="available" fill="#7FB069" name="Available %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Project Status Distribution */}
      <div className="bg-card border border-border rounded-lg shadow-subtle">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="PieChart" size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Project Status Distribution</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData?.map((item) => (
              <div key={item?.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item?.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {item?.name}: {item?.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Team Availability */}
      <div className="bg-card border border-border rounded-lg shadow-subtle">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Team Availability</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {teamAvailability?.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                    {member?.name?.split(' ')?.map(n => n?.[0])?.join('')}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{member?.name}</div>
                    <div className="text-xs text-muted-foreground">{member?.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getAvailabilityColor(member?.availability)}`}>
                    {member?.availability}% available
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member?.projects} active projects
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInsights;