import { useState } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { createElection } from '../../api/adminElectionApi';

function CreateElectionPage() {
  const { session } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      const result = await createElection(session?.access_token, formData);

      setSuccessMessage(result.message || 'Election created successfully.');
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
      });
    } catch (error) {
      setErrorMessage(error.message || 'Failed to create election.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl bg-white shadow-md p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Election</h1>
          <p className="mt-2 text-slate-600">
            Start by creating an election in draft mode.
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
              Election title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="e.g. SUG Election 2026"
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
              placeholder="Add a short description of this election"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Start date and time
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                End date and time
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-900 px-6 py-3 text-white font-medium disabled:opacity-60"
            >
              {submitting ? 'Creating election...' : 'Create election'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateElectionPage;