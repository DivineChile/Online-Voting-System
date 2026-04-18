import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchOfficerDashboardSummary,
  fetchOfficerElectionSetup,
} from '../../api/officerApi';

function OfficerSetupReviewPage() {
  const { session } = useAuth();

  const [activeElectionId, setActiveElectionId] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadSetup() {
      try {
        const summaryResult = await fetchOfficerDashboardSummary(
          session?.access_token
        );

        const activeElection = summaryResult.data?.active_election;

        if (!activeElection) {
          setSetupData(null);
          return;
        }

        setActiveElectionId(activeElection.id);

        const setupResult = await fetchOfficerElectionSetup(
          session?.access_token,
          activeElection.id
        );

        setSetupData(setupResult.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load election setup.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadSetup();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Election Setup Review
          </h1>
          <p className="mt-2 text-slate-600">
            Read-only view of the active election setup.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            Loading election setup...
          </div>
        ) : !activeElectionId || !setupData ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            There is no active election setup to review right now.
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900">
                {setupData.election.title}
              </h2>
              <p className="mt-2 text-slate-600">
                {setupData.election.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-4">
              {setupData.positions.map((position) => (
                <div key={position.id} className="rounded-2xl bg-white shadow-md p-8">
                  <h3 className="text-lg font-bold text-slate-900">
                    {position.title}
                  </h3>
                  <p className="mt-2 text-slate-600">
                    {position.description || 'No description provided.'}
                  </p>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {position.candidates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        No candidates configured for this position.
                      </div>
                    ) : (
                      position.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-900">
                                {candidate.full_name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {candidate.department || '—'} • {candidate.level || '—'}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                candidate.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {candidate.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-slate-600">
                            {candidate.manifesto || 'No manifesto provided.'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OfficerSetupReviewPage;