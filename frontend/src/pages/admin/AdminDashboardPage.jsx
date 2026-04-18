import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto rounded-2xl bg-white shadow-md p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-slate-600">
              Welcome, {profile?.full_name}.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/admin/users/create"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Create User
          </Link>

          <Link
            to="/admin/elections/create"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Create Election
          </Link>

          <Link
            to="/admin/elections"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Manage Elections
          </Link>

          <Link
            to="/admin/elections/setup"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Review Setup
          </Link>

          <Link
            to="/admin/positions/create"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Create Position
          </Link>

          <Link
            to="/admin/candidates/create"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Create Candidate
          </Link>

          <Link
            to="/admin/results"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            View Results
          </Link>

          <Link
            to="/admin/audit-logs"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Audit Logs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;