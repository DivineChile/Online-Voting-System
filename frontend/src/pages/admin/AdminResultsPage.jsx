import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { fetchAdminElections } from '../../api/adminElectionApi';
import { fetchAdminElectionResults } from '../../api/resultsApi';

function AdminResultsPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [resultsData, setResultsData] = useState(null);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadElections() {
      try {
        const result = await fetchAdminElections(session?.access_token);
        setElections(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load elections.');
      } finally {
        setLoadingElections(false);
      }
    }

    if (session?.access_token) {
      loadElections();
    }
  }, [session]);

  useEffect(() => {
    async function loadResults() {
      if (!selectedElectionId) {
        setResultsData(null);
        return;
      }

      setLoadingResults(true);
      setErrorMessage('');

      try {
        const result = await fetchAdminElectionResults(
          session?.access_token,
          selectedElectionId
        );
        setResultsData(result.data);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load election results.');
        setResultsData(null);
      } finally {
        setLoadingResults(false);
      }
    }

    if (session?.access_token) {
      loadResults();
    }
  }, [session, selectedElectionId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">Election Results</h1>
          <p className="mt-2 text-slate-600">
            View computed vote counts and winners by position.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white shadow-md p-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select election
          </label>
          <select
            value={selectedElectionId}
            onChange={(event) => setSelectedElectionId(event.target.value)}
            disabled={loadingElections}
            className="w-full md:max-w-xl rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 bg-white"
          >
            <option value="">
              {loadingElections ? 'Loading elections...' : 'Choose an election'}
            </option>
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.title} ({election.status})
              </option>
            ))}
          </select>
        </div>

        {loadingResults ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            Loading results...
          </div>
        ) : null}

        {!loadingResults && resultsData ? (
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

                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 text-sm font-semibold text-slate-700">
                            Candidate
                          </th>
                          <th className="text-left py-3 text-sm font-semibold text-slate-700">
                            Department
                          </th>
                          <th className="text-left py-3 text-sm font-semibold text-slate-700">
                            Level
                          </th>
                          <th className="text-left py-3 text-sm font-semibold text-slate-700">
                            Votes
                          </th>
                          <th className="text-left py-3 text-sm font-semibold text-slate-700">
                            Winner
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {position.candidates.map((candidate) => {
                          const isWinner = position.winners.some(
                            (winner) => winner.id === candidate.id
                          );

                          return (
                            <tr key={candidate.id} className="border-b border-slate-100">
                              <td className="py-3 text-sm text-slate-900">
                                {candidate.full_name}
                              </td>
                              <td className="py-3 text-sm text-slate-600">
                                {candidate.department || '—'}
                              </td>
                              <td className="py-3 text-sm text-slate-600">
                                {candidate.level || '—'}
                              </td>
                              <td className="py-3 text-sm font-medium text-slate-900">
                                {candidate.votes}
                              </td>
                              <td className="py-3 text-sm">
                                {isWinner ? (
                                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                                    Winner
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AdminResultsPage;