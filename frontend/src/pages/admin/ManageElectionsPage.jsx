import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchAdminElections,
  updateElection,
  updateElectionStatus,
} from '../../api/adminElectionApi';

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString();
}

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (num) => String(num).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'closed':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'published':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

function ManageElectionsPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [updatingElectionId, setUpdatingElectionId] = useState('');
  const [editingElectionId, setEditingElectionId] = useState('');
  const [savingElectionId, setSavingElectionId] = useState('');
  const [electionForm, setElectionForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    async function loadElections() {
      try {
        const result = await fetchAdminElections(session?.access_token);
        setElections(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load elections.');
      } finally {
        setLoading(false);
      }
    }

    if (session?.access_token) {
      loadElections();
    }
  }, [session]);

  function startEditingElection(election) {
    setEditingElectionId(election.id);
    setElectionForm({
      title: election.title || '',
      description: election.description || '',
      start_time: toDateTimeLocal(election.start_time),
      end_time: toDateTimeLocal(election.end_time),
    });
    setPageMessage('');
    setErrorMessage('');
  }

  function cancelEditingElection() {
    setEditingElectionId('');
    setElectionForm({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
    });
  }

  function handleElectionFormChange(event) {
    const { name, value } = event.target;

    setElectionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleElectionSave(electionId) {
    setSavingElectionId(electionId);
    setPageMessage('');
    setErrorMessage('');

    try {
      const result = await updateElection(session?.access_token, electionId, electionForm);

      setElections((prev) =>
        prev.map((election) =>
          election.id === electionId ? result.data : election
        )
      );

      setPageMessage(result.message || 'Election updated successfully.');
      cancelEditingElection();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update election.');
    } finally {
      setSavingElectionId('');
    }
  }

  async function handleStatusChange(electionId, nextStatus) {
    setErrorMessage('');
    setPageMessage('');
    setUpdatingElectionId(electionId);

    try {
      const result = await updateElectionStatus(
        session?.access_token,
        electionId,
        nextStatus
      );

      setElections((prev) =>
        prev.map((election) =>
          election.id === electionId ? result.data : election
        )
      );

      setPageMessage(result.message || 'Election status updated successfully.');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update election status.');
    } finally {
      setUpdatingElectionId('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Manage Elections
              </h1>
              <p className="mt-2 text-slate-600">
                View all elections and control their lifecycle.
              </p>
            </div>

            <Link
              to="/admin/elections/create"
              className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
            >
              Create Election
            </Link>
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

        <div className="rounded-2xl bg-white shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-sm text-slate-600">Loading elections...</div>
          ) : elections.length === 0 ? (
            <div className="p-8 text-sm text-slate-600">
              No elections found yet.
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {elections.map((election) => {
                const isEditing = editingElectionId === election.id;

                return (
                  <div
                    key={election.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    {!isEditing ? (
                      <>
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div>
                            <h2 className="text-lg font-bold text-slate-900">
                              {election.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                              {election.description || 'No description provided.'}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                                election.status
                              )}`}
                            >
                              {election.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                            <p className="text-slate-500">Start</p>
                            <p className="mt-1 font-medium text-slate-900">
                              {formatDateTime(election.start_time)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                            <p className="text-slate-500">End</p>
                            <p className="mt-1 font-medium text-slate-900">
                              {formatDateTime(election.end_time)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                            <p className="text-slate-500">Published</p>
                            <p className="mt-1 font-medium text-slate-900">
                              {formatDateTime(election.published_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingElection(election)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          {['draft', 'active', 'closed', 'published'].map(
                            (statusOption) => (
                              <button
                                key={statusOption}
                                type="button"
                                onClick={() =>
                                  handleStatusChange(election.id, statusOption)
                                }
                                disabled={
                                  updatingElectionId === election.id ||
                                  election.status === statusOption
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                {updatingElectionId === election.id
                                  ? 'Updating...'
                                  : statusOption}
                              </button>
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <input
                          type="text"
                          name="title"
                          value={electionForm.title}
                          onChange={handleElectionFormChange}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                          placeholder="Election title"
                        />

                        <textarea
                          name="description"
                          value={electionForm.description}
                          onChange={handleElectionFormChange}
                          rows="4"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                          placeholder="Description"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="datetime-local"
                            name="start_time"
                            value={electionForm.start_time}
                            onChange={handleElectionFormChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                          />

                          <input
                            type="datetime-local"
                            name="end_time"
                            value={electionForm.end_time}
                            onChange={handleElectionFormChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleElectionSave(election.id)}
                            disabled={savingElectionId === election.id}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                          >
                            {savingElectionId === election.id ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditingElection}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
    </div>
  );
}

export default ManageElectionsPage;