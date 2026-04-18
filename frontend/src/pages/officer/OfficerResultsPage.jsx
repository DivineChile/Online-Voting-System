import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { fetchOfficerPublishedResults } from '../../api/officerApi';

function OfficerResultsPage() {
  const { session } = useAuth();

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadResults() {
      try {
        const result = await fetchOfficerPublishedResults(session?.access_token);
        setResultsData(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load published results.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadResults();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Published Results
          </h1>
          <p className="mt-2 text-slate-600">
            Read-only published election results.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            Loading published results...
          </div>
        ) : !resultsData ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            No published election results are available yet.
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900">
                {resultsData.election.title}
              </h2>
              <p className="mt-2 text-slate-600">
                Total ballots submitted: {resultsData.total_ballots}
              </p>
            </div>

            <div className="space-y-4">
              {resultsData.positions.map((position) => (
                <div key={position.id} className="rounded-2xl bg-white shadow-md p-8">
                  <h3 className="text-lg font-bold text-slate-900">
                    {position.title}
                  </h3>

                  <div className="mt-5 space-y-3">
                    {position.candidates.map((candidate) => {
                      const isWinner = position.winners.some(
                        (winner) => winner.id === candidate.id
                      );

                      return (
                        <div
                          key={candidate.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {candidate.full_name}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {candidate.department || '—'} • {candidate.level || '—'}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {candidate.votes} vote{candidate.votes === 1 ? '' : 's'}
                            </p>
                            {isWinner ? (
                              <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                Winner
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
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

export default OfficerResultsPage;