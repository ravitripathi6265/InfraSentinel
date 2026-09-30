import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RiskRadar from './pages/RiskRadar';
import ProjectDetails from './pages/ProjectDetails';
import EarlyWarnings from './pages/EarlyWarnings';
import NewsIntelligence from './pages/NewsIntelligence';
import Analytics from './pages/Analytics';
import WhatIfSimulator from './pages/WhatIfSimulator';
import AiAssistant from './pages/AiAssistant';
import ExecutiveReports from './pages/ExecutiveReports';
import RiskForecasting from './pages/RiskForecasting';

function PrivateRoute() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="risk-radar" element={<RiskRadar />} />
            <Route path="forecasting" element={<RiskForecasting />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="early-warnings" element={<EarlyWarnings />} />
            <Route path="news" element={<NewsIntelligence />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="simulator" element={<WhatIfSimulator />} />
            <Route path="ai-assistant" element={<AiAssistant />} />
            <Route path="reports" element={<ExecutiveReports />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
