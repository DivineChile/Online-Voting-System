import { createBrowserRouter, Navigate } from 'react-router-dom';
// Auth
import LoginPage from '../pages/auth/LoginPage';

//Layouts
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';
import OfficerLayout from '../layouts/OfficerLayout';

// Admin Routes
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminResultsPage from '../pages/admin/AdminResultsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import CreateElectionPage from '../pages/admin/CreateElectionPage';
import CreatePositionPage from '../pages/admin/CreatePositionPage';
import CreateCandidatePage from '../pages/admin/CreateCandidatePage';
import CreateUserPage from '../pages/admin/CreateUserPage';
import ManageElectionsPage from '../pages/admin/ManageElectionsPage';
import ReviewElectionSetupPage from '../pages/admin/ReviewElectionSetupPage';

// Election Officer Routes
import OfficerDashboardPage from '../pages/officer/OfficerDashboardPage';
import OfficerActiveElectionPage from '../pages/officer/OfficerActiveElectionPage';
import OfficerSetupReviewPage from '../pages/officer/OfficerSetupReviewPage';
import OfficerResultsPage from '../pages/officer/OfficerResultsPage';

// Student Routes
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import StudentResultsPage from '../pages/student/StudentResultsPage';
import StudentVotingPage from '../pages/student/StudentVotingPage';

// Unauthorized Page
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
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "users/create",
        element: <CreateUserPage />,
      },
      {
        path: "elections",
        element: <ManageElectionsPage />,
      },
      {
        path: "elections/create",
        element: <CreateElectionPage />,
      },
      {
        path: "elections/setup",
        element: <ReviewElectionSetupPage />,
      },
      {
        path: "positions/create",
        element: <CreatePositionPage />,
      },
      {
        path: "candidates/create",
        element: <CreateCandidatePage />,
      },
      {
        path: "results",
        element: <AdminResultsPage />,
      },
      {
        path: "audit-logs",
        element: <AuditLogsPage />,
      },
    ],
  },
  {
  path: '/officer',
  element: (
    <ProtectedRoute allowedRoles={['election_officer']}>
      <OfficerLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <OfficerDashboardPage />,
    },
    {
      path: 'election',
      element: <OfficerActiveElectionPage />,
    },
    {
      path: 'setup',
      element: <OfficerSetupReviewPage />,
    },
    {
      path: 'results',
      element: <OfficerResultsPage />,
    },
  ],
},
  {
  path: '/student',
  element: (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <StudentDashboardPage />,
    },
    {
      path: 'vote',
      element: <StudentVotingPage />,
    },
    {
      path: 'results',
      element: <StudentResultsPage />,
    },
  ],
},
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
]);