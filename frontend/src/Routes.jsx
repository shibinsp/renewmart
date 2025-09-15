import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProjectManagement from './pages/project-management';
import Registration from './pages/registration';
import LoginPage from './pages/login';
import Marketplace from './pages/Marketplace';
import Dashboard from './pages/dashboard';
import DocumentManagement from './pages/document-management';
import ProfileSettings from './pages/profile';
import AccountSettings from './pages/settings';
import SiteRegistration from './pages/landowner/SiteRegistration';
import PropertiesManagement from './pages/landowner/PropertiesManagement';
import WorkflowManagement from './pages/admin/WorkflowManagement';
import LandBrowser from './pages/investor/LandBrowser';
import PortfolioManagement from './pages/investor/PortfolioManagement';
import TaskManagement from './pages/roles/TaskManagement';
import RTBManagement from './pages/project-manager/RTBManagement';
import ProtectedRoute, { PublicRoute, OwnerRoute, ReviewerRoute, AdminRoute, InvestorRoute, ProjectManagerRoute } from './components/ProtectedRoute';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/registration" element={
            <PublicRoute>
              <Registration />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />

          {/* Owner/Admin routes */}
          <Route path="/project-management" element={
            <OwnerRoute>
              <ProjectManagement />
            </OwnerRoute>
          } />

          {/* Reviewer/Admin routes */}
          <Route path="/document-management" element={
            <ReviewerRoute>
              <DocumentManagement />
            </ReviewerRoute>
          } />

          {/* Profile and Settings routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          } />

          {/* Landowner routes */}
          <Route path="/landowner/properties" element={
            <OwnerRoute>
              <PropertiesManagement />
            </OwnerRoute>
          } />
          <Route path="/landowner/site-registration" element={
            <OwnerRoute>
              <SiteRegistration />
            </OwnerRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/workflows" element={
            <AdminRoute>
              <WorkflowManagement />
            </AdminRoute>
          } />

          {/* Investor routes */}
          <Route path="/investor/browse" element={
            <InvestorRoute>
              <LandBrowser />
            </InvestorRoute>
          } />
          <Route path="/investor/portfolio" element={
            <InvestorRoute>
              <PortfolioManagement />
            </InvestorRoute>
          } />

          {/* RE Roles routes */}
          <Route path="/roles/tasks" element={
            <ReviewerRoute>
              <TaskManagement />
            </ReviewerRoute>
          } />

          {/* Project Manager routes */}
          <Route path="/project-manager/rtb" element={
            <ProjectManagerRoute>
              <RTBManagement />
            </ProjectManagerRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
