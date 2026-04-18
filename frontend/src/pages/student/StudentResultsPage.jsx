import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { fetchStudentPublishedResults } from '../../api/resultsApi';

function StudentResultsPage() {
  const { session } = useAuth();

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadResults() {
      try {
        const result = await fetchStudentPublishedResults(session?.access_token);
        setResultsData(result.data);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load published results.');
        setResultsData(null);
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadResults();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
          Loading published results...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
          No published results are available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Published Results
          </h1>
          <p className="mt-2 text-slate-600">{resultsData.election.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            Total ballots submitted: {resultsData.total_ballots}
          </p>
        </div>

        <div className="space-y-4">
          {resultsData.positions.map((position) => (
            <div key={position.id} className="rounded-2xl bg-white shadow-md p-8">
              <h2 className="text-lg font-bold text-slate-900">
                {position.title}
              </h2>

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
      </div>
    </div>
  );
}

export default StudentResultsPage;