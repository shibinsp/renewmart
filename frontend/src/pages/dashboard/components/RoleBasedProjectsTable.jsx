import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { dummyProjects, dummyLands, dummyTasks, getLandsByOwner, getProjectsByInvestor, getTasksByAssignee } from '../../../data/dummyData';

const RoleBasedProjectsTable = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data based on user role using dummy data
    const loadRoleBasedData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const hasRole = (role) => user?.roles?.includes(role);
        
        if (hasRole('landowner')) {
          const userLands = getLandsByOwner(user.id) || dummyLands.slice(0, 3);
          setData(userLands.map(land => ({
            id: land.id,
            name: land.name,
            location: land.location,
            size: `${land.size} acres`,
            status: land.status,
            inquiries: Math.floor(Math.random() * 15),
            revenue: `$${(land.price * 0.001).toFixed(1)}K`,
            lastActivity: ['2 hours ago', '1 day ago', '3 days ago'][Math.floor(Math.random() * 3)]
          })));
        } else if (hasRole('investor')) {
          const userProjects = getProjectsByInvestor(user.id) || dummyProjects.slice(0, 3);
          setData(userProjects.map(project => {
            const userInvestment = project.investors?.find(inv => inv.id === user.id);
            return {
              id: project.id,
              name: project.name,
              type: project.type,
              investment: userInvestment ? `$${(userInvestment.amount / 1000000).toFixed(1)}M` : `$${(project.investment / 1000000).toFixed(1)}M`,
              status: project.status,
              returns: project.land?.roi ? `+${project.land.roi}%` : '+12.5%',
              location: project.land?.location || 'TBD',
              lastUpdate: ['1 hour ago', '4 hours ago', '2 days ago'][Math.floor(Math.random() * 3)]
            };
          }));
        } else if (hasRole('administrator') || hasRole('re_governance_lead')) {
          setData([
            {
              id: 1,
              name: 'Platform Overview',
              users: dummyProjects.reduce((sum, p) => sum + (p.investors?.length || 0), 0).toString(),
              properties: dummyLands.length.toString(),
              status: 'Operational',
              revenue: `$${(dummyProjects.reduce((sum, p) => sum + p.investment, 0) / 1000000).toFixed(1)}M`,
              growth: '+15.2%',
              lastUpdate: '5 min ago'
            },
            {
              id: 2,
              name: 'Pending Reviews',
              users: dummyProjects.filter(p => p.status === 'Under Review').length.toString(),
              properties: dummyLands.filter(l => l.status === 'Under Review').length.toString(),
              status: 'Review Required',
              revenue: 'N/A',
              growth: 'N/A',
              lastUpdate: '30 min ago'
            },
            {
              id: 3,
              name: 'System Health',
              users: 'All',
              properties: 'All',
              status: 'Healthy',
              revenue: 'N/A',
              growth: '+2.1%',
              lastUpdate: '1 hour ago'
            }
          ]);
        } else {
          // Default for other roles (sales advisor, analyst, project manager)
          const userTasks = getTasksByAssignee(user.id) || dummyTasks.slice(0, 3);
          setData(userTasks.map(task => ({
            id: task.id,
            name: task.title,
            clients: Math.floor(Math.random() * 30).toString(),
            projects: Math.floor(Math.random() * 20).toString(),
            status: task.status,
            revenue: `$${Math.floor(Math.random() * 200 + 50)}K`,
            completion: `${Math.floor(Math.random() * 100)}%`,
            deadline: task.dueDate
          })));
        }
        
        setLoading(false);
      }, 1000);
    };

    if (user) {
      loadRoleBasedData();
    }
  }, [user]);

  const getTableHeaders = () => {
    const hasRole = (role) => user?.roles?.includes(role);
    
    if (hasRole('landowner')) {
      return ['Property', 'Location', 'Size', 'Status', 'Inquiries', 'Revenue', 'Last Activity'];
    } else if (hasRole('investor')) {
      return ['Project', 'Type', 'Investment', 'Status', 'Returns', 'Location', 'Last Update'];
    } else if (hasRole('administrator') || hasRole('re_governance_lead')) {
      return ['Module', 'Users', 'Properties', 'Status', 'Revenue', 'Growth', 'Last Update'];
    } else {
      return ['Portfolio', 'Clients', 'Projects', 'Status', 'Revenue', 'Completion', 'Deadline'];
    }
  };

  const renderTableRow = (item) => {
    const hasRole = (role) => user?.roles?.includes(role);
    
    if (hasRole('landowner')) {
      return (
        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
          <td className="px-4 py-3">
            <div className="font-medium text-foreground">{item.name}</div>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.location}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.size}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'Active' ? 'bg-success/10 text-success' :
              item.status === 'Under Review' ? 'bg-warning/10 text-warning' :
              'bg-muted/50 text-muted-foreground'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.inquiries}</td>
          <td className="px-4 py-3 font-medium text-foreground">{item.revenue}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.lastActivity}</td>
        </tr>
      );
    } else if (hasRole('investor')) {
      return (
        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
          <td className="px-4 py-3">
            <div className="font-medium text-foreground">{item.name}</div>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
          <td className="px-4 py-3 font-medium text-foreground">{item.investment}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'Active' ? 'bg-success/10 text-success' :
              'bg-warning/10 text-warning'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <span className={item.returns.includes('+') ? 'text-success font-medium' : 'text-muted-foreground'}>
              {item.returns}
            </span>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.location}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.lastUpdate}</td>
        </tr>
      );
    } else if (hasRole('administrator') || hasRole('re_governance_lead')) {
      return (
        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
          <td className="px-4 py-3">
            <div className="font-medium text-foreground">{item.name}</div>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.users}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.properties}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'Operational' || item.status === 'Healthy' ? 'bg-success/10 text-success' :
              item.status === 'Review Required' ? 'bg-warning/10 text-warning' :
              'bg-muted/50 text-muted-foreground'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-4 py-3 font-medium text-foreground">{item.revenue}</td>
          <td className="px-4 py-3">
            <span className={item.growth?.includes('+') ? 'text-success font-medium' : 'text-muted-foreground'}>
              {item.growth}
            </span>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.lastUpdate}</td>
        </tr>
      );
    } else {
      return (
        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
          <td className="px-4 py-3">
            <div className="font-medium text-foreground">{item.name}</div>
          </td>
          <td className="px-4 py-3 text-muted-foreground">{item.clients}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.projects}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'Active' ? 'bg-success/10 text-success' :
              'bg-warning/10 text-warning'
            }`}>
              {item.status}
            </span>
          </td>
          <td className="px-4 py-3 font-medium text-foreground">{item.revenue}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.completion}</td>
          <td className="px-4 py-3 text-muted-foreground">{item.deadline}</td>
        </tr>
      );
    }
  };

  const getTableTitle = () => {
    const hasRole = (role) => user?.roles?.includes(role);
    
    if (hasRole('landowner')) return 'My Properties';
    if (hasRole('investor')) return 'My Investments';
    if (hasRole('administrator') || hasRole('re_governance_lead')) return 'Platform Overview';
    return 'My Portfolio';
  };

  const headers = getTableHeaders();

  return (
    <div className="bg-card border border-border rounded-lg shadow-subtle">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{getTableTitle()}</h3>
          <p className="text-sm text-muted-foreground mt-1">Recent activity and performance</p>
        </div>
        <Button variant="outline" size="sm" iconName="ExternalLink">
          View All
        </Button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <Icon name="Loader2" size={20} className="animate-spin" />
            <span>Loading data...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(renderTableRow)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoleBasedProjectsTable;