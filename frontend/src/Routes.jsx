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
import ProtectedRoute, { PublicRoute, OwnerRoute, ReviewerRoute } from './components/ProtectedRoute';

// Import new pages from landinvest_pro
import AdminDashboard from './pages/admin-dashboard';
import InvestorPortal from './pages/investor-portal';
import DocumentReview from './pages/document-review';
import DocumentUpload from './pages/document-upload';
import LandownerDashboard from './pages/landowner-dashboard';
import Register from './pages/register';

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
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected routes - Role-based routing */}
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
        
        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <ReviewerRoute>
            <AdminDashboard />
          </ReviewerRoute>
        } />
        
        {/* Investor Portal */}
        <Route path="/investor-portal" element={
          <ProtectedRoute>
            <InvestorPortal />
          </ProtectedRoute>
        } />
        
        {/* Document Management Routes */}
        <Route path="/document-upload" element={
          <OwnerRoute>
            <DocumentUpload />
          </OwnerRoute>
        } />
        <Route path="/document-review" element={
          <ReviewerRoute>
            <DocumentReview />
          </ReviewerRoute>
        } />
        
        {/* Landowner Dashboard */}
        <Route path="/landowner-dashboard" element={
          <OwnerRoute>
            <LandownerDashboard />
          </OwnerRoute>
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
