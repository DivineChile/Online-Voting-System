import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
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