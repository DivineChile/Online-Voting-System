import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { fetchOfficerDashboardSummary } from '../../api/officerApi';

function OfficerDashboardPage() {
  const navigate = useNavigate();
  const { profile, session, signOut } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadSummary() {
      try {
        const result = await fetchOfficerDashboardSummary(session?.access_token);
        setSummary(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load dashboard summary.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadSummary();
    }
  }, [session]);

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Election Officer Dashboard
              </h1>
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
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white shadow-md p-8">
          {loading ? (
            <p className="text-sm text-slate-600">Loading dashboard summary...</p>
          ) : summary?.active_election ? (
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Active Election
              </h2>
              <p className="mt-2 text-slate-700">
                {summary.active_election.title}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {summary.active_election.description || 'No description provided.'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              There is no active election available right now.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/officer/election"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            View Active Election
          </Link>

          <Link
            to="/officer/setup"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            Review Setup
          </Link>

          <Link
            to="/officer/results"
            className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
          >
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OfficerDashboardPage;