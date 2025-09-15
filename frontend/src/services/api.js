import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    // Convert to form data for OAuth2PasswordRequestForm
    const formData = new FormData();
    formData.append('username', credentials.email || credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post('/api/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (userData) => {
    // Transform frontend form data to backend format
    const registrationData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone || null,
      roles: userData.role ? [userData.role] : []
    };

    const response = await api.post('/api/auth/register', registrationData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
};

// Lands API
export const landsAPI = {
  getLands: async (params = {}) => {
    const response = await api.get('/lands/', { params });
    return response.data;
  },

  getLandById: async (landId) => {
    const response = await api.get(`/lands/${landId}`);
    return response.data;
  },

  createLand: async (landData) => {
    const response = await api.post('/lands/', landData);
    return response.data;
  },

  updateLand: async (landId, landData) => {
    const response = await api.put(`/lands/${landId}`, landData);
    return response.data;
  },

  deleteLand: async (landId) => {
    const response = await api.delete(`/lands/${landId}`);
    return response.data;
  },

  updateLandStatus: async (landId, status) => {
    const response = await api.put(`/lands/${landId}/status`, { status });
    return response.data;
  },

  updateLandVisibility: async (landId, visibility) => {
    const response = await api.put(`/lands/${landId}/visibility`, { visibility });
    return response.data;
  },

  getMyLands: async (params = {}) => {
    const response = await api.get('/lands/my-lands', { params });
    return response.data;
  },

  getPublicLands: async (params = {}) => {
    const response = await api.get('/lands/public', { params });
    return response.data;
  }
};

// Sections API
export const sectionsAPI = {
  getSections: async (landId) => {
    const response = await api.get(`/sections/${landId}`);
    return response.data;
  },

  createSection: async (landId, sectionData) => {
    const response = await api.post(`/sections/${landId}`, sectionData);
    return response.data;
  },

  updateSection: async (sectionId, sectionData) => {
    const response = await api.put(`/sections/section/${sectionId}`, sectionData);
    return response.data;
  },

  deleteSection: async (sectionId) => {
    const response = await api.delete(`/sections/section/${sectionId}`);
    return response.data;
  }
};

// Documents API
export const documentsAPI = {
  uploadDocument: async (landId, formData) => {
    const response = await api.post(`/documents/upload/${landId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async (landId, params = {}) => {
    const response = await api.get(`/documents/land/${landId}`, { params });
    return response.data;
  },

  getDocumentById: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  updateDocumentStatus: async (documentId, status, reviewNotes = '') => {
    const response = await api.put(`/documents/${documentId}/review`, {
      status,
      review_notes: reviewNotes
    });
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  downloadDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Tasks API
export const tasksAPI = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  updateTaskStatus: async (taskId, status, notes = '') => {
    const response = await api.put(`/tasks/${taskId}/status`, {
      status,
      notes
    });
    return response.data;
  },

  assignTask: async (taskId, assigneeId) => {
    const response = await api.put(`/tasks/${taskId}/assign`, {
      assignee_id: assigneeId
    });
    return response.data;
  },

  getMyTasks: async (params = {}) => {
    const response = await api.get('/tasks/my-tasks', { params });
    return response.data;
  },

  getTaskHistory: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/history`);
    return response.data;
  }
};

// Investors API
export const investorsAPI = {
  expressInterest: async (landId, interestData) => {
    const response = await api.post(`/investors/interest`, {
      land_id: landId,
      ...interestData
    });
    return response.data;
  },

  getMyInterests: async (params = {}) => {
    const response = await api.get('/investors/my-interests', { params });
    return response.data;
  },

  getLandInterests: async (landId, params = {}) => {
    const response = await api.get(`/investors/land/${landId}/interests`, { params });
    return response.data;
  },

  updateInterestStatus: async (interestId, status) => {
    const response = await api.put(`/investors/interest/${interestId}/status`, {
      status
    });
    return response.data;
  },

  getAvailableLands: async (params = {}) => {
    const response = await api.get('/investors/available-lands', { params });
    return response.data;
  }
};

// Task API
export const taskAPI = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  }
};

// Health Check API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Export the main api instance for custom requests
export default api;