import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProjectChart = () => {
  const projectData = [
    { month: 'Jan', completed: 12, inProgress: 8, planned: 15 },
    { month: 'Feb', completed: 15, inProgress: 12, planned: 18 },
    { month: 'Mar', completed: 18, inProgress: 15, planned: 22 },
    { month: 'Apr', completed: 22, inProgress: 18, planned: 25 },
    { month: 'May', completed: 25, inProgress: 20, planned: 28 },
    { month: 'Jun', completed: 28, inProgress: 22, planned: 30 }
  ];

  const statusData = [
    { name: 'Completed', value: 45, color: '#10B981' },
    { name: 'In Progress', value: 30, color: '#2D5A3D' },
    { name: 'Planning', value: 25, color: '#7FB069' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Project Overview</h3>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md">
            6M
          </button>
          <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md">
            1Y
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Monthly Project Progress</h4>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="completed" fill="#10B981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="inProgress" fill="#2D5A3D" radius={[2, 2, 0, 0]} />
                <Bar dataKey="planned" fill="#7FB069" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Project Status Distribution</h4>
          <div className="w-full h-64">
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
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {statusData?.map((item) => (
              <div key={item?.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item?.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item?.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectChart;