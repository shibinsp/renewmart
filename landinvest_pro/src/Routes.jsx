import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
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
        {/* Define your route here */}
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/investor-portal" element={<InvestorPortal />} />
        <Route path="/document-review" element={<DocumentReview />} />
        <Route path="/document-upload" element={<DocumentUpload />} />
        <Route path="/landowner-dashboard" element={<LandownerDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
