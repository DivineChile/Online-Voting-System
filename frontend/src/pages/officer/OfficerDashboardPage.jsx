import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';

function OfficerDashboardPage() {
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
            <h1 className="text-2xl font-bold text-slate-900">Election Officer Dashboard</h1>
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
    </div>
  );
}

export default OfficerDashboardPage;