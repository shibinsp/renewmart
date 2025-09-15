# RenewMart Workflow Implementation Guide

## Overview
This document provides a comprehensive guide to the workflow system implemented in RenewMart, based on the requirements specified in `Workflow.txt`. The system implements a complete renewable energy land development workflow with role-based access control.

## Workflow Architecture

### Core Components
1. **WorkflowContext** - Central state management for all workflow operations
2. **Role-Based Access Control** - Secure access based on user roles
3. **State Management** - Workflow state tracking and transitions
4. **Task Management** - Role-specific task assignment and tracking
5. **Communication System** - Ticket-based communication between roles

### Workflow States
```
SUBMITTED → VERIFIED_BY_ADMIN → TASKS_ASSIGNED → IN_PROGRESS → INTEREST_REQUEST → INTEREST_ACCEPTED → READY_TO_BUILD
```

## Role-Specific Workflows

### 1. Landowner Workflow
**Files**: `frontend/src/pages/landowner/`

#### Site Registration (`SiteRegistration.jsx`)
- **Purpose**: Landowners register their land for renewable energy development
- **Features**:
  - Comprehensive land information form
  - Development details (capacity, pricing, timeline)
  - Coordinate mapping support
  - Form validation and error handling
  - Real-time status updates

#### Properties Management (`PropertiesManagement.jsx`)
- **Purpose**: Track and manage registered properties
- **Features**:
  - Property status tracking
  - Filter by workflow state
  - Property details and metrics
  - Quick actions for each property
  - Summary statistics

### 2. Admin Workflow
**Files**: `frontend/src/pages/admin/`

#### Workflow Management (`WorkflowManagement.jsx`)
- **Purpose**: Admin oversight of entire workflow
- **Features**:
  - View all submitted workflows
  - Verify landowner registrations
  - Assign tasks to RE roles
  - Approve interest requests
  - Approve Ready to Build (RTB) status
  - Comprehensive workflow filtering

### 3. Investor Workflow
**Files**: `frontend/src/pages/investor/`

#### Land Browser (`LandBrowser.jsx`)
- **Purpose**: Browse available properties for investment
- **Features**:
  - Advanced filtering (energy type, capacity, price, location)
  - Property search and discovery
  - Investment opportunity analysis
  - One-to-one interest requests
  - Real-time availability updates

#### Portfolio Management (`PortfolioManagement.jsx`)
- **Purpose**: Manage investment portfolio
- **Features**:
  - Track active investments
  - Monitor pending interest requests
  - Portfolio value calculations
  - Investment performance metrics
  - Project tracking and management

### 4. RE Roles Workflow
**Files**: `frontend/src/pages/roles/`

#### Task Management (`TaskManagement.jsx`)
- **Purpose**: Manage assigned tasks for RE roles
- **Features**:
  - View assigned tasks by role
  - Update task status and progress
  - Upload SLA documents
  - Create tickets for admin communication
  - Timeline tracking and updates

### 5. Project Manager Workflow
**Files**: `frontend/src/pages/project-manager/`

#### RTB Management (`RTBManagement.jsx`)
- **Purpose**: Manage Ready to Build projects
- **Features**:
  - RTB project approval
  - Project lifecycle management
  - Team assignment and coordination
  - Budget and timeline tracking
  - Project completion monitoring

## Technical Implementation

### State Management
```javascript
// WorkflowContext provides centralized state management
const {
  workflows,
  tasks,
  tickets,
  loadWorkflows,
  updateWorkflowState,
  updateTask,
  createTicket,
  uploadSLADocument
} = useWorkflow();
```

### Role-Based Access Control
```javascript
// Role checking functions
const { hasRole, canPerformWorkflowAction } = useRoleAccess();

// Example usage
if (hasRole('landowner')) {
  // Show landowner-specific features
}

if (canPerformWorkflowAction('submit_form', userRole, workflow)) {
  // Allow form submission
}
```

### Workflow State Transitions
```javascript
// Update workflow state
await updateWorkflowState(workflowId, WORKFLOW_STATES.VERIFIED_BY_ADMIN);

// Check if user can perform action
if (canPerformWorkflowAction('verify_form', userRole, workflow)) {
  // Proceed with verification
}
```

## API Integration

### Workflow Endpoints
- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id/state` - Update workflow state
- `GET /api/workflows/:id/tasks` - Get workflow tasks

### Task Endpoints
- `GET /api/tasks` - Get user tasks
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/tickets` - Create ticket
- `POST /api/tasks/:id/sla` - Upload SLA document

## Database Schema

### Core Tables
- `workflows` - Main workflow records
- `tasks` - Role-specific tasks
- `tickets` - Communication between roles
- `sla_documents` - Uploaded SLA documents
- `user_roles` - User role assignments

### Workflow States
```sql
-- Workflow state transitions
SUBMITTED → VERIFIED_BY_ADMIN → TASKS_ASSIGNED → IN_PROGRESS → INTEREST_REQUEST → INTEREST_ACCEPTED → READY_TO_BUILD
```

## Security Features

### Access Control
- Route-level protection with role validation
- Component-level access control
- API endpoint protection
- Graceful error handling for unauthorized access

### Data Validation
- Form validation on frontend
- Server-side validation on backend
- Input sanitization and validation
- File upload security

## User Experience Features

### Real-time Updates
- Workflow state changes
- Task status updates
- Notification system
- Progress tracking

### Responsive Design
- Mobile-friendly interfaces
- Adaptive layouts
- Touch-friendly controls
- Cross-browser compatibility

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus management

## Testing

### Unit Tests
- Component testing
- Hook testing
- Utility function testing
- API integration testing

### Integration Tests
- Workflow end-to-end testing
- Role-based access testing
- State transition testing
- Cross-role communication testing

### User Acceptance Tests
- Role-specific workflow testing
- User journey validation
- Performance testing
- Security testing

## Deployment

### Frontend Deployment
```bash
# Build production bundle
npm run build

# Deploy to hosting service
npm run deploy
```

### Backend Deployment
```bash
# Install dependencies
pip install -r requirements.txt

# Run database migrations
python create_tables.py

# Start server
python main.py
```

## Monitoring and Analytics

### Workflow Metrics
- Workflow completion rates
- Task completion times
- Role performance metrics
- User engagement analytics

### Error Tracking
- Application error monitoring
- Performance monitoring
- User feedback collection
- System health checks

## Future Enhancements

### Planned Features
1. **Advanced Analytics** - Detailed reporting and insights
2. **Mobile App** - Native mobile application
3. **API Versioning** - Backward compatibility
4. **Multi-tenancy** - Support for multiple organizations
5. **Advanced Notifications** - Email, SMS, push notifications

### Integration Opportunities
1. **External APIs** - Weather data, market prices
2. **Document Management** - Advanced document processing
3. **Payment Integration** - Financial transactions
4. **Third-party Tools** - Project management tools

## Troubleshooting

### Common Issues
1. **Workflow State Not Updating**
   - Check user permissions
   - Verify API connectivity
   - Check browser console for errors

2. **Task Assignment Issues**
   - Verify role assignments
   - Check task configuration
   - Review admin permissions

3. **File Upload Problems**
   - Check file size limits
   - Verify file formats
   - Check server storage

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'workflow:*');

// Check workflow state
console.log('Current workflow state:', workflow.state);

// Verify user permissions
console.log('User roles:', user.roles);
console.log('Can perform action:', canPerformWorkflowAction('action', userRole, workflow));
```

## Support and Maintenance

### Regular Maintenance
- Database optimization
- Performance monitoring
- Security updates
- Bug fixes and patches

### User Support
- Documentation updates
- Training materials
- Help desk support
- Community forums

## Conclusion

The RenewMart workflow system provides a comprehensive solution for renewable energy land development, with robust role-based access control, efficient task management, and seamless communication between stakeholders. The implementation follows best practices for security, scalability, and user experience, ensuring a reliable and efficient platform for all users.

For additional support or questions, please refer to the technical documentation or contact the development team.
