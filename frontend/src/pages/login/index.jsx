import React from 'react';
import { Helmet } from 'react-helmet';
import LoginForm from './components/LoginForm';
import HeroSection from './components/HeroSection';
import SecurityBadges from './components/SecurityBadges';

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign In - RenewMart | Renewable Energy Marketplace</title>
        <meta name="description" content="Sign in to RenewMart, the leading renewable energy marketplace connecting landowners, investors, and industry stakeholders." />
        <meta name="keywords" content="renewable energy, login, marketplace, solar, wind, PPA, power purchase agreement" />
      </Helmet>
      <div className="min-h-screen bg-background flex">
        {/* Hero Section - Left Panel (60% width on desktop) */}
        <div className="hidden lg:flex lg:w-3/5 relative">
          <HeroSection />
        </div>

        {/* Login Form Section - Right Panel (40% width on desktop, full width on mobile) */}
        <div className="w-full lg:w-2/5 flex flex-col justify-center bg-background">
          <div className="px-6 py-8 lg:px-12 lg:py-16">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-foreground">RenewMart</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Renewable Energy Marketplace
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Security Badges - Desktop Only */}
            <div className="hidden lg:block">
              <SecurityBadges />
            </div>

            {/* Mobile Trust Indicators */}
            <div className="lg:hidden mt-8 text-center">
              <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>SOC 2 Compliant</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                © {new Date()?.getFullYear()} RenewMart. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
                  Terms of Service
                </a>
                <a href="/support" className="text-xs text-muted-foreground hover:text-foreground transition-smooth">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;