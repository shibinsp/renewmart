import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { landsAPI, tasksAPI } from '../services/api';

// Workflow states as defined in Workflow.txt
export const WORKFLOW_STATES = {
  SUBMITTED: 'submitted',
  VERIFIED_BY_ADMIN: 'verified_by_admin',
  TASKS_ASSIGNED: 'tasks_assigned',
  IN_PROGRESS: 'in_progress',
  INTEREST_REQUEST: 'interest_request',
  INTEREST_ACCEPTED: 'interest_accepted',
  READY_TO_BUILD: 'ready_to_build'
};

// Task types for different roles
export const TASK_TYPES = {
  INVESTOR: 'investor_tasks',
  RE_SALES_ADVISOR: 're_sales_advisor_tasks',
  RE_ANALYST: 're_analyst_tasks',
  RE_GOVERNANCE_LEAD: 're_governance_lead_tasks',
  PROJECT_MANAGER: 'project_manager_tasks'
};

// Ticket types
export const TICKET_TYPES = {
  ROLES_TO_ADMIN: 'roles_to_admin',
  INVESTOR_TO_ROLES: 'investor_to_roles'
};

// Initial state
const initialState = {
  currentWorkflow: null,
  workflows: [],
  tasks: [],
  tickets: [],
  slaDocuments: [],
  isLoading: false,
  error: null
};

// Action types
const WORKFLOW_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_WORKFLOWS: 'SET_WORKFLOWS',
  SET_CURRENT_WORKFLOW: 'SET_CURRENT_WORKFLOW',
  UPDATE_WORKFLOW_STATE: 'UPDATE_WORKFLOW_STATE',
  SET_TASKS: 'SET_TASKS',
  UPDATE_TASK: 'UPDATE_TASK',
  SET_TICKETS: 'SET_TICKETS',
  ADD_TICKET: 'ADD_TICKET',
  SET_SLA_DOCUMENTS: 'SET_SLA_DOCUMENTS',
  ADD_SLA_DOCUMENT: 'ADD_SLA_DOCUMENT'
};

// Reducer
const workflowReducer = (state, action) => {
  switch (action.type) {
    case WORKFLOW_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case WORKFLOW_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case WORKFLOW_ACTIONS.SET_WORKFLOWS:
      return { ...state, workflows: action.payload, isLoading: false };
    case WORKFLOW_ACTIONS.SET_CURRENT_WORKFLOW:
      return { ...state, currentWorkflow: action.payload };
    case WORKFLOW_ACTIONS.UPDATE_WORKFLOW_STATE:
      return {
        ...state,
        workflows: state.workflows.map(w => 
          w.id === action.payload.workflowId 
            ? { ...w, state: action.payload.newState }
            : w
        ),
        currentWorkflow: state.currentWorkflow?.id === action.payload.workflowId
          ? { ...state.currentWorkflow, state: action.payload.newState }
          : state.currentWorkflow
      };
    case WORKFLOW_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload };
    case WORKFLOW_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.taskId 
            ? { ...t, ...action.payload.updates }
            : t
        )
      };
    case WORKFLOW_ACTIONS.SET_TICKETS:
      return { ...state, tickets: action.payload };
    case WORKFLOW_ACTIONS.ADD_TICKET:
      return { ...state, tickets: [...state.tickets, action.payload] };
    case WORKFLOW_ACTIONS.SET_SLA_DOCUMENTS:
      return { ...state, slaDocuments: action.payload };
    case WORKFLOW_ACTIONS.ADD_SLA_DOCUMENT:
      return { ...state, slaDocuments: [...state.slaDocuments, action.payload] };
    default:
      return state;
  }
};

// Create context
const WorkflowContext = createContext();

// Workflow provider component
export const WorkflowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Load workflows
  const loadWorkflows = async () => {
    try {
      dispatch({ type: WORKFLOW_ACTIONS.SET_LOADING, payload: true });
      const response = await landsAPI.getLands();
      dispatch({ type: WORKFLOW_ACTIONS.SET_WORKFLOWS, payload: response.data.lands || [] });
    } catch (error) {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Load tasks for a workflow
  const loadTasks = async (workflowId) => {
    try {
      const response = await tasksAPI.getTasksByWorkflow(workflowId);
      dispatch({ type: WORKFLOW_ACTIONS.SET_TASKS, payload: response.data.tasks || [] });
    } catch (error) {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Update workflow state
  const updateWorkflowState = async (workflowId, newState) => {
    try {
      await landsAPI.updateWorkflowState(workflowId, newState);
      dispatch({ 
        type: WORKFLOW_ACTIONS.UPDATE_WORKFLOW_STATE, 
        payload: { workflowId, newState } 
      });
    } catch (error) {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      await tasksAPI.updateTask(taskId, updates);
      dispatch({ 
        type: WORKFLOW_ACTIONS.UPDATE_TASK, 
        payload: { taskId, updates } 
      });
    } catch (error) {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Create ticket
  const createTicket = async (ticketData) => {
    try {
      const response = await tasksAPI.createTicket(ticketData);
      dispatch({ type: WORKFLOW_ACTIONS.ADD_TICKET, payload: response.data });
    } catch (error) {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Upload SLA document
  const uploadSLADocument = async (workflowId, file, taskId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workflowId', workflowId);
      if (taskId) formData.append('taskId', taskId);

      const response = await tasksAPI.uploadSLADocument(formData);
      dispatch({ type: WORKFLOW_ACTIONS.ADD_SLA_DOCUMENT, payload: response.data });
    } catch (error) {
      dispatch({ type: WORKFLOW_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Get tasks by role
  const getTasksByRole = (role) => {
    return state.tasks.filter(task => task.assignedRole === role);
  };

  // Get workflows by state
  const getWorkflowsByState = (workflowState) => {
    return state.workflows.filter(workflow => workflow.state === workflowState);
  };

  // Check if user can perform action
  const canPerformWorkflowAction = (action, userRole, workflow) => {
    switch (action) {
      case 'submit_form':
        return userRole === 'landowner';
      case 'verify_form':
        return userRole === 'administrator';
      case 'assign_tasks':
        return userRole === 'administrator';
      case 'update_task':
        return ['re_sales_advisor', 're_analyst', 're_governance_lead', 'project_manager'].includes(userRole);
      case 'send_interest':
        return userRole === 'investor' && workflow.state === WORKFLOW_STATES.IN_PROGRESS;
      case 'accept_interest':
        return userRole === 'administrator';
      case 'approve_rtb':
        return userRole === 'administrator';
      default:
        return false;
    }
  };

  const value = {
    ...state,
    loadWorkflows,
    loadTasks,
    updateWorkflowState,
    updateTask,
    createTicket,
    uploadSLADocument,
    getTasksByRole,
    getWorkflowsByState,
    canPerformWorkflowAction
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Custom hook to use workflow context
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export default WorkflowContext;
