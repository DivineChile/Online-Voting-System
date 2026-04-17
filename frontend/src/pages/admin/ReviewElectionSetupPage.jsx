import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { fetchAdminElections } from '../../api/adminElectionApi';
import { fetchElectionSetup } from '../../api/adminSetupApi';
import {
  updateCandidate,
  updateCandidateStatus,
} from '../../api/adminCandidateApi';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
}

function ReviewElectionSetupPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [setupData, setSetupData] = useState(null);

  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingSetup, setLoadingSetup] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [pageMessage, setPageMessage] = useState('');
  const [editingCandidateId, setEditingCandidateId] = useState('');
  const [savingCandidateId, setSavingCandidateId] = useState('');
  const [statusUpdatingCandidateId, setStatusUpdatingCandidateId] = useState('');
  const [candidateForm, setCandidateForm] = useState({
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    manifesto: '',
    image_url: '',
  });

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
    async function loadSetup() {
      if (!selectedElectionId) {
        setSetupData(null);
        return;
      }

      setLoadingSetup(true);
      setErrorMessage('');
      setPageMessage('');
      setEditingCandidateId('');

      try {
        const result = await fetchElectionSetup(
          session?.access_token,
          selectedElectionId
        );
        setSetupData(result.data);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load election setup.');
        setSetupData(null);
      } finally {
        setLoadingSetup(false);
      }
    }

    if (session?.access_token) {
      loadSetup();
    }
  }, [session, selectedElectionId]);

  function startEditingCandidate(candidate) {
    setEditingCandidateId(candidate.id);
    setCandidateForm({
      full_name: candidate.full_name || '',
      matric_no: candidate.matric_no || '',
      department: candidate.department || '',
      level: candidate.level || '',
      manifesto: candidate.manifesto || '',
      image_url: candidate.image_url || '',
    });
    setErrorMessage('');
    setPageMessage('');
  }

  function cancelEditingCandidate() {
    setEditingCandidateId('');
    setCandidateForm({
      full_name: '',
      matric_no: '',
      department: '',
      level: '',
      manifesto: '',
      image_url: '',
    });
  }

  function handleCandidateFormChange(event) {
    const { name, value } = event.target;

    setCandidateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleCandidateSave(candidateId) {
    setSavingCandidateId(candidateId);
    setErrorMessage('');
    setPageMessage('');

    try {
      const result = await updateCandidate(
        session?.access_token,
        candidateId,
        candidateForm
      );

      setSetupData((prev) => ({
        ...prev,
        positions: prev.positions.map((position) => ({
          ...position,
          candidates: position.candidates.map((candidate) =>
            candidate.id === candidateId ? result.data : candidate
          ),
        })),
      }));

      setPageMessage(result.message || 'Candidate updated successfully.');
      cancelEditingCandidate();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update candidate.');
    } finally {
      setSavingCandidateId('');
    }
  }

  async function handleCandidateStatusToggle(candidateId, nextStatus) {
    setStatusUpdatingCandidateId(candidateId);
    setErrorMessage('');
    setPageMessage('');

    try {
      const result = await updateCandidateStatus(
        session?.access_token,
        candidateId,
        nextStatus
      );

      setSetupData((prev) => ({
        ...prev,
        positions: prev.positions.map((position) => ({
          ...position,
          candidates: position.candidates.map((candidate) =>
            candidate.id === candidateId ? result.data : candidate
          ),
        })),
      }));

      setPageMessage(result.message || 'Candidate status updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update candidate status.');
    } finally {
      setStatusUpdatingCandidateId('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Review Election Setup
              </h1>
              <p className="mt-2 text-slate-600">
                View positions and candidates for a selected election.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/positions/create"
                className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-slate-900 font-medium hover:bg-slate-200 transition"
              >
                Create Position
              </Link>

              <Link
                to="/admin/candidates/create"
                className="inline-flex rounded-xl bg-slate-900 px-4 py-3 text-white font-medium hover:bg-slate-800 transition"
              >
                Create Candidate
              </Link>
            </div>
          </div>
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

        {loadingSetup ? (
          <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
            Loading election setup...
          </div>
        ) : null}

        {!loadingSetup && setupData ? (
          <>
            <div className="rounded-2xl bg-white shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900">
                {setupData.election.title}
              </h2>
              <p className="mt-2 text-slate-600">
                {setupData.election.description || 'No description provided.'}
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-slate-500">Status</p>
                  <p className="mt-1 font-medium capitalize text-slate-900">
                    {setupData.election.status}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-slate-500">Start time</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatDateTime(setupData.election.start_time)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <p className="text-slate-500">End time</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {formatDateTime(setupData.election.end_time)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {setupData.positions.length === 0 ? (
                <div className="rounded-2xl bg-white shadow-md p-8 text-sm text-slate-600">
                  No positions have been added to this election yet.
                </div>
              ) : (
                setupData.positions.map((position) => (
                  <div
                    key={position.id}
                    className="rounded-2xl bg-white shadow-md p-8"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {position.title}
                        </h3>
                        <p className="mt-1 text-slate-600">
                          {position.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          Order: {position.display_order}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          Max selections: {position.max_selections}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Candidates
                      </h4>

                      {position.candidates.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                          No candidates added for this position yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {position.candidates.map((candidate) => {
                            const isEditing = editingCandidateId === candidate.id;

                            return (
                              <div
                                key={candidate.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                              >
                                {!isEditing ? (
                                  <>
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-medium text-slate-900">
                                          {candidate.full_name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                          {candidate.department || 'No department'} •{' '}
                                          {candidate.level || 'No level'}
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

                                    <div className="mt-3 text-xs text-slate-500">
                                      Matric No: {candidate.matric_no || '—'}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEditingCandidate(candidate)}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCandidateStatusToggle(
                                            candidate.id,
                                            !candidate.is_active
                                          )
                                        }
                                        disabled={statusUpdatingCandidateId === candidate.id}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                      >
                                        {statusUpdatingCandidateId === candidate.id
                                          ? 'Updating...'
                                          : candidate.is_active
                                          ? 'Deactivate'
                                          : 'Activate'}
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      name="full_name"
                                      value={candidateForm.full_name}
                                      onChange={handleCandidateFormChange}
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                      placeholder="Full name"
                                    />

                                    <input
                                      type="text"
                                      name="matric_no"
                                      value={candidateForm.matric_no}
                                      onChange={handleCandidateFormChange}
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                      placeholder="Matric number"
                                    />

                                    <input
                                      type="text"
                                      name="department"
                                      value={candidateForm.department}
                                      onChange={handleCandidateFormChange}
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                      placeholder="Department"
                                    />

                                    <input
                                      type="text"
                                      name="level"
                                      value={candidateForm.level}
                                      onChange={handleCandidateFormChange}
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                      placeholder="Level"
                                    />

                                    <textarea
                                      name="manifesto"
                                      value={candidateForm.manifesto}
                                      onChange={handleCandidateFormChange}
                                      rows="3"
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                      placeholder="Manifesto"
                                    />

                                    <input
                                      type="text"
                                      name="image_url"
                                      value={candidateForm.image_url}
                                      onChange={handleCandidateFormChange}
                                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                      placeholder="Image URL"
                                    />

                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleCandidateSave(candidate.id)}
                                        disabled={savingCandidateId === candidate.id}
                                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                                      >
                                        {savingCandidateId === candidate.id
                                          ? 'Saving...'
                                          : 'Save'}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={cancelEditingCandidate}
                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ReviewElectionSetupPage;