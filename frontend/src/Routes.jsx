import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProjectManagement from './pages/project-management';
import Registration from './pages/registration';
import LoginPage from './pages/login';
import Marketplace from './pages/marketplace';
import Dashboard from './pages/dashboard';
import DocumentManagement from './pages/document-management';
import ProtectedRoute, { PublicRoute, OwnerRoute, ReviewerRoute } from './components/ProtectedRoute';

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
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
