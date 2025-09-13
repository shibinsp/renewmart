// Dummy data for development and testing purposes

export const dummyLands = [
  {
    id: 1,
    name: 'Green Valley Solar Farm',
    location: 'Texas, USA',
    coordinates: { lat: 31.9686, lng: -99.9018 },
    type: 'Solar',
    size: 150,
    sizeUnit: 'acres',
    capacity: 50,
    capacityUnit: 'MW',
    price: 2500000,
    roi: 12.5,
    status: 'Available',
    description: 'Prime solar development site with excellent sun exposure and grid connectivity.',
    features: ['Grid Connected', 'Environmental Cleared', 'Permits Ready'],
    owner: {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com'
    },
    listedDate: '2024-01-15',
    images: ['/api/placeholder/400/300'],
    documents: [
      { name: 'Land Survey', type: 'pdf', uploadDate: '2024-01-10' },
      { name: 'Environmental Assessment', type: 'pdf', uploadDate: '2024-01-12' },
      { name: 'Grid Connection Study', type: 'pdf', uploadDate: '2024-01-14' }
    ],
    zoning: 'Agricultural',
    utilities: ['Electricity', 'Water', 'Road Access'],
    soilType: 'Clay Loam',
    elevation: 1200,
    annualSunHours: 2800
  },
  {
    id: 2,
    name: 'Prairie Wind Development',
    location: 'Oklahoma, USA',
    coordinates: { lat: 35.0078, lng: -97.0929 },
    type: 'Wind',
    size: 200,
    sizeUnit: 'acres',
    capacity: 75,
    capacityUnit: 'MW',
    price: 3200000,
    roi: 14.2,
    status: 'Available',
    description: 'Excellent wind resource area with consistent wind patterns and minimal obstacles.',
    features: ['High Wind Speed', 'Transmission Access', 'Local Support'],
    owner: {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com'
    },
    listedDate: '2024-01-10',
    images: ['/api/placeholder/400/300'],
    documents: [
      { name: 'Wind Resource Assessment', type: 'pdf', uploadDate: '2024-01-08' },
      { name: 'Transmission Study', type: 'pdf', uploadDate: '2024-01-09' }
    ],
    zoning: 'Agricultural',
    utilities: ['Electricity', 'Road Access'],
    soilType: 'Sandy Loam',
    elevation: 1500,
    avgWindSpeed: 8.5
  },
  {
    id: 3,
    name: 'Desert Solar Complex',
    location: 'Nevada, USA',
    coordinates: { lat: 39.1638, lng: -75.5264 },
    type: 'Solar',
    size: 300,
    sizeUnit: 'acres',
    capacity: 100,
    capacityUnit: 'MW',
    price: 4800000,
    roi: 15.8,
    status: 'Under Review',
    description: 'Large-scale solar development opportunity in high-irradiance desert location.',
    features: ['High Irradiance', 'Flat Terrain', 'Water Access'],
    owner: {
      id: 3,
      name: 'Desert Land Co.',
      email: 'contact@desertland.com'
    },
    listedDate: '2024-01-05',
    images: ['/api/placeholder/400/300'],
    documents: [
      { name: 'Topographical Survey', type: 'pdf', uploadDate: '2024-01-03' },
      { name: 'Water Rights Documentation', type: 'pdf', uploadDate: '2024-01-04' }
    ],
    zoning: 'Industrial',
    utilities: ['Electricity', 'Water', 'Road Access'],
    soilType: 'Desert Sand',
    elevation: 2200,
    annualSunHours: 3200
  }
];

export const dummyProjects = [
  {
    id: 1,
    name: 'Sunrise Solar Initiative',
    type: 'Solar',
    status: 'In Progress',
    progress: 65,
    landId: 1,
    land: dummyLands[0],
    capacity: 50,
    capacityUnit: 'MW',
    investment: 75000000,
    investors: [
      { id: 2, name: 'Green Energy Fund', amount: 45000000, percentage: 60 },
      { id: 3, name: 'Renewable Ventures', amount: 30000000, percentage: 40 }
    ],
    startDate: '2024-02-01',
    expectedCompletion: '2024-12-15',
    projectManager: {
      id: 4,
      name: 'Mike Chen',
      email: 'mike.chen@renewmart.com'
    },
    milestones: [
      { name: 'Site Preparation', status: 'Completed', date: '2024-03-15' },
      { name: 'Equipment Procurement', status: 'Completed', date: '2024-05-20' },
      { name: 'Installation Phase 1', status: 'In Progress', date: '2024-08-30' },
      { name: 'Grid Connection', status: 'Pending', date: '2024-11-15' },
      { name: 'Commissioning', status: 'Pending', date: '2024-12-15' }
    ],
    documents: [
      { name: 'Project Charter', type: 'pdf', uploadDate: '2024-01-20' },
      { name: 'Construction Plans', type: 'pdf', uploadDate: '2024-01-25' },
      { name: 'Environmental Permits', type: 'pdf', uploadDate: '2024-01-30' }
    ],
    risks: [
      { description: 'Weather delays', impact: 'Medium', probability: 'Low' },
      { description: 'Supply chain disruption', impact: 'High', probability: 'Medium' }
    ]
  },
  {
    id: 2,
    name: 'WindPower Prairie Project',
    type: 'Wind',
    status: 'Planning',
    progress: 25,
    landId: 2,
    land: dummyLands[1],
    capacity: 75,
    capacityUnit: 'MW',
    investment: 95000000,
    investors: [
      { id: 5, name: 'Wind Capital Partners', amount: 95000000, percentage: 100 }
    ],
    startDate: '2024-06-01',
    expectedCompletion: '2025-08-30',
    projectManager: {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@renewmart.com'
    },
    milestones: [
      { name: 'Environmental Impact Study', status: 'In Progress', date: '2024-04-30' },
      { name: 'Turbine Selection', status: 'Pending', date: '2024-07-15' },
      { name: 'Foundation Construction', status: 'Pending', date: '2024-10-01' },
      { name: 'Turbine Installation', status: 'Pending', date: '2025-06-30' },
      { name: 'Grid Integration', status: 'Pending', date: '2025-08-30' }
    ],
    documents: [
      { name: 'Feasibility Study', type: 'pdf', uploadDate: '2024-01-15' },
      { name: 'Wind Resource Report', type: 'pdf', uploadDate: '2024-01-18' }
    ],
    risks: [
      { description: 'Regulatory approval delays', impact: 'High', probability: 'Medium' },
      { description: 'Community opposition', impact: 'Medium', probability: 'Low' }
    ]
  },
  {
    id: 3,
    name: 'Desert Mega Solar',
    type: 'Solar',
    status: 'Under Review',
    progress: 10,
    landId: 3,
    land: dummyLands[2],
    capacity: 100,
    capacityUnit: 'MW',
    investment: 120000000,
    investors: [],
    startDate: null,
    expectedCompletion: null,
    projectManager: null,
    milestones: [
      { name: 'Due Diligence', status: 'In Progress', date: '2024-03-01' },
      { name: 'Financial Modeling', status: 'Pending', date: '2024-03-15' },
      { name: 'Investor Presentation', status: 'Pending', date: '2024-04-01' }
    ],
    documents: [
      { name: 'Initial Assessment', type: 'pdf', uploadDate: '2024-01-20' }
    ],
    risks: [
      { description: 'Funding uncertainty', impact: 'High', probability: 'High' },
      { description: 'Transmission capacity', impact: 'Medium', probability: 'Medium' }
    ]
  }
];

export const dummyTasks = [
  {
    id: 1,
    title: 'Complete Environmental Impact Assessment',
    description: 'Finalize the environmental impact assessment for the WindPower Prairie Project',
    projectId: 2,
    project: dummyProjects[1],
    assignedTo: {
      id: 7,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@renewmart.com'
    },
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-02-15',
    createdDate: '2024-01-20',
    category: 'Environmental',
    estimatedHours: 40,
    actualHours: 25,
    tags: ['Environmental', 'Compliance', 'Wind']
  },
  {
    id: 2,
    title: 'Solar Panel Installation Phase 1',
    description: 'Install solar panels for the first 25MW section of Sunrise Solar Initiative',
    projectId: 1,
    project: dummyProjects[0],
    assignedTo: {
      id: 4,
      name: 'Mike Chen',
      email: 'mike.chen@renewmart.com'
    },
    status: 'In Progress',
    priority: 'High',
    dueDate: '2024-02-28',
    createdDate: '2024-01-15',
    category: 'Construction',
    estimatedHours: 120,
    actualHours: 80,
    tags: ['Solar', 'Installation', 'Construction']
  },
  {
    id: 3,
    title: 'Grid Connection Approval',
    description: 'Obtain final approval for grid connection from utility company',
    projectId: 1,
    project: dummyProjects[0],
    assignedTo: {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@renewmart.com'
    },
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2024-03-10',
    createdDate: '2024-01-25',
    category: 'Regulatory',
    estimatedHours: 20,
    actualHours: 0,
    tags: ['Grid', 'Approval', 'Utility']
  },
  {
    id: 4,
    title: 'Financial Model Review',
    description: 'Review and update financial projections for Desert Mega Solar project',
    projectId: 3,
    project: dummyProjects[2],
    assignedTo: {
      id: 8,
      name: 'Robert Wilson',
      email: 'robert.wilson@renewmart.com'
    },
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '2024-02-20',
    createdDate: '2024-01-30',
    category: 'Financial',
    estimatedHours: 30,
    actualHours: 0,
    tags: ['Financial', 'Modeling', 'Analysis']
  },
  {
    id: 5,
    title: 'Turbine Foundation Design',
    description: 'Complete foundation design specifications for wind turbines',
    projectId: 2,
    project: dummyProjects[1],
    assignedTo: {
      id: 4,
      name: 'Mike Chen',
      email: 'mike.chen@renewmart.com'
    },
    status: 'Not Started',
    priority: 'Low',
    dueDate: '2024-03-15',
    createdDate: '2024-02-01',
    category: 'Engineering',
    estimatedHours: 60,
    actualHours: 0,
    tags: ['Wind', 'Foundation', 'Engineering']
  },
  {
    id: 6,
    title: 'Investor Presentation Preparation',
    description: 'Prepare comprehensive presentation for potential investors',
    projectId: 3,
    project: dummyProjects[2],
    assignedTo: {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.davis@renewmart.com'
    },
    status: 'Not Started',
    priority: 'High',
    dueDate: '2024-02-25',
    createdDate: '2024-02-01',
    category: 'Business Development',
    estimatedHours: 25,
    actualHours: 0,
    tags: ['Presentation', 'Investors', 'Business']
  }
];

export const dummyUsers = [
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
    avatar: null,
    phone: '+1-555-0101',
    company: 'Smith Farms LLC',
    location: 'Texas, USA'
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
    avatar: null,
    phone: '+1-555-0102',
    company: 'Green Energy Fund',
    location: 'New York, USA'
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
    avatar: null,
    phone: '+1-555-0103',
    company: 'RenewMart',
    location: 'California, USA'
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
    avatar: null,
    phone: '+1-555-0104',
    company: 'RenewMart',
    location: 'California, USA'
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
    avatar: null,
    phone: '+1-555-0105',
    company: 'Wilson Ranch',
    location: 'Oklahoma, USA'
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
    avatar: null,
    phone: '+1-555-0106',
    company: 'RenewMart',
    location: 'California, USA'
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
    avatar: null,
    phone: '+1-555-0107',
    company: 'Renewable Ventures',
    location: 'New York, USA'
  }
];

export const dummyActivities = [
  {
    id: 1,
    type: 'project_update',
    title: 'Project milestone completed',
    description: 'Site preparation completed for Sunrise Solar Initiative',
    projectId: 1,
    userId: 4,
    user: dummyUsers[2],
    timestamp: '2024-01-20T10:30:00Z',
    metadata: {
      milestone: 'Site Preparation',
      progress: 65
    }
  },
  {
    id: 2,
    type: 'land_listing',
    title: 'New land listing',
    description: 'Green Valley Solar Farm listed for development',
    landId: 1,
    userId: 1,
    user: dummyUsers[0],
    timestamp: '2024-01-19T14:15:00Z',
    metadata: {
      landName: 'Green Valley Solar Farm',
      price: 2500000
    }
  },
  {
    id: 3,
    type: 'investment',
    title: 'Investment received',
    description: 'Green Energy Fund invested in Sunrise Solar Initiative',
    projectId: 1,
    userId: 2,
    user: dummyUsers[1],
    timestamp: '2024-01-18T09:45:00Z',
    metadata: {
      amount: 45000000,
      percentage: 60
    }
  },
  {
    id: 4,
    type: 'task_completion',
    title: 'Task completed',
    description: 'Environmental Impact Assessment completed',
    taskId: 1,
    userId: 6,
    user: dummyUsers[5],
    timestamp: '2024-01-17T16:20:00Z',
    metadata: {
      taskName: 'Complete Environmental Impact Assessment'
    }
  },
  {
    id: 5,
    type: 'document_upload',
    title: 'Document uploaded',
    description: 'Grid Connection Study uploaded for Green Valley Solar Farm',
    landId: 1,
    userId: 1,
    user: dummyUsers[0],
    timestamp: '2024-01-16T11:30:00Z',
    metadata: {
      documentName: 'Grid Connection Study',
      documentType: 'pdf'
    }
  }
];

// Helper functions to get data by ID
export const getLandById = (id) => dummyLands.find(land => land.id === id);
export const getProjectById = (id) => dummyProjects.find(project => project.id === id);
export const getTaskById = (id) => dummyTasks.find(task => task.id === id);
export const getUserById = (id) => dummyUsers.find(user => user.id === id);

// Helper functions to get data by user role
export const getLandsByOwner = (ownerId) => dummyLands.filter(land => land.owner.id === ownerId);
export const getProjectsByInvestor = (investorId) => dummyProjects.filter(project => 
  project.investors.some(investor => investor.id === investorId)
);
export const getTasksByAssignee = (userId) => dummyTasks.filter(task => task.assignedTo.id === userId);
export const getActivitiesByUser = (userId) => dummyActivities.filter(activity => activity.userId === userId);

// Statistics helpers
export const getProjectStats = () => {
  const total = dummyProjects.length;
  const inProgress = dummyProjects.filter(p => p.status === 'In Progress').length;
  const planning = dummyProjects.filter(p => p.status === 'Planning').length;
  const underReview = dummyProjects.filter(p => p.status === 'Under Review').length;
  
  return { total, inProgress, planning, underReview };
};

export const getLandStats = () => {
  const total = dummyLands.length;
  const available = dummyLands.filter(l => l.status === 'Available').length;
  const underReview = dummyLands.filter(l => l.status === 'Under Review').length;
  const totalValue = dummyLands.reduce((sum, land) => sum + land.price, 0);
  
  return { total, available, underReview, totalValue };
};

export const getTaskStats = () => {
  const total = dummyTasks.length;
  const inProgress = dummyTasks.filter(t => t.status === 'In Progress').length;
  const pending = dummyTasks.filter(t => t.status === 'Pending').length;
  const notStarted = dummyTasks.filter(t => t.status === 'Not Started').length;
  const overdue = dummyTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
  
  return { total, inProgress, pending, notStarted, overdue };
};