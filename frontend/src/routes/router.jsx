import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import CreateElectionPage from '../pages/admin/CreateElectionPage';
import CreatePositionPage from '../pages/admin/CreatePositionPage';
import CreateCandidatePage from '../pages/admin/CreateCandidatePage';
import CreateUserPage from '../pages/admin/CreateUserPage';
import ManageElectionsPage from '../pages/admin/ManageElectionsPage';
import ReviewElectionSetupPage from '../pages/admin/ReviewElectionSetupPage';
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
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
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboardPage />
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