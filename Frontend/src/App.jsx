import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './modules/authentication/pages/Login';
import OrgRegisterPage from './pages/public/OrgRegisterPage';

// Recruiter Pages
import AssessmentsListPage from './pages/recruiter/AssessmentsListPage';
import AssessmentBuilderPage from './pages/recruiter/AssessmentBuilderPage';
import QuestionBankPage from './pages/recruiter/QuestionBankPage';
import RecruiterAnalyticsDashboard from './modules/Analytics/RecruiterAnalyticsDashboard';

// Candidate Pages
import CandidateJoinPage from './pages/candidate/CandidateJoinPage';
import ActiveTestPage from './pages/candidate/ActiveTestPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/company" element={<OrgRegisterPage />} />
          <Route path="/join/:inviteToken" element={<CandidateJoinPage />} />

          {/* Recruiter Protected Portal */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <AssessmentsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/new"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <AssessmentBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessments/:assessmentId/analytics"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <RecruiterAnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute allowedRole="recruiter">
                <QuestionBankPage />
              </ProtectedRoute>
            }
          />

          {/* Candidate Active Assessment */}
          <Route
            path="/test/active"
            element={
              <ProtectedRoute allowedRole="candidate">
                <ActiveTestPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
