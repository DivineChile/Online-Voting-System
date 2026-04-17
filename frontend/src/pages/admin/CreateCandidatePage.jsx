import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { fetchAdminElections } from '../../api/adminPositionApi';
import {
  fetchPositionsByElection,
  createCandidate,
} from '../../api/adminCandidateApi';

function CreateCandidatePage() {
  const { session } = useAuth();

  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);

  const [formData, setFormData] = useState({
    election_id: '',
    position_id: '',
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    manifesto: '',
    image_url: '',
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

  useEffect(() => {
    async function loadPositions() {
      if (!formData.election_id) {
        setPositions([]);
        return;
      }

      setLoadingPositions(true);

      try {
        const result = await fetchPositionsByElection(
          session?.access_token,
          formData.election_id
        );
        setPositions(result.data || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load positions.');
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    }

    if (session?.access_token) {
      loadPositions();
    }
  }, [session, formData.election_id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'election_id' ? { position_id: '' } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await createCandidate(session?.access_token, formData);

      setSuccessMessage(result.message || 'Candidate created successfully.');
      setFormData({
        election_id: '',
        position_id: '',
        full_name: '',
        matric_no: '',
        department: '',
        level: '',
        manifesto: '',
        image_url: '',
      });
      setPositions([]);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create candidate.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl bg-white shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Candidate</h1>
          <p className="mt-2 text-slate-600">
            Add a candidate to a selected position in an election.
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
              Select position
            </label>
            <select
              name="position_id"
              value={formData.position_id}
              onChange={handleChange}
              required
              disabled={!formData.election_id || loadingPositions}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 bg-white"
            >
              <option value="">
                {!formData.election_id
                  ? 'Choose an election first'
                  : loadingPositions
                  ? 'Loading positions...'
                  : 'Choose a position'}
              </option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Enter candidate full name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Matric number
              </label>
              <input
                type="text"
                name="matric_no"
                value={formData.matric_no}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="Enter matric number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="Enter department"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Level
            </label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="e.g. HND I"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Manifesto
            </label>
            <textarea
              name="manifesto"
              value={formData.manifesto}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Optional candidate manifesto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Optional image URL"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || loadingElections || loadingPositions}
              className="rounded-xl bg-slate-900 px-6 py-3 text-white font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating candidate...' : 'Create candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCandidatePage;