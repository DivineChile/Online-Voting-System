import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import {
  fetchAdminElections,
  createPosition,
} from '../../api/adminPositionApi';

function CreatePositionPage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);

  const [formData, setFormData] = useState({
    election_id: '',
    title: '',
    description: '',
    display_order: 1,
    max_selections: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await createPosition(session?.access_token, {
        ...formData,
        display_order: Number(formData.display_order),
        max_selections: Number(formData.max_selections),
      });

      setSuccessMessage(result.message || 'Position created successfully.');
      setFormData({
        election_id: '',
        title: '',
        description: '',
        display_order: 1,
        max_selections: 1,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create position.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl bg-white shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Position</h1>
          <p className="mt-2 text-slate-600">
            Add a voting position to an existing election.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select election
            </label>
            <select
              name="election_id"
              value={formData.election_id}
              onChange={handleChange}
              required
              disabled={loadingElections}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 bg-white"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Position title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="e.g. President"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Optional description for this position"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Display order
              </label>
              <input
                type="number"
                min="1"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Max selections
              </label>
              <input
                type="number"
                min="1"
                name="max_selections"
                value={formData.max_selections}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || loadingElections}
              className="rounded-xl bg-slate-900 px-6 py-3 text-white font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating position...' : 'Create position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePositionPage;