import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectsTable = () => {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const projects = [
    {
      id: 1,
      name: 'Solar Farm Project Alpha',
      type: 'Solar',
      capacity: '50MW',
      location: 'California, USA',
      status: 'In Progress',
      progress: 75,
      startDate: '2024-01-15',
      expectedCompletion: '2024-12-30',
      investment: '$45M',
      roi: '12.5%'
    },
    {
      id: 2,
      name: 'Wind Energy Project Beta',
      type: 'Wind',
      capacity: '100MW',
      location: 'Texas, USA',
      status: 'Planning',
      progress: 25,
      startDate: '2024-03-01',
      expectedCompletion: '2025-06-15',
      investment: '$85M',
      roi: '14.2%'
    },
    {
      id: 3,
      name: 'Hydroelectric Project Gamma',
      type: 'Hydro',
      capacity: '25MW',
      location: 'Oregon, USA',
      status: 'Completed',
      progress: 100,
      startDate: '2023-06-01',
      expectedCompletion: '2024-11-30',
      investment: '$32M',
      roi: '11.8%'
    },
    {
      id: 4,
      name: 'Solar Rooftop Initiative',
      type: 'Solar',
      capacity: '15MW',
      location: 'Arizona, USA',
      status: 'In Progress',
      progress: 60,
      startDate: '2024-02-20',
      expectedCompletion: '2024-12-15',
      investment: '$18M',
      roi: '13.1%'
    },
    {
      id: 5,
      name: 'Offshore Wind Project Delta',
      type: 'Wind',
      capacity: '200MW',
      location: 'Massachusetts, USA',
      status: 'Planning',
      progress: 15,
      startDate: '2024-04-10',
      expectedCompletion: '2025-12-20',
      investment: '$180M',
      roi: '15.7%'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success/10 text-success border-success/20';
      case 'In Progress': return 'bg-warning/10 text-warning border-warning/20';
      case 'Planning': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Solar': return 'Sun';
      case 'Wind': return 'Wind';
      case 'Hydro': return 'Waves';
      default: return 'Zap';
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProjects = [...projects]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Current Projects</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Filter" iconPosition="left">
            Filter
          </Button>
          <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
            Export
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>Project</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('type')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>Type</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('capacity')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>Capacity</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('location')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>Location</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>Status</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-medium text-muted-foreground">Progress</span>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('investment')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>Investment</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button 
                  onClick={() => handleSort('roi')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  <span>ROI</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-sm font-medium text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedProjects?.map((project) => (
              <tr key={project?.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={getTypeIcon(project?.type)} size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{project?.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {project?.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">{project?.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">{project?.capacity}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">{project?.location}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project?.status)}`}>
                    {project?.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project?.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-10 text-right">
                      {project?.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">{project?.investment}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-success">{project?.roi}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
                      <Icon name="Eye" size={16} />
                    </button>
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
                      <Icon name="Edit" size={16} />
                    </button>
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
                      <Icon name="MoreHorizontal" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {sortedProjects?.length} of {projects?.length} projects
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;