import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for role-based access control
 * Provides convenient methods to check user permissions and roles
 */
export const useRoleAccess = () => {
    const { user, hasRole, hasAnyRole, isAdmin, isReviewer, isOwner } = useAuth();

    // Check if user has specific role
    const canAccess = (role) => hasRole(role);

    // Check if user has any of the specified roles
    const canAccessAny = (roles) => hasAnyRole(roles);

    // Check if user can access admin features
    const canAccessAdmin = () => isAdmin();

    // Check if user can access review features
    const canAccessReview = () => isReviewer() || isAdmin();

    // Check if user can access owner features
    const canAccessOwner = () => isOwner() || isAdmin();

    // Check if user can access investor features
    const canAccessInvestor = () => hasRole('investor') || isAdmin();

    // Check if user can access landowner features
    const canAccessLandowner = () => hasRole('landowner') || isAdmin();

    // Check if user can access sales features
    const canAccessSales = () => hasRole('re_sales_advisor') || isAdmin();

    // Check if user can access analyst features
    const canAccessAnalyst = () => hasRole('re_analyst') || isAdmin();

    // Check if user can access project manager features
    const canAccessProjectManager = () => hasRole('project_manager') || isAdmin();

    // Check if user can access governance features
    const canAccessGovernance = () => hasRole('re_governance_lead') || isAdmin();

    // Get user's primary role
    const getPrimaryRole = () => {
        if (!user?.roles || user.roles.length === 0) return 'user';
        return user.roles[0];
    };

    // Get user's role display name
    const getRoleDisplayName = () => {
        const role = getPrimaryRole();
        return role.replace('re_', '').replace('_', ' ');
    };

    // Check if user can perform specific actions
    const canPerformAction = (action) => {
        const actionPermissions = {
            'view_dashboard': () => true, // All authenticated users can view dashboard
            'manage_users': () => canAccessAdmin(),
            'review_content': () => canAccessReview(),
            'manage_properties': () => canAccessLandowner() || canAccessAdmin(),
            'browse_investments': () => canAccessInvestor() || canAccessAdmin(),
            'manage_sales': () => canAccessSales() || canAccessAdmin(),
            'perform_analysis': () => canAccessAnalyst() || canAccessAdmin(),
            'manage_projects': () => canAccessProjectManager() || canAccessAdmin(),
            'governance_review': () => canAccessGovernance() || canAccessAdmin(),
            'view_reports': () => canAccessAdmin() || canAccessReview(),
            'manage_settings': () => canAccessAdmin(),
            'upload_documents': () => canAccessLandowner() || canAccessAdmin(),
            'create_projects': () => canAccessProjectManager() || canAccessAdmin(),
            'approve_content': () => canAccessReview(),
            'view_analytics': () => canAccessAnalyst() || canAccessAdmin(),
        };

        const permissionCheck = actionPermissions[action];
        return permissionCheck ? permissionCheck() : false;
    };

    // Get accessible routes based on user role
    const getAccessibleRoutes = () => {
        const routes = ['/dashboard', '/profile', '/settings'];

        if (canAccessLandowner()) {
            routes.push('/landowner/properties', '/landowner/inquiries', '/landowner/documents');
        }

        if (canAccessInvestor()) {
            routes.push('/investor/browse', '/investor/portfolio', '/investor/analysis');
        }

        if (canAccessAdmin()) {
            routes.push('/admin/users', '/admin/reports', '/admin/review', '/admin/settings');
        }

        if (canAccessGovernance()) {
            routes.push('/governance/review', '/governance/compliance', '/governance/policies');
        }

        if (canAccessSales()) {
            routes.push('/sales/pipeline', '/sales/clients', '/sales/deals');
        }

        if (canAccessAnalyst()) {
            routes.push('/analyst/queue', '/analyst/reports', '/analyst/tools');
        }

        if (canAccessProjectManager()) {
            routes.push('/project-management', '/project-management/tasks', '/project-management/team');
        }

        // Common routes for all users
        routes.push('/marketplace', '/document-management');

        return routes;
    };

    // Check if user can access a specific route
    const canAccessRoute = (route) => {
        const accessibleRoutes = getAccessibleRoutes();
        return accessibleRoutes.includes(route);
    };

    // Get role-specific dashboard components
    const getDashboardComponents = () => {
        const components = ['metrics', 'activity', 'quick-actions'];

        if (canAccessInvestor()) {
            components.push('portfolio', 'investment-opportunities');
        }

        if (canAccessLandowner()) {
            components.push('property-status', 'inquiries', 'revenue');
        }

        if (canAccessAdmin()) {
            components.push('system-overview', 'user-management', 'reports');
        }

        if (canAccessGovernance()) {
            components.push('review-queue', 'compliance', 'policies');
        }

        if (canAccessSales()) {
            components.push('sales-pipeline', 'clients', 'deals');
        }

        if (canAccessAnalyst()) {
            components.push('analysis-queue', 'reports', 'data-tools');
        }

        if (canAccessProjectManager()) {
            components.push('project-status', 'tasks', 'team');
        }

        return components;
    };

    return {
        // Basic role checks
        canAccess,
        canAccessAny,

        // Specific role access
        canAccessAdmin,
        canAccessReview,
        canAccessOwner,
        canAccessInvestor,
        canAccessLandowner,
        canAccessSales,
        canAccessAnalyst,
        canAccessProjectManager,
        canAccessGovernance,

        // Action permissions
        canPerformAction,

        // Route access
        canAccessRoute,
        getAccessibleRoutes,

        // Dashboard components
        getDashboardComponents,

        // User info
        getPrimaryRole,
        getRoleDisplayName,

        // User data
        user,
        roles: user?.roles || [],
    };
};

export default useRoleAccess;
