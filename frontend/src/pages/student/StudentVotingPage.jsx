import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchActiveElectionForStudent,
  submitStudentBallot,
} from '../../api/studentVotingApi';

function StudentVotingPage() {
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pageMessage, setPageMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState({});

  useEffect(() => {
    async function loadVotingPage() {
      try {
        const result = await fetchActiveElectionForStudent(session?.access_token);
        console.log(result.data);
        setElectionData(result.data || null);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load active election.');
        setElectionData(null);
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadVotingPage();
    }
  }, [session]);

  const allPositionsAnswered = useMemo(() => {
    if (!electionData?.positions?.length) return false;

    return electionData.positions.every(
      (position) => selectedCandidates[position.id]
    );
  }, [electionData, selectedCandidates]);

  function handleCandidateSelect(positionId, candidateId) {
    setSelectedCandidates((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  }

  async function handleSubmitBallot() {
    if (!electionData?.election?.id) return;

    setSubmitting(true);
    setErrorMessage('');
    setPageMessage('');

    try {
      const selections = Object.entries(selectedCandidates).map(
        ([position_id, candidate_id]) => ({
          position_id,
          candidate_id,
        })
      );

      const result = await submitStudentBallot(session?.access_token, {
        election_id: electionData.election.id,
        selections,
      });

      setPageMessage(result.message || 'Ballot submitted successfully.');
      setElectionData((prev) => ({
        ...prev,
        has_voted: true,
      }));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit ballot.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
          Loading voting page...
        </div>
      </div>
    );
  }

  if (errorMessage && !electionData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!electionData?.election) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
          No active election is available.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {electionData.election.title}
          </h1>
          <p className="mt-2 text-slate-600">
            {electionData.election.description || 'No description provided.'}
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {pageMessage ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {pageMessage}
          </div>
        ) : null}

        {electionData.has_voted ? (
          <div className="rounded-2xl bg-white shadow-md p-8">
            <p className="text-lg font-semibold text-slate-900">
              You have already voted in this election.
            </p>
            <p className="mt-2 text-slate-600">
              Your ballot has already been recorded successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {electionData.positions.map((position) => (
                <div
                  key={position.id}
                  className="rounded-2xl bg-white shadow-md p-8"
                >
                  <h2 className="text-lg font-bold text-slate-900">
                    {position.title}
                  </h2>
                  <p className="mt-2 text-slate-600">
                    {position.description || 'Select one candidate for this position.'}
                  </p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {position.candidates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        No candidates available for this position.
                      </div>
                    ) : (
                      position.candidates.map((candidate) => {
                        const isSelected =
                          selectedCandidates[position.id] === candidate.id;

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() =>
                              handleCandidateSelect(position.id, candidate.id)
                            }
                            className={`rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <p className="font-semibold">{candidate.full_name}</p>
                            <p
                              className={`mt-1 text-sm ${
                                isSelected ? 'text-slate-200' : 'text-slate-500'
                              }`}
                            >
                              {candidate.department || 'No department'} •{' '}
                              {candidate.level || 'No level'}
                            </p>

                            <p
                              className={`mt-3 text-sm ${
                                isSelected ? 'text-slate-100' : 'text-slate-600'
                              }`}
                            >
                              {candidate.manifesto || 'No manifesto provided.'}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white shadow-md p-8">
              <button
                type="button"
                onClick={handleSubmitBallot}
                disabled={!allPositionsAnswered || submitting}
                className="rounded-xl bg-slate-900 px-6 py-3 text-white font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting ballot...' : 'Submit Ballot'}
              </button>

              {!allPositionsAnswered ? (
                <p className="mt-3 text-sm text-slate-500">
                  Please make one selection for every position before submitting.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentVotingPage;