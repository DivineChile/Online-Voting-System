import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminResultsPage from '../pages/admin/AdminResultsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import CreateElectionPage from '../pages/admin/CreateElectionPage';
import CreatePositionPage from '../pages/admin/CreatePositionPage';
import CreateCandidatePage from '../pages/admin/CreateCandidatePage';
import CreateUserPage from '../pages/admin/CreateUserPage';
import ManageElectionsPage from '../pages/admin/ManageElectionsPage';
import ReviewElectionSetupPage from '../pages/admin/ReviewElectionSetupPage';
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import StudentResultsPage from '../pages/student/StudentResultsPage';
import StudentVotingPage from '../pages/student/StudentVotingPage';
import OfficerDashboardPage from '../pages/officer/OfficerDashboardPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreateUserPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/elections/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreateElectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/elections/setup',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ReviewElectionSetupPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/positions/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreatePositionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/candidates/create',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <CreateCandidatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/elections',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ManageElectionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/results',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminResultsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/audit-logs',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AuditLogsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/vote',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentVotingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/student/results',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentResultsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/officer',
    element: (
      <ProtectedRoute allowedRoles={['election_officer']}>
        <OfficerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
]);