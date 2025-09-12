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

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/project-management" element={<ProjectManagement />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/document-management" element={<DocumentManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
