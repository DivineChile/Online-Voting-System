import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { fetchOfficerActiveElection } from '../../api/officerApi';

function OfficerActiveElectionPage() {
  const { session } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadActiveElection() {
      try {
        const result = await fetchOfficerActiveElection(session?.access_token);
        setData(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load active election.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadActiveElection();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">Active Election</h1>
          <p className="mt-2 text-slate-600">
            Monitor the current election and participating candidates.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            Loading active election...
          </div>
        ) : data?.election ? (
          <>
            <div className="rounded-2xl bg-white shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900">
                {data.election.title}
              </h2>
              <p className="mt-2 text-slate-600">
                {data.election.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-4">
              {data.positions.map((position) => (
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
                        No active candidates available for this position.
                      </div>
                    ) : (
                      position.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="font-medium text-slate-900">
                            {candidate.full_name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {candidate.department || '—'} • {candidate.level || '—'}
                          </p>
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
        ) : (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            There is no active election available right now.
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerActiveElectionPage;